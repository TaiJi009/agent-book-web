#!/usr/bin/env node
/**
 * extract-book.mjs — 书稿正文抽取管线（PLAN.md §4）
 *
 * 用法：node scripts/extract-book.mjs [--locale=en]
 *   默认 zh：book/*.md（pandoc 方言）→ src/content/chapters/*.json
 *   en：book-en/*.md → src/content/en/chapters/*.json，图片 → public/images/book-en/
 * 审计原则：任何未识别节点 fail-fast，杜绝静默丢内容。
 *
 * 处理范围（对照 PLAN.md 数据模型）：
 *   标题({.unnumbered} 清洗) / 段落 / 引用块 / 实验块(> **实验|Experiment X-Y …**)
 *   提示块(> **阅读提示…|Reading Tip…**) / 代码围栏(Shiki 双主题预着色) / 图片({height=} 清洗)
 *   表格 / 数学($$…$$，KaTeX 构建期渲染) / 脚注([^id] 正则预处理) / 链接(内链→路由)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve, basename, extname } from 'node:path'
import { execSync } from 'node:child_process'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { visit } from 'unist-util-visit'
import katex from 'katex'
import { createHighlighter } from 'shiki'

const ROOT = resolve(import.meta.dirname, '..')
const BOOK = resolve(ROOT, '../Book/AI-Agents-in-Depth')
const LOCALE = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1] === 'en' ? 'en' : 'zh'
const BOOKMD = join(BOOK, LOCALE === 'en' ? 'book-en' : 'book')
const OUT = LOCALE === 'en' ? join(ROOT, 'src/content/en/chapters') : join(ROOT, 'src/content/chapters')
const IMG_OUT = LOCALE === 'en' ? join(ROOT, 'public/images/book-en') : join(ROOT, 'public/images/book')
const IMG_PREFIX = LOCALE === 'en' ? 'images/book-en/' : 'images/book/'

/* ── 语言模式表：实验块/提示块/思考题标题的 zh|en 识别 ── */
const PATTERNS = LOCALE === 'en'
  ? {
      experiment: /^Experiment\s*(\d+)-(\d+)/,
      // book-en 提示类引用块头（大小写不定，label 取实际匹配文本）
      hint: /^(Reading Tip|Reading Guide|Reading Note|Technical Note|Supplementary Note|Terminology:|Background:)/i,
      questions: (text) => /^(Thought Questions|Questions for Reflection)$/.test(text),
      sourceDir: 'book-en',
    }
  : {
      experiment: /^实验\s*(\d+)-(\d+)/,
      hint: /^(阅读提示|本章导读|技术门槛提示|术语说明|阅读指引|前言提示|背景：)/,
      questions: (text) => text === '思考题',
      sourceDir: 'book',
    }

const SHIKI_LANGS = [
  'python', 'javascript', 'typescript', 'tsx', 'json', 'jsonc', 'ini', 'bash', 'yaml', 'text',
  'html', 'css', 'java', 'c', 'cpp', 'go', 'rust', 'lua', 'toml', 'markdown', 'sql', 'xml',
]
const LANG_ALIAS = { env: 'ini' }

/* ── pandoc 方言清洗 ── */
const stripPandocAttrs = (s) => s.replace(/\s*\{[^}]*\}\s*$/g, '').trim()

/* ── 脚注预处理：定义提取为 map，引用转为行内 HTML 标记 ── */
function preprocessFootnotes(md) {
  const defs = new Map()
  const lines = md.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const m = lines[i].match(/^\[\^([^\]]+)\]:\s*(.*)$/)
    if (m) {
      const id = m[1]
      const parts = [m[2]]
      i++
      while (i < lines.length && lines[i].trim() !== '' && /^\s{4,}\S/.test(lines[i])) {
        parts.push(lines[i].trim())
        i++
      }
      defs.set(id, parts.join('\n'))
      continue
    }
    out.push(lines[i])
    i++
  }
  const body = out.join('\n').replace(/\[\^([^\]]+)\]/g, (_, id) => {
    if (!defs.has(id)) return `[[缺失脚注:${id}]]`
    return `<sup class="fnref" data-fn="${id}">[${id}]</sup>`
  })
  return { body, defs }
}

const mdast = unified().use(remarkParse).use(remarkGfm).use(remarkMath)

/* ── 行内节点 → 可序列化描述符（运行期零 markdown 依赖） ── */
function inline(node, audit) {
  switch (node.type) {
    case 'text': return { t: 'text', v: stripPandocAttrsInline(node.value) }
    case 'strong': return { t: 'strong', c: node.children.flatMap((n) => inline(n, audit)) }
    case 'emphasis': return { t: 'em', c: node.children.flatMap((n) => inline(n, audit)) }
    case 'delete': return { t: 'del', c: node.children.flatMap((n) => inline(n, audit)) }
    case 'inlineCode': return { t: 'code', v: node.value }
    case 'inlineMath': return { t: 'math', v: node.value, display: false, html: katexHTML(node.value, false) }
    case 'link': {
      const href = resolveLink(node.url)
      return { t: 'a', href, ext: /^https?:/.test(node.url), c: node.children.flatMap((n) => inline(n, audit)) }
    }
    case 'image': {
      audit.imgInline++
      return { t: 'img', src: imgSrc(node.url), alt: stripPandocAttrs(node.alt || '') }
    }
    case 'break': return { t: 'br' }
    case 'html': {
      if (node.value === '</sup>') return { t: 'skip' } // fnref 开标签已产出描述符
      const m = node.value.match(/^<sup class="fnref" data-fn="([^"]+)">/)
      if (m) return { t: 'fnref', id: m[1] }
      audit.unknownInline.push(node.value.slice(0, 60))
      return { t: 'text', v: node.value }
    }
    default:
      audit.unknownInline.push(node.type)
      return { t: 'text', v: textOf(node) }
  }
}
const stripPandocAttrsInline = (s) => s

/* 正文首个 h1 与章标题重复 → 不进 blocks */
const isDuplicateH1 = (node) => node.type === 'heading' && node.depth === 1

/* ── 块级节点 → Block ── */
function block(node, audit) {
  switch (node.type) {
    case 'heading': {
      const depth = node.depth
      const text = stripPandocAttrs(node.children.map((c) => textOf(c)).join(''))
      return { kind: 'heading', depth, text, id: '' /* 由上层编号 */ }
    }
    case 'paragraph': {
      // 纯图片段落 → figure（lightbox 用）
      const imgs = node.children.filter((n) => n.type === 'image')
      if (imgs.length > 0 && node.children.every((n) => n.type === 'image' || textOf(n).trim() === '')) {
        return imgs.map((img) => ({ kind: 'figure', src: imgSrc(img.url), alt: stripPandocAttrs(img.alt || '') }))
      }
      return { kind: 'p', c: node.children.flatMap((n) => inline(n, audit)).filter((d) => d.t !== 'skip') }
    }
    case 'blockquote': {
      // 实验块 / 提示块识别（strong 节点已被 textOf 剥掉 **，直接匹配纯文本）
      const first = node.children[0]
      const headText = first?.children?.map((c) => textOf(c)).join('') ?? ''
      const exp = headText.match(PATTERNS.experiment)
      const hint = headText.match(PATTERNS.hint)
      if (exp) {
        const [_, ch, no] = exp
        const stars = (headText.match(/★/g) || []).length
        const title = headText
          .slice(exp[0].length)
          .replace(/^[\s★☆：:]+/, '')
          .trim()
        return {
          kind: 'experiment',
          id: `${ch}-${no}`,
          title,
          stars,
          body: node.children.flatMap((n) => blockInQuote(n, audit)),
        }
      }
      if (hint) {
        return {
          kind: 'callout', variant: 'hint', label: hint[1],
          body: node.children.flatMap((n) => blockInQuote(n, audit)),
        }
      }
      return { kind: 'quote', c: node.children.flatMap((n) => blockInQuote(n, audit)) }
    }
    case 'code':
      return { kind: 'code', lang: node.lang || 'text', value: node.value }
    case 'math':
      return { kind: 'math', display: true, v: node.value, html: katexHTML(node.value, true) }
    case 'table': {
      const align = node.align || []
      const [head, ...rows] = node.children
      return {
        kind: 'table',
        align,
        header: head.children.map((c) => c.children.flatMap((n) => inline(n, audit))),
        rows: rows.map((r) => r.children.map((c) => c.children.flatMap((n) => inline(n, audit)))),
      }
    }
    case 'list':
      return {
        kind: 'list', ordered: node.ordered ?? false,
        items: node.children.map((li) => li.children.flatMap((n) => (n.type === 'listItem' ? [] : block(n, audit)))),
      }
    case 'listItem':
      audit.unknown.push(`listItem@${node.position?.start?.line}`)
      return { kind: 'p', c: [] }
    case 'thematicBreak': return { kind: 'hr' }
    case 'html':
      audit.unknown.push(`html:${node.value.slice(0, 40)}`)
      return { kind: 'p', c: [] }
    default:
      audit.unknown.push(`${node.type}@${node.position?.start?.line}`)
      return { kind: 'p', c: [] }
  }
}

/* 引用块内部：段落不再作为 figure 拆分 */
function blockInQuote(node, audit) {
  if (node.type === 'paragraph') {
    const imgs = node.children.filter((n) => n.type === 'image')
    if (imgs.length > 0 && node.children.every((n) => n.type === 'image' || textOf(n).trim() === '')) {
      return imgs.map((img) => ({ kind: 'figure', src: imgSrc(img.url), alt: stripPandocAttrs(img.alt || '') }))
    }
  }
  const out = block(node, audit)
  return Array.isArray(out) ? out : [out]
}

const textOf = (node) =>
  node.type === 'text' || node.type === 'inlineCode'
    ? node.value
    : node.children
      ? node.children.map(textOf).join('')
      : ''

function resolveLink(url) {
  const m = url.match(/^(chapter\d+|introduction|afterword)\.md(#.*)?$/)
  if (m) {
    const slug = m[1] === 'introduction' ? 'intro' : m[1] === 'afterword' ? 'outro' : m[1].replace('chapter', '')
    // en 章节内链带 /en 前缀，站内路由随语言走
    return `#${LOCALE === 'en' ? '/en' : ''}/chapter/${slug}${m[2] ?? ''}`
  }
  if (/^https?:/.test(url) || url.startsWith('#') || url.startsWith('mailto:')) return url
  auditGlobals.unknownLinks.push(url)
  return url
}

function imgSrc(url) {
  return url.replace(/^images\//, IMG_PREFIX)
}

let katexWarned = 0
function katexHTML(tex, display) {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: true, output: 'html', strict: false })
  } catch (e) {
    katexWarned++
    return null
  }
}

/* ── 章节抽取 ── */
const FILES = [
  { slug: 'intro', file: 'introduction.md' },
  ...Array.from({ length: 10 }, (_, i) => ({ slug: String(i + 1), file: `chapter${i + 1}.md` })),
  { slug: 'outro', file: 'afterword.md' },
]

const sourceCommit = execSync('git -C "' + BOOK + '" rev-parse --short HEAD').toString().trim()
const highlighter = await createHighlighter({ themes: ['vitesse-light', 'vitesse-dark'], langs: SHIKI_LANGS })

mkdirSync(OUT, { recursive: true })
mkdirSync(IMG_OUT, { recursive: true })

// 复制图片（幂等：按修改时间跳过）
let copied = 0
for (const f of readdirSync(join(BOOKMD, 'images'))) {
  const src = join(BOOKMD, 'images', f)
  const dst = join(IMG_OUT, f)
  if (!existsSync(dst) || readFileSync(src).length !== readFileSync(dst).length) {
    writeFileSync(dst, readFileSync(src))
    copied++
  }
}
console.log(`images: 复制 ${copied} 张到 ${IMG_OUT.replace(ROOT + '/', '')}/`)

const auditGlobals = { unknownLinks: [] }
let totalUnknown = 0

for (const { slug, file } of FILES) {
  const raw = readFileSync(join(BOOKMD, file), 'utf8')
  const { body, defs } = preprocessFootnotes(raw)
  const audit = { unknown: [], unknownInline: [], imgInline: 0 }

  const tree = mdast.parse(body)
  const blocks = []
  const toc = []
  const experiments = []
  const questions = []
  let questionsMode = false
  let headingSeq = 0

  const push = (b) => {
    if (b.kind === 'heading') {
      headingSeq++
      b.id = `h-${b.depth}-${headingSeq}`
      if (b.depth <= 3) toc.push({ id: b.id, depth: b.depth, text: b.text })
      if (PATTERNS.questions(b.text)) questionsMode = true
      else if (b.depth <= 2) questionsMode = false
    }
    if (b.kind === 'experiment') {
      experiments.push({ id: b.id, title: b.title, stars: b.stars })
      questionsMode = false
    }
    if (questionsMode && b.kind !== 'heading') questions.push(b)
    blocks.push(b)
  }

  let chapterTitle = ''
  for (const node of tree.children) {
    if (isDuplicateH1(node)) {
      chapterTitle = stripPandocAttrs(node.children.map((c) => textOf(c)).join(''))
      continue
    }
    const out = block(node, audit)
    Array.isArray(out) ? out.forEach(push) : push(out)
  }

  // 脚注定义渲染（KaTeX/行内格式）
  const footnotes = []
  for (const [id, text] of defs) {
    const t = mdast.parse(text)
    footnotes.push({ id, c: t.children.flatMap((n) => (n.type === 'paragraph' ? n.children.flatMap((x) => inline(x, audit)) : [])) })
  }

  // 代码块 Shiki 双主题预着色（defaultColor:false → CSS 变量随主题切换）
  for (const b of blocks) {
    if (b.kind === 'code') {
      const lang = SHIKI_LANGS.includes(b.lang) ? b.lang : LANG_ALIAS[b.lang] ?? 'text'
      b.html = highlighter.codeToHtml(b.value, {
        lang,
        themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
        defaultColor: false,
      })
      delete b.value
    }
  }

  const cjkChars = (raw.match(/[\u4e00-\u9fff]/g) || []).length
  // zh 文档保持 cjkChars 字段（历史兼容）；en 按词数计（朗读速度 ~220 wpm）
  const wordCount = LOCALE === 'en' ? (raw.match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g) || []).length : undefined
  const doc = {
    slug, sourceFile: `${PATTERNS.sourceDir}/${file}`, sourceCommit,
    title: chapterTitle || file,
    blocks, toc: toc.filter((h) => h.depth >= 2), experiments, questions, footnotes,
    ...(LOCALE === 'en' ? { wordCount } : { cjkChars }),
    minutes: Math.max(1, Math.round((LOCALE === 'en' ? wordCount / 220 : cjkChars / 400))),
  }
  writeFileSync(join(OUT, `ch-${slug}.json`), JSON.stringify(doc))

  const unknownCount = audit.unknown.length + audit.unknownInline.length
  totalUnknown += unknownCount
  console.log(
    `ch-${slug}: blocks=${blocks.length} toc=${toc.length} exp=${experiments.length} fn=${footnotes.length}` +
      ` ${LOCALE === 'en' ? `words=${wordCount}` : `chars=${cjkChars}`}${unknownCount ? `  ⚠️ 未识别=${unknownCount}` : ''}`,
  )
  if (unknownCount) {
    console.log('  unknown:', JSON.stringify({ ...audit, unknown: audit.unknown.slice(0, 8), unknownInline: audit.unknownInline.slice(0, 8) }))
  }
}

if (auditGlobals.unknownLinks.length) {
  console.log('⚠️ 未识别内链（按原样保留）:', [...new Set(auditGlobals.unknownLinks)].slice(0, 10))
}
if (katexWarned) console.log(`⚠️ KaTeX 渲染失败 ${katexWarned} 处（原文保留在 v 字段）`)
if (totalUnknown > 0) {
  console.error(`\n✗ 审计失败：共 ${totalUnknown} 个未识别节点（PLAN.md §4 fail-fast）`)
  process.exit(1)
}
console.log(`\n✓ 抽取完成：${FILES.length} 章 · 源 commit ${sourceCommit}`)

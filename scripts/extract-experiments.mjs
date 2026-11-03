#!/usr/bin/env node
/**
 * extract-experiments.mjs — 实验库抽取（PLAN.md §4）
 *
 * 用法：node scripts/extract-experiments.mjs [--locale=en]
 * 输入：各章 README(.en).md 实验清单表 + EXPERIMENT_LEDGER.md 台账 + chapter JSON（星级/标题）
 * 输出 zh：src/content/experiments/index.json + exp-<id>.json（详情：README 块 + 白名单代码 Shiki 预着色）
 * 输出 en：src/content/en/experiments/index.json 仅索引——实验详情上游无英文，英文站复用 zh 详情 JSON
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import katex from 'katex'
import { createHighlighter } from 'shiki'

const ROOT = resolve(import.meta.dirname, '..')
const BOOK = resolve(ROOT, '../Book/AI-Agents-in-Depth')
const LOCALE = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1] === 'en' ? 'en' : 'zh'
const OUT = LOCALE === 'en' ? join(ROOT, 'src/content/en/experiments') : join(ROOT, 'src/content/experiments')
const CHAPTERS_SRC = LOCALE === 'en' ? 'src/content/en/chapters' : 'src/content/chapters'
const README_NAME = LOCALE === 'en' ? 'README.en.md' : 'README.md'
const TYPE_LABEL = LOCALE === 'en'
  ? { runnable: 'Runnable', repro: 'Repro', design: 'Design' }
  : { runnable: '可运行', repro: '复现', design: '设计' }

const mdast = unified().use(remarkParse).use(remarkGfm).use(remarkMath)
const SHIKI_LANGS = ['python', 'javascript', 'typescript', 'json', 'bash', 'yaml', 'text', 'html', 'css', 'tsx']

const stripAttrs = (s) => s.replace(/\s*\{[^}]*\}\s*$/g, '').trim()
const textOf = (n) => (n.type === 'text' || n.type === 'inlineCode' ? n.value : n.children ? n.children.map(textOf).join('') : '')

function inline(node) {
  switch (node.type) {
    case 'text': return { t: 'text', v: node.value }
    case 'strong': return { t: 'strong', c: node.children.map(inline) }
    case 'emphasis': return { t: 'em', c: node.children.map(inline) }
    case 'inlineCode': return { t: 'code', v: node.value }
    case 'inlineMath': return { t: 'math', v: node.value, display: false, html: katexHTML(node.value, false) }
    case 'link': return { t: 'a', href: node.url, ext: /^https?:/.test(node.url), c: node.children.map(inline) }
    case 'image': return { t: 'img', src: node.url, alt: stripAttrs(node.alt || '') }
    case 'break': return { t: 'br' }
    default: return { t: 'text', v: textOf(node) }
  }
}

function katexHTML(tex, display) {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: true, output: 'html', strict: false })
  } catch { return null }
}

/** README 级 markdown → blocks（返回数组式 walk，杜绝 undefined 混入） */
function toBlocks(md) {
  const tree = mdast.parse(md)
  let hSeq = 0
  const walk = (node) => {
    switch (node.type) {
      case 'heading': {
        hSeq++
        return [{ kind: 'heading', depth: Math.min(node.depth + 1, 4), text: stripAttrs(node.children.map(textOf).join('')), id: `rh-${hSeq}` }]
      }
      case 'paragraph': {
        const imgs = node.children.filter((n) => n.type === 'image')
        if (imgs.length && node.children.every((n) => n.type === 'image' || textOf(n).trim() === '')) {
          return imgs.map((img) => ({ kind: 'figure', src: img.url, alt: stripAttrs(img.alt || '') }))
        }
        return [{ kind: 'p', c: node.children.map(inline) }]
      }
      case 'blockquote':
        return [{ kind: 'quote', c: node.children.flatMap(walk) }]
      case 'code':
        return [{ kind: 'code', lang: node.lang || 'text', value: node.value }]
      case 'math':
        return [{ kind: 'math', display: true, v: node.value, html: katexHTML(node.value, true) }]
      case 'table': {
        const [head, ...rows] = node.children
        return [{
          kind: 'table',
          align: node.align || [],
          header: head.children.map((c) => c.children.map(inline)),
          rows: rows.map((r) => r.children.map((c) => c.children.map(inline))),
        }]
      }
      case 'list':
        return [{
          kind: 'list', ordered: node.ordered ?? false,
          items: node.children.map((li) => li.children.flatMap(walk)),
        }]
      case 'thematicBreak':
        return [{ kind: 'hr' }]
      default:
        return [] /* html（GitHub 徽章等）与其他未识别节点：安全跳过 */
    }
  }
  return tree.children.flatMap(walk)
}

const CODE_PRIORITY = [/^main\.py$/, /^(agent|experiment|runtime|flow)\.py$/, /^demo\.py$/, /^quickstart\.py$/, /^run_.*\.py$/, /^app\.py$/]

function pickCodeFiles(dir) {
  if (!existsSync(dir)) return []
  let files = readdirSync(dir).filter((f) => /\.(py|ts|js|tsx|jsx|mjs)$/.test(f) && !/^test_|conftest|\.test\.|setup/.test(f))
  const picked = []
  for (const re of CODE_PRIORITY) {
    const hit = files.find((f) => re.test(f))
    if (hit) { picked.push(hit); files = files.filter((f) => f !== hit) }
    if (picked.length >= 3) break
  }
  for (const f of files) {
    if (picked.length >= 3) break
    picked.push(f)
  }
  return picked
    .map((f) => {
      const value = readFileSync(join(dir, f), 'utf8')
      const lines = value.split('\n').slice(0, 400)
      return { path: f, value: lines.join('\n'), truncated: value.split('\n').length > 400 }
    })
}

/* ── 1. 章节星级与标题（来自当前语言的正文抽取产物） ── */
const starsById = new Map()
const titleById = new Map()
for (let n = 1; n <= 10; n++) {
  try {
    const ch = JSON.parse(readFileSync(join(ROOT, `${CHAPTERS_SRC}/ch-${n}.json`), 'utf8'))
    for (const e of ch.experiments) { starsById.set(e.id, e.stars); if (e.title) titleById.set(e.id, e.title) }
  } catch { /* 章节缺失则跳过 */ }
}

/* ── 2. 章 README 实验表 ── */
const TYPE_MAP = { '✅': 'runnable', '📖': 'repro', '🚧': 'design' }
const experiments = new Map() // primaryId → record

for (let n = 1; n <= 10; n++) {
  const readmePath = join(BOOK, `chapter${n}`, README_NAME)
  if (!existsSync(readmePath)) continue
  const md = readFileSync(readmePath, 'utf8')
  const rows = md.split('\n').filter((l) => /^\|/.test(l) && /\|\s*(✅|📖|🚧)\s*\|/.test(l))
  for (const row of rows) {
    const cells = row.split('|').map((c) => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1)
    if (cells.length < 3) continue
    const idCell = cells[0]
    const ids = (idCell.match(/\d+-\d+/g) || []).map((s) => s.replace(/[^0-9-]/g, ''))
    if (!ids.length) continue
    const typeIcon = (row.match(/✅|📖|🚧/) || [])[0]
    const type = TYPE_MAP[typeIcon] ?? 'runnable'
    // 摘要纯文本化：卡片直接渲染 summary，markdown 链接/强调/代码标记必须剥掉
    const summary = (cells[3] ?? '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\*\*([^*]*)\*\*/g, '$1')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/^一一/, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
    // 项目链接：[name](path/) 或 `path/`
    const link = idCell !== undefined ? cells[1] : ''
    const projMatch = cells[1]?.match(/\[([^\]]+)\]\(([^)]+)\)/)
    let name = projMatch?.[1]
    let relPath = projMatch?.[2]?.replace(/\/$/, '')
    if (!relPath) {
      const bt = cells[1]?.match(/`([^`]+)`/)
      if (bt) { relPath = bt[1].replace(/\/$/, ''); name = relPath }
    }
    const primaryId = ids[0]
    const rec = {
      id: primaryId,
      altIds: ids.slice(1),
      // 章号取 id 本身（7-1 → 7），而非首次引用它的 README 所在章
      chapter: Number(primaryId.split('-')[0]),
      name: name ?? primaryId,
      title: titleById.get(primaryId) ?? null,
      type, typeLabel: TYPE_LABEL[type],
      stars: starsById.get(primaryId) ?? 0,
      summary,
      path: relPath ? `chapter${n}/${relPath}` : null,
      external: false,
      status: null,
      statusNote: null,
    }
    // 同 id 已存在（跨章引用同一项目）→ 补充 altId 归属
    const exist = experiments.get(primaryId)
    if (exist && exist.path === rec.path) continue
    experiments.set(primaryId, rec)
  }
}

/* ── 3. 台账状态 ── */
for (let n = 1; n <= 10; n++) {
  const ledgerPath = join(BOOK, `chapter${n}`, 'EXPERIMENT_LEDGER.md')
  if (!existsSync(ledgerPath)) continue
  const md = readFileSync(ledgerPath, 'utf8')
  for (const line of md.split('\n')) {
    if (!/^\|\s*\d+-\d+\s*\|/.test(line)) continue
    const cells = line.split('|').map((c) => c.trim())
    const id = cells[1]
    const rec = experiments.get(id)
    if (!rec) continue
    rec.status = cells[3]?.replace(/\s+/g, ' ').slice(0, 120) ?? null
    rec.statusNote = (cells[4] ?? '').replace(/`/g, '').slice(0, 400) || null
  }
}

/* ── 4. 详情文件（README 块 + 代码白名单；en 模式跳过——英文站复用 zh 详情 JSON） ── */
mkdirSync(OUT, { recursive: true })
const highlighter = LOCALE === 'en' ? null : await createHighlighter({ themes: ['vitesse-light', 'vitesse-dark'], langs: SHIKI_LANGS })
let detailCount = 0

for (const rec of LOCALE === 'en' ? [] : experiments.values()) {
  const detail = { ...rec, readme: [], codeFiles: [] }
  if (rec.path) {
    const dir = join(BOOK, rec.path)
    const readmeFile = existsSync(join(dir, 'README.md')) ? join(dir, 'README.md') : null
    if (readmeFile) {
      const blocks = toBlocks(readFileSync(readmeFile, 'utf8'))
      // 空 p（纯空行/仅锚点残留）渲染为悬空空隙 → 丢弃
      const hasText = (b) => b.kind !== 'p' || (b.c ?? []).some((x) => typeof x.v === 'string' && x.v.trim())
      detail.readme = blocks.slice(0, 80).filter(hasText) // 外部大仓 README 截断
      for (const b of detail.readme) {
        if (b.kind === 'code') {
          const lang = SHIKI_LANGS.includes(b.lang) ? b.lang : 'text'
          b.html = highlighter.codeToHtml(b.value, { lang, themes: { light: 'vitesse-light', dark: 'vitesse-dark' }, defaultColor: false })
          delete b.value
        }
      }
    }
    if (rec.type === 'runnable') {
      detail.codeFiles = pickCodeFiles(dir).map((f) => ({
        ...f,
        html: highlighter.codeToHtml(f.value, {
          lang: f.path.endsWith('.py') ? 'python' : f.path.endsWith('.ts') ? 'typescript' : f.path.endsWith('.tsx') ? 'tsx' : 'text',
          themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
          defaultColor: false,
        }),
      }))
    }
  }
  writeFileSync(join(OUT, `exp-${rec.id}.json`), JSON.stringify(detail))
  detailCount++
}

/* ── 5. 轻量索引（书稿章序稳定排序，跨章引用归到首次出现章） ── */
const byBookOrder = (a, b) =>
  a.chapter - b.chapter ||
  Number(a.id.split('-')[1]) - Number(b.id.split('-')[1])
const index = [...experiments.values()]
  .sort(byBookOrder)
  .map(({ readme, codeFiles, statusNote, ...meta }) => meta)
writeFileSync(join(OUT, 'index.json'), JSON.stringify({ experiments: index }))

const sourceCommit = execSync(`git -C "${BOOK}" rev-parse --short HEAD`).toString().trim()
const detailNote = LOCALE === 'en' ? '（en 仅索引，详情复用 zh exp-*.json）' : ''
console.log(`✓ 实验库[${LOCALE}]：索引 ${index.length} 项 · 详情 ${detailCount} 个 ${detailNote}· 源 commit ${sourceCommit}`)
console.log(`  类型分布:`, index.reduce((m, e) => ((m[e.typeLabel] = (m[e.typeLabel] || 0) + 1), m), {}))

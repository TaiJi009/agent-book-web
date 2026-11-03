#!/usr/bin/env node
/**
 * build-walkthroughs.mjs — 代码讲解构建（PLAN.md §6）
 * 输入：walkthroughs/*.md（front-matter + 正文 + ```ref path A-B``` 代码引用 + ```svg``` 内联图）
 * 输出 zh：src/content/walkthroughs/index.json + wt-<slug>.json（代码 Shiki 预着色）
 * 输出 en：--locale=en 读 walkthroughs-en/ → src/content/en/walkthroughs/（ref 代码引用与 zh 共享同一仓库源）
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { createHighlighter } from 'shiki'

const ROOT = resolve(import.meta.dirname, '..')
const LOCALE = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1] === 'en' ? 'en' : 'zh'
const SRC = join(ROOT, LOCALE === 'en' ? 'walkthroughs-en' : 'walkthroughs')
const BOOK = resolve(ROOT, '../Book/AI-Agents-in-Depth')
const OUT = LOCALE === 'en' ? join(ROOT, 'src/content/en/walkthroughs') : join(ROOT, 'src/content/walkthroughs')

const LANGS = ['python', 'typescript', 'json', 'bash', 'text']
const highlighter = await createHighlighter({ themes: ['vitesse-light', 'vitesse-dark'], langs: LANGS })

function parseMd(file) {
  const raw = readFileSync(file, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`${file}: 缺少 front-matter`)
  const meta = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^\[|\]$/g, '')
  }
  meta.chapters = (m[1].match(/chapters:\s*\[([^\]]*)\]/) || [])[1]?.split(',').map((s) => s.trim()).filter(Boolean) ?? []

  // 逐段解析：## 小节 → 段落 / ref 代码 / svg 图
  const sections = []
  let cur = null
  const lines = m[2].split('\n')
  let i = 0
  const pushPara = (buf) => {
    const text = buf.join('\n').trim()
    if (text && cur) cur.blocks.push({ kind: 'p', text })
  }
  let buf = []
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('## ')) {
      pushPara(buf); buf = []
      cur = { heading: line.slice(3).trim(), blocks: [] }
      sections.push(cur)
      i++
      continue
    }
    const fence = line.match(/^```\s*(ref|svg)\s*(.*)$/)
    if (fence) {
      const body = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) { body.push(lines[i]); i++ }
      i++ // 跳过闭合 ```
      pushPara(buf); buf = []
      if (!cur) { cur = { heading: '', blocks: [] }; sections.push(cur) }
      if (fence[1] === 'ref') {
        const m = body[0].trim().match(/^(\S+)\s+(\d+)-(\d+)$/)
        if (!m) throw new Error(`${file}: ref 格式应为 "路径 起-止"，得到 ${JSON.stringify(body[0])}`)
        const path = m[1]
        const from = Number(m[2])
        const to = Number(m[3])
        if (from < 1 || to < from) throw new Error(`${file}: 行号区间非法 ${from}-${to}`)
        const abs = join(BOOK, path)
        if (!existsSync(abs)) throw new Error(`${file}: 代码文件不存在 ${path}`)
        const all = readFileSync(abs, 'utf8').split('\n')
        if (to > all.length) throw new Error(`${file}: ${path} 共 ${all.length} 行，越界到 ${to}`)
        const value = all.slice(from - 1, to).join('\n')
        const lang = path.endsWith('.py') ? 'python' : path.endsWith('.ts') ? 'typescript' : path.endsWith('.json') ? 'json' : path.endsWith('.sh') ? 'bash' : 'text'
        cur.blocks.push({
          kind: 'code', file: path, from, to,
          total: all.length,
          html: highlighter.codeToHtml(value, { lang, themes: { light: 'vitesse-light', dark: 'vitesse-dark' }, defaultColor: false }),
        })
      } else {
        cur.blocks.push({ kind: 'diagram', svg: body.join('\n') })
      }
      continue
    }
    buf.push(line)
    i++
  }
  pushPara(buf)
  return { meta, sections }
}

mkdirSync(OUT, { recursive: true })
const files = readdirSync(SRC).filter((f) => f.endsWith('.md'))
const index = []
const sourceCommit = execSync(`git -C "${BOOK}" rev-parse --short HEAD`).toString().trim()

for (const f of files) {
  const { meta, sections } = parseMd(join(SRC, f))
  const slug = meta.slug
  if (!slug) throw new Error(`${f}: 缺少 slug`)
  writeFileSync(join(OUT, `wt-${slug}.json`), JSON.stringify({ ...meta, sections, sourceCommit }))
  index.push({ slug, title: meta.title, subtitle: meta.subtitle ?? '', project: meta.project ?? '', chapters: meta.chapters, summary: meta.summary ?? '', order: Number(meta.order ?? 99) })
  console.log(`wt-${slug}: ${sections.length} 节`)
}

index.sort((a, b) => a.order - b.order)
writeFileSync(join(OUT, 'index.json'), JSON.stringify({ walkthroughs: index }))
console.log(`✓ 代码讲解[${LOCALE}]：${index.length} 篇 · 源 commit ${sourceCommit}`)

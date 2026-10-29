#!/usr/bin/env node
/**
 * build-search-index.mjs — 全局搜索索引（PLAN.md §3）
 * 中文 bigram 倒排索引：章节小节 + 实验库条目 + 术语表 → src/content/search-index.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const OUT = join(ROOT, 'src/content/search-index.json')

/* 文本 → bigram 集合（中文按字 bigram，拉丁按词） */
export function bigrams(text) {
  const set = new Set()
  const t = text.toLowerCase().replace(/\s+/g, ' ')
  const latin = t.match(/[a-z0-9]+/g) || []
  for (const w of latin) set.add(w)
  const cjkRuns = t.match(/[\u4e00-\u9fff]+/g) || []
  for (const run of cjkRuns) {
    if (run.length === 1) { set.add(run); continue }
    for (let i = 0; i < run.length - 1; i++) set.add(run.slice(i, i + 2))
  }
  return set
}

const inlineText = (c) =>
  (c || [])
    .map((n) => typeof n === 'string' ? n : n.v ?? (n.c ? inlineText(n.c) : ''))
    .join('')

const docs = []
const push = (d) => docs.push(d)

/* ── 1. 章节小节：每个 h2 一个 doc ── */
for (let n = 0; n <= 11; n++) {
  const slug = n === 0 ? 'intro' : n === 11 ? 'outro' : String(n)
  let ch
  try { ch = JSON.parse(readFileSync(join(ROOT, `src/content/chapters/ch-${slug}.json`), 'utf8')) } catch { continue }
  // 按 h2 切节
  let cur = null
  const flush = () => {
    if (!cur) return
    const text = cur.text.replace(/\s+/g, ' ').slice(0, 600)
    if (text.length < 8) { cur = null; return }
    push({ id: `ch-${slug}-${cur.id}`, type: 'section', title: cur.title, chapter: slug, anchor: cur.id, text })
    cur = null
  }
  for (const b of ch.blocks) {
    if (b.kind === 'heading' && b.depth === 2) {
      flush()
      cur = { id: b.id, title: b.text, text: '' }
    } else if (cur) {
      if (b.kind === 'p') cur.text += inlineText(b.c) + ' '
      else if (b.kind === 'experiment') cur.text += `实验 ${b.id} ${b.title} ` + (b.body || []).map((x) => x.kind === 'p' ? inlineText(x.c) : '').join(' ') + ' '
    }
  }
  flush()
}

/* ── 2. 实验 ── */
const idx = JSON.parse(readFileSync(join(ROOT, 'src/content/experiments/index.json'), 'utf8'))
for (const e of idx.experiments) {
  push({
    id: `exp-${e.id}`, type: 'experiment', title: `实验 ${e.id} · ${e.name}`,
    chapter: String(e.chapter), anchor: null,
    text: `${e.typeLabel} ${e.summary} ${e.path ?? ''} ${e.status ?? ''}`.slice(0, 500),
  })
}

/* ── 3. 术语 ── */
const glossary = JSON.parse(readFileSync(join(ROOT, 'src/content/glossary.json'), 'utf8'))
for (const t of glossary.terms) {
  push({ id: `term-${t.id}`, type: 'term', title: t.term, chapter: t.chapters[0], anchor: t.id, text: `${t.en} ${t.def}`.slice(0, 500) })
}

/* ── 建倒排 ── */
const inverted = new Map()
const docBigrams = []
const index_of = (bs) => { docBigrams.push(bs); return docBigrams.length - 1 }

for (const d of docs) {
  const field = `${d.title} ${d.title} ${d.text}` // 标题加权：重复两次
  const bs = bigrams(field)
  const di = index_of(bs)
  for (const g of bs) {
    if (!inverted.has(g)) inverted.set(g, [])
    inverted.get(g).push(di)
  }
}

const index = {
  version: 1,
  docs,
  // 稀疏存储：[bigram, docIdx...] 扁平数组
  lists: [...inverted.entries()].map(([g, list]) => [g, list]),
}

writeFileSync(OUT, JSON.stringify(index))
console.log(`✓ 搜索索引：${docs.length} 个文档（章节小节 ${docs.filter(d=>d.type==='section').length} / 实验 ${docs.filter(d=>d.type==='experiment').length} / 术语 ${docs.filter(d=>d.type==='term').length}）· ${(readFileSync(OUT).length / 1024).toFixed(0)} KB · ${inverted.size} 个 bigram`)

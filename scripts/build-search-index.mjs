#!/usr/bin/env node
/**
 * build-search-index.mjs — 全局搜索索引（PLAN.md §3）
 * bigram 倒排索引：章节小节 + 实验库条目 + 术语表
 * zh → src/content/search-index.json；--locale=en → src/content/en/search-index.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const LOCALE = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1] === 'en' ? 'en' : 'zh'
const CHAPTERS_DIR = LOCALE === 'en' ? 'src/content/en/chapters' : 'src/content/chapters'
const EXP_INDEX = LOCALE === 'en' ? 'src/content/en/experiments/index.json' : 'src/content/experiments/index.json'
const GLOSSARY = LOCALE === 'en' ? 'src/content/en/glossary.json' : 'src/content/glossary.json'
const OUT = LOCALE === 'en' ? join(ROOT, 'src/content/en/search-index.json') : join(ROOT, 'src/content/search-index.json')
const expLabel = LOCALE === 'en'
  ? (id, name) => `Experiment ${id} · ${name}`
  : (id, name) => `实验 ${id} · ${name}`
const expInlineLabel = LOCALE === 'en' ? (id, title) => `Experiment ${id} ${title} ` : (id, title) => `实验 ${id} ${title} `

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

const blockText = (b) => {
  if (b.kind === 'p') return inlineText(b.c)
  if (b.kind === 'list') return b.items.map((it) => it.map(blockText).join(' ')).join(' ')
  if (b.kind === 'quote' || b.kind === 'callout') return (b.c ?? b.body ?? []).map(blockText).join(' ')
  return ''
}

const docs = []
const push = (d) => docs.push(d)

/* ── 1. 章节小节：每个 h2 一个 doc ── */
for (let n = 0; n <= 11; n++) {
  const slug = n === 0 ? 'intro' : n === 11 ? 'outro' : String(n)
  let ch
  try { ch = JSON.parse(readFileSync(join(ROOT, `${CHAPTERS_DIR}/ch-${slug}.json`), 'utf8')) } catch { continue }
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
      else if (b.kind === 'experiment') cur.text += expInlineLabel(b.id, b.title) + (b.body || []).map((x) => x.kind === 'p' ? inlineText(x.c) : '').join(' ') + ' '
    }
  }
  flush()
}

/* ── 2. 实验 ── */
const idx = JSON.parse(readFileSync(join(ROOT, EXP_INDEX), 'utf8'))
for (const e of idx.experiments) {
  push({
    id: `exp-${e.id}`, type: 'experiment', title: expLabel(e.id, e.name),
    chapter: String(e.chapter), anchor: null,
    text: `${e.typeLabel} ${e.summary} ${e.path ?? ''} ${e.status ?? ''}`.slice(0, 500),
  })
}

/* ── 3. 术语 ── */
const glossary = JSON.parse(readFileSync(join(ROOT, GLOSSARY), 'utf8'))
for (const t of glossary.terms) {
  push({ id: `term-${t.id}`, type: 'term', title: t.term, chapter: t.chapters[0], anchor: t.id, text: `${t.en} ${t.def}`.slice(0, 500) })
}

/* ── 4. 思考题：每章一个 doc，跳章级锚点（产物缺失时告警跳过，保持向后兼容） ── */
const QUIZ_DIR = LOCALE === 'en' ? 'src/content/en/quiz' : 'src/content/quiz'
const quizLabel = LOCALE === 'en'
  ? (n, title) => `Quiz · Chapter ${n}: ${title}`
  : (n, title) => `思考题 · 第 ${n} 章 ${title}`
try {
  const quizIdx = JSON.parse(readFileSync(join(ROOT, `${QUIZ_DIR}/index.json`), 'utf8'))
  for (const { chapter } of quizIdx.chapters) {
    const qz = JSON.parse(readFileSync(join(ROOT, `${QUIZ_DIR}/quiz-${chapter}.json`), 'utf8'))
    const text = qz.questions.map((q) => q.blocks.map(blockText).join(' ')).join(' · ')
    push({
      id: `quiz-${chapter}`, type: 'quiz', title: quizLabel(chapter, qz.title),
      chapter: String(chapter), anchor: null, text: text.slice(0, 800),
    })
  }
} catch (e) {
  console.warn(`! 跳过思考题索引（${QUIZ_DIR} 缺失或不可读，先运行 build-quiz.mjs）：${e.message}`)
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
console.log(`✓ 搜索索引[${LOCALE}]：${docs.length} 个文档（章节小节 ${docs.filter(d=>d.type==='section').length} / 实验 ${docs.filter(d=>d.type==='experiment').length} / 术语 ${docs.filter(d=>d.type==='term').length} / 思考题 ${docs.filter(d=>d.type==='quiz').length}）· ${(readFileSync(OUT).length / 1024).toFixed(0)} KB · ${inverted.size} 个 bigram`)

#!/usr/bin/env node
/**
 * build-quiz.mjs — 思考题独立页数据管线（PR-3）
 *
 * 输入：
 *   题目  src/content/{,en/}chapters/ch-{1..10}.json 的 questions 块
 *         （每章一个 [{kind:'list', ordered:true, items}]，item 内首个 inline 文本以 ★/★★/★★★ 开头）
 *   答案  上游 Book/AI-Agents-in-Depth/{book,book-en}/reference-answers.md
 *         结构：H1 说明 → H2 按章（按出现顺序即章号，en 第 6 章 H2 缺 "Chapter 6:" 前缀）→
 *         章内条目为加粗编号行 `**N. (★+) 题干复述**` + 其下 `>` blockquote 提纲（一段一行，空 `>` 行分段）
 * 配对：主键（章号 1-10, 题序 1-N）；答案星级 vs 题干星级 + 题干/答案复述字符级 LCS 相似度做校验位。
 *       星级不一致或相似度 < 0.5 → console 警告清单 + 产物内 drift:true（预期命中 ch8-11：答案基于旧版题集）。
 * 产物：src/content/{,en/}quiz/quiz-{1..10}.json + index.json
 *
 * 用法：node scripts/build-quiz.mjs [--locale=en]
 * 条数不匹配 / 章数异常 → fail-fast 报错退出。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const BOOK = resolve(ROOT, '../Book/AI-Agents-in-Depth')
const LOCALE = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1] === 'en' ? 'en' : 'zh'
const CHAPTERS_DIR = LOCALE === 'en' ? 'src/content/en/chapters' : 'src/content/chapters'
const OUT_DIR = LOCALE === 'en' ? 'src/content/en/quiz' : 'src/content/quiz'
const ANSWER_SOURCE_FILE = LOCALE === 'en' ? 'book-en/reference-answers.md' : 'book/reference-answers.md'
const ANSWERS_MD = join(BOOK, ANSWER_SOURCE_FILE)
const SIMILARITY_THRESHOLD = 0.5

const sourceCommit = execSync(`git -C "${BOOK}" rev-parse --short HEAD`).toString().trim()

/* ── 答案 md 解析 ── */

/** 逐行扫描：H2 开新章；`**N. (★+) ...**` 开新条目；条目下每条非空 `>` 行为答案提纲的一段（空 `>` 行仅作段分隔符，上游无软换行段落） */
function parseAnswers(md) {
  const chapters = []
  let entry = null
  const flush = () => { entry = null }
  for (const raw of md.split('\n')) {
    const line = raw.replace(/\s+$/, '')
    if (/^## /.test(line)) { flush(); chapters.push({ entries: [] }); continue }
    if (!chapters.length) continue // H1 说明段
    const m = line.match(/^\*\*(\d+)\.\s*\((★+)\)/)
    if (m) {
      flush()
      entry = {
        no: Number(m[1]),
        stars: m[2].length,
        rest: line.slice(m[0].length).replaceAll('**', ''), // 题干复述（去加粗标记，作相似度基准）
        paragraphs: [],
      }
      chapters.at(-1).entries.push(entry)
      continue
    }
    if (entry && /^>/.test(line)) {
      const text = line.replace(/^>\s?/, '').trim()
      if (text) entry.paragraphs.push(text)
      continue
    }
    // 空行 / 其他内容忽略
  }
  flush()
  return chapters
}

/* ── 题干解析：剥离 ★ 前缀 → 星级 + 剩余 Block[] ── */

function parseQuestions(ch, chFile) {
  const list = ch.questions?.[0]
  if (!list || list.kind !== 'list' || !list.ordered) {
    throw new Error(`${chFile}: questions 块结构异常（期望单个 ordered list）`)
  }
  return list.items.map((item, i) => {
    const blocks = JSON.parse(JSON.stringify(item)) // 深拷贝后剥离 ★ 前缀，不触碰章节产物
    let stars = 0
    const p = blocks.find((b) => b.kind === 'p')
    const firstText = p?.c?.find((n) => n.t === 'text')
    const sm = firstText?.v.match(/^(★+|☆+)/)
    if (sm) {
      stars = sm[1].length
      firstText.v = firstText.v.slice(sm[0].length).replace(/^[ \t]+/, '')
      if (!firstText.v) p.c = p.c.filter((n) => n !== firstText)
    } else {
      console.warn(`! ${chFile} 题 ${i + 1}：题干未找到 ★ 前缀，星级记 0`)
    }
    return { stars, blocks }
  })
}

/* ── 块 → 纯文本（相似度基准用） ── */
const inlineText = (c) => (c || []).map((n) => n.v ?? (n.c ? inlineText(n.c) : '')).join('')
function blockText(b) {
  if (b.kind === 'p') return inlineText(b.c)
  if (b.kind === 'list') return b.items.map((it) => it.map(blockText).join(' ')).join(' ')
  if (b.kind === 'quote' || b.kind === 'callout') return (b.c ?? b.body ?? []).map(blockText).join(' ')
  return ''
}

/* ── 相似度：去标点空白后最长公共子序列比率（字符级） ── */

const NOISE = /[\s，。、；：？！“”‘’（）()《》「」『』【】…·—–\-.,;:?!'"`*★☆~～]/g
function similarity(a, b) {
  const x = a.replace(NOISE, '')
  const y = b.replace(NOISE, '')
  if (!x.length || !y.length) return 0
  let prev = new Array(y.length + 1).fill(0)
  for (let i = 1; i <= x.length; i++) {
    const cur = [0]
    for (let j = 1; j <= y.length; j++) {
      cur[j] = x[i - 1] === y[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1])
    }
    prev = cur
  }
  return prev[y.length] / Math.max(x.length, y.length)
}

/* ── 主流程 ── */

const answers = parseAnswers(readFileSync(ANSWERS_MD, 'utf8'))
if (answers.length !== 10) {
  throw new Error(`${ANSWER_SOURCE_FILE}: 期望 10 个 H2 章节，实际 ${answers.length}`)
}

const indexChapters = []
const driftList = []
const starsMismatches = []
let totalQuestions = 0
let totalAnswers = 0

mkdirSync(join(ROOT, OUT_DIR), { recursive: true })

for (let n = 1; n <= 10; n++) {
  const chFile = `${CHAPTERS_DIR}/ch-${n}.json`
  const ch = JSON.parse(readFileSync(join(ROOT, chFile), 'utf8'))
  const questions = parseQuestions(ch, chFile)
  const entries = answers[n - 1].entries

  if (entries.length !== questions.length) {
    throw new Error(`ch-${n}: 题目 ${questions.length} 道 vs 答案 ${entries.length} 条，条数不匹配`)
  }

  const outQuestions = questions.map((q, i) => {
    const e = entries[i]
    if (e.no !== i + 1) throw new Error(`ch-${n} 答案序号断档：期望 ${i + 1}，实际 ${e.no}`)
    if (!e.paragraphs.length) throw new Error(`ch-${n} 题 ${i + 1}：答案条目无 blockquote 内容`)
    if (e.stars !== q.stars) starsMismatches.push(`ch${n}-${i + 1}（题 ${q.stars}★ vs 答 ${e.stars}★）`)
    const sim = similarity(q.blocks.map(blockText).join(' '), e.rest)
    const drift = sim < SIMILARITY_THRESHOLD || e.stars !== q.stars
    if (sim < SIMILARITY_THRESHOLD) driftList.push(`ch${n}-${i + 1}（相似度 ${sim.toFixed(2)}）`)
    totalAnswers += 1
    return { ordinal: i + 1, stars: q.stars, blocks: q.blocks, answer: e.paragraphs, drift }
  })

  const starsDist = { 1: 0, 2: 0, 3: 0 }
  for (const q of outQuestions) starsDist[q.stars] = (starsDist[q.stars] ?? 0) + 1
  totalQuestions += outQuestions.length

  const doc = {
    chapter: n,
    title: ch.title,
    questions: outQuestions,
    answerSourceFile: ANSWER_SOURCE_FILE,
    sourceCommit,
  }
  writeFileSync(join(ROOT, OUT_DIR, `quiz-${n}.json`), JSON.stringify(doc))
  indexChapters.push({ chapter: n, count: outQuestions.length, starsDist })
}

writeFileSync(
  join(ROOT, OUT_DIR, 'index.json'),
  JSON.stringify({ chapters: indexChapters, total: totalQuestions }),
)

/* ── 报告 ── */
const dist = indexChapters.reduce((acc, c) => {
  for (const k of [1, 2, 3]) acc[k] += c.starsDist[k]
  return acc
}, { 1: 0, 2: 0, 3: 0 })

console.log(`✓ 思考题[${LOCALE}]：${totalQuestions} 题 · 答案配对 ${totalAnswers} 条 · 星级分布 1★=${dist[1]} / 2★=${dist[2]} / 3★=${dist[3]} · 源 commit ${sourceCommit}`)
if (starsMismatches.length) console.warn(`! 星级不一致 ${starsMismatches.length} 处：${starsMismatches.join('、')}`)
if (driftList.length) console.warn(`! 题干/答案漂移 ${driftList.length} 处（相似度 < ${SIMILARITY_THRESHOLD}）：${driftList.join('、')}`)
if (!driftList.length && !starsMismatches.length) console.log('  全部题目星级一致、题干-答案相似度达标')

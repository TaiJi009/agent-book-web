import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Block } from '../lib/types'
import { CHAPTERS, CHAPTERS_EN } from '../lib/chapters'
import { BlockView } from '../components/BlockRenderer'
import { Stars } from '../components/Stars'
import { Icon } from '../components/Icon'
import { useLocale, localePath } from '../lib/i18n'
import { useCopy, fill } from '../lib/copy'
import zhIndex from '../content/quiz/index.json'
import enIndex from '../content/en/quiz/index.json'

/** build-quiz.mjs 产物模型：题目块（★ 前缀已剥离）+ 上游参考答案提纲 */
interface QuizQuestion {
  ordinal: number
  stars: number
  blocks: Block[]
  answer: string[] | null
  drift: boolean
}
interface QuizDoc {
  chapter: number
  title: string
  questions: QuizQuestion[]
  answerSourceFile: string
  sourceCommit: string
}
interface QuizIndexFile {
  chapters: { chapter: number; count: number; starsDist: Record<string, number> }[]
  total: number
}

const INDEX: Record<'zh' | 'en', QuizIndexFile> = { zh: zhIndex as QuizIndexFile, en: enIndex as QuizIndexFile }

/* 章级懒加载：vite glob 惰性导入 quiz 产物（zh + en 双目录） */
const modules = import.meta.glob<{ default: QuizDoc }>([
  '../content/quiz/quiz-*.json',
  '../content/en/quiz/quiz-*.json',
])
const quizFile = (locale: string, n: number) =>
  locale === 'en' ? `../content/en/quiz/quiz-${n}.json` : `../content/quiz/quiz-${n}.json`

/* 单题卡片：题号 + 星级 + 题干；头部整区可点击切换答案（链接/脚注/按钮冒泡豁免），答案默认折叠 */
function QuestionCard({ chapter, q }: { chapter: number; q: QuizQuestion }) {
  const [open, setOpen] = useState(false)
  const t = useCopy()
  const id = `q-${chapter}-${q.ordinal}`
  const toggle = () => setOpen(!open)
  /* 点击目标若是链接/脚注/按钮等交互元素，不触发挥起折叠（避免跳转与折叠同时发生） */
  const headClick = (e: React.MouseEvent) => {
    if (q.answer === null) return
    if ((e.target as HTMLElement).closest('a, button')) return
    toggle()
  }
  return (
    <article id={id} className="scroll-mt-24 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="cursor-pointer px-5 pt-4" onClick={headClick}>
        <div className="flex items-baseline gap-2.5">
          <span className="shrink-0 font-mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            {String(chapter).padStart(2, '0')}·{q.ordinal}
          </span>
          <Stars n={q.stars} />
        </div>
        <div className="mt-1.5 text-[0.95rem] leading-[1.85] text-t1">
          {q.blocks.map((b, i) => <BlockView key={i} block={b} nested />)}
        </div>
        {q.answer !== null ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`ans-${id}`}
            onClick={(e) => { e.stopPropagation(); toggle() }}
            className="mb-4 ml-auto mt-3 flex w-fit items-center gap-1 text-sm font-medium transition-opacity duration-[var(--dur-instant)] hover:opacity-75"
            style={{ color: 'var(--accent)' }}
          >
            {open ? t.quizAnswerHide : t.quizAnswerToggle}
            <span
              aria-hidden
              className="shrink-0 transition-transform duration-[var(--dur-quick)]"
              style={{ transform: open ? 'rotate(180deg)' : '', transitionTimingFunction: 'var(--ease-standard)' }}
            >
              <Icon name="chevron-down" size={14} />
            </span>
          </button>
        ) : (
          <p className="mb-4 mt-3 text-sm text-t3">{t.quizAnswerNone}</p>
        )}
      </div>
      {q.answer !== null && (
        <div
          className="grid transition-[grid-template-rows] duration-[var(--dur-smooth)]"
          style={{ gridTemplateRows: open ? '1fr' : '0fr', transitionTimingFunction: 'var(--ease-standard)' }}
        >
          <div className="overflow-hidden">
            <div id={`ans-${id}`} className="border-t border-line px-5 py-4">
              {q.drift && (
                <p
                  className="mb-3 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  style={{ background: 'oklch(from var(--warn) l c h / .14)', color: 'var(--warn)' }}
                >
                  {t.quizDriftNote}
                </p>
              )}
              <div className="space-y-2.5 text-[0.92rem] leading-[1.8] text-t2">
                {q.answer.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <p className="mt-3 font-mono text-[11px] text-t3">{t.quizAnswerSource}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

/* 章分组：整行可点击折叠/展开；标题行 sticky 悬停（滚动中常驻，方便随时折叠） */
function ChapterSection({ doc, open, onToggle }: { doc: QuizDoc; open: boolean; onToggle: () => void }) {
  const t = useCopy()
  const locale = useLocale()
  const CHAPTERS_L = locale === 'en' ? CHAPTERS_EN : CHAPTERS
  const meta = CHAPTERS_L.find((c) => c.slug === String(doc.chapter))
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() }
  }
  return (
    <section id={`q-${doc.chapter}`} className="mt-6 scroll-mt-14">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={`qs-${doc.chapter}`}
        aria-label={open ? t.quizChapterCollapse : t.quizChapterExpand}
        onClick={onToggle}
        onKeyDown={handleKey}
        className="sticky top-14 z-20 flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 border-b border-line py-2.5 backdrop-blur"
        style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)' }}
      >
        <Link
          to={localePath(`/chapter/${doc.chapter}`, locale)}
          viewTransition
          data-chapter={String(doc.chapter)}
          onClick={(e) => e.stopPropagation()}
          className="group flex items-baseline gap-2.5"
        >
          <span className="font-mono text-sm font-semibold" style={{ color: 'var(--chapter)' }}>
            {String(doc.chapter).padStart(2, '0')}
          </span>
          <span
            className="font-display text-lg font-semibold tracking-tight transition-opacity duration-[var(--dur-instant)] group-hover:opacity-75"
            style={{ color: 'var(--chapter)' }}
          >
            {meta?.title ?? doc.title}
          </span>
        </Link>
        <span className="ml-auto flex items-center gap-2.5">
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-t3">
            {fill(t.nItems, { n: doc.questions.length })}
          </span>
          <span
            aria-hidden
            className="shrink-0 text-[var(--accent)] transition-transform duration-[var(--dur-quick)]"
            style={{ transform: open ? 'rotate(180deg)' : '', transitionTimingFunction: 'var(--ease-standard)' }}
          >
            <Icon name="chevron-down" size={15} />
          </span>
        </span>
      </div>
      {/* 章级折叠：题干列表 DOM 常驻（grid-rows 过渡），保证 #q-N 锚点目标存在 */}
      <div
        className="grid transition-[grid-template-rows] duration-[var(--dur-smooth)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', transitionTimingFunction: 'var(--ease-standard)' }}
      >
        <div className="overflow-hidden">
          <div id={`qs-${doc.chapter}`} className="mt-3 space-y-3">
            {doc.questions.map((q) => <QuestionCard key={q.ordinal} chapter={doc.chapter} q={q} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Quiz() {
  const t = useCopy()
  const locale = useLocale()
  const location = useLocation()
  const [docs, setDocs] = useState<QuizDoc[] | null>(null)
  // 章级展开集合：默认空 = 所有章收起（仅标题行），点批量开关或搜索锚点跳转时展开
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set())
  const IDX = INDEX[locale]

  const toggleChapter = (n: number) =>
    setOpenChapters((prev) => {
      const s = new Set(prev)
      if (s.has(n)) s.delete(n)
      else s.add(n)
      return s
    })
  const openChapter = (n: number) =>
    setOpenChapters((prev) => (prev.has(n) ? prev : new Set(prev).add(n)))

  // 难度分布（来自 index.json，静态可算）
  const dist = useMemo(() => {
    const d = { 1: 0, 2: 0, 3: 0 }
    for (const c of IDX.chapters) for (const k of [1, 2, 3] as const) d[k] += c.starsDist[String(k)] ?? 0
    return d
  }, [IDX])

  useEffect(() => {
    let alive = true
    setDocs(null)
    Promise.all(IDX.chapters.map(({ chapter }) => modules[quizFile(locale, chapter)]?.())).then((ms) => {
      if (!alive) return
      setDocs(ms.filter((m): m is { default: QuizDoc } => !!m).map((m) => m.default).sort((a, b) => a.chapter - b.chapter))
    })
    return () => { alive = false }
  }, [locale, IDX])

  // 搜索跳转锚点：#q-N（章级）/#q-N-M（题级）——先确保对应章展开，再滚动
  useEffect(() => {
    if (!docs) return
    const m = location.hash.match(/^#q-(\d+)(?:-(\d+))?/)
    if (m) {
      openChapter(Number(m[1]))
      const target = m[2] ? `q-${m[1]}-${m[2]}` : `q-${m[1]}`
      requestAnimationFrame(() => {
        document.getElementById(target)?.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, location.hash])

  return (
    <div className="rise-in mx-auto max-w-3xl">
      <header className="py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3">Quiz</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{t.quizTitle}</h1>
        <p className="mt-2 text-t2">
          {fill(t.quizDesc, { total: IDX.total, s1: dist[1], s2: dist[2], s3: dist[3] })}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-t3">
          <Icon name="book-open" size={13} className="shrink-0" />
          {t.quizAnswerSource}
        </p>
      </header>

      {!docs ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" style={{ width: `${100 - (i % 3) * 6}%` }} />
          ))}
        </div>
      ) : (
        docs.map((d) => (
          <ChapterSection
            key={d.chapter}
            doc={d}
            open={openChapters.has(d.chapter)}
            onToggle={() => toggleChapter(d.chapter)}
          />
        ))
      )}
    </div>
  )
}

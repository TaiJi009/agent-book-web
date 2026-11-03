import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { ChapterDoc } from '../lib/types'
import { CHAPTERS, CHAPTERS_EN } from '../lib/chapters'
import { BlockView } from '../components/BlockRenderer'
import { InlineText } from '../components/InlineText'
import { useLocale, localePath } from '../lib/i18n'
import { useCopy, fill } from '../lib/copy'

/* 章级懒加载：vite glob 惰性导入抽取产物（zh + en 双目录） */
const modules = import.meta.glob<{ default: ChapterDoc }>([
  '../content/chapters/ch-*.json',
  '../content/en/chapters/ch-*.json',
])

const chapterFile = (locale: string, slug: string) =>
  locale === 'en' ? `../content/en/chapters/ch-${slug}.json` : `../content/chapters/ch-${slug}.json`

/* 阅读进度：Agent 状态栏隐喻（顶部 2px，章节色） */
function useReadingProgress(ref: React.RefObject<HTMLElement | null>, ready: boolean) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const total = el.scrollHeight - window.innerHeight + rect.top * 0 + (rect.top <= 0 ? 0 : rect.top)
      const done = Math.min(1, Math.max(0, -rect.top / Math.max(1, el.scrollHeight - window.innerHeight)))
      setP(done)
      void total
    }
    onScroll()
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [ref, ready])
  return p
}


/* 章号滚动视差：大字数字以 0.05 速率缓移（DESIGN.md §5.3 扉页编排） */
function useChapterNumParallax(ref: React.RefObject<HTMLElement | null>, ready: boolean) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onScroll = () => {
      // transform 直写：滚动事件自身即节流；rAF 在嵌入环境可能饿死
      el.style.transform = `translateY(${window.scrollY * 0.05}px)`
    }
    onScroll()
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [ref, ready])
}

/* TOC scroll-spy：活动指示条弹簧滑动 */
function Toc({ items }: { items: ChapterDoc['toc'] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const t = useCopy()
  const locale = useLocale()
  useEffect(() => {
    const heads = items
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-72px 0px -66% 0px' },
    )
    heads.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [items])

  const idx = items.findIndex((t) => t.id === active)
  return (
    <nav aria-label={t.tocAria} className="relative text-[13px]">
      {/* 活动指示条：--spring 滑动 */}
      <span
        aria-hidden
        className="absolute left-0 w-[2px] rounded-full transition-all duration-300"
        style={{
          background: 'var(--chapter)',
          height: '1.2em',
          top: `${idx >= 0 ? idx * 0 : 0}px`, /* 高度由每项自身呈现；此处做渐隐跟随 */
          transitionTimingFunction: 'var(--spring)',
          opacity: idx >= 0 ? 1 : 0,
        }}
      />
      <ul className="space-y-1.5 border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => {
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                // 延后 replaceState：平滑滚动进行中调用它会取消滚动
                const route = window.location.hash.match(/^#(?:\/en)?\/chapter\/([^#?]+)/)?.[1] ?? ''
                setTimeout(() => history.replaceState(null, '', `#${localePath(`/chapter/${route}`, locale)}#${item.id}`), 700)
              }}
              className={`block w-full py-0.5 pr-2 text-left leading-snug transition-colors duration-[var(--dur-instant)] ${
                item.depth === 3 ? 'pl-7' : 'pl-4'
              } ${active === item.id ? 'font-medium text-t1' : 'text-t3 hover:text-t2'}`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function PrevNext({ slug }: { slug: string }) {
  const t = useCopy()
  const locale = useLocale()
  const CHAPTERS_L = locale === 'en' ? CHAPTERS_EN : CHAPTERS
  const i = CHAPTERS_L.findIndex((c) => c.slug === slug)
  const prev = i > 0 ? CHAPTERS_L[i - 1] : null
  const next = i < CHAPTERS_L.length - 1 ? CHAPTERS_L[i + 1] : null
  const Card = ({ c, dir }: { c: (typeof CHAPTERS_L)[number]; dir: 'prev' | 'next' }) => (
    <Link
      to={localePath(`/chapter/${c.slug}`, locale)}
      viewTransition
      data-chapter={c.slug}
      className="card-lift press group flex-1 rounded-xl border border-line bg-surface p-5"
    >
      <p className="font-mono text-xs text-t3">{dir === 'prev' ? t.prevChapter : t.nextChapter}</p>
      <p className="mt-1.5 font-display text-base font-semibold" style={{ color: 'var(--chapter)' }}>
        {c.n === null ? c.title : `${String(c.n).padStart(2, '0')} · ${c.title}`}
      </p>
      <p className="mt-1 line-clamp-1 text-sm text-t3">{c.tagline}</p>
    </Link>
  )
  return (
    <nav className="mt-16 flex flex-col gap-4 sm:flex-row" aria-label={t.ariaChapterNav}>
      {prev ? <Card c={prev} dir="prev" /> : <div className="flex-1" />}
      {next ? <Card c={next} dir="next" /> : <div className="flex-1" />}
    </nav>
  )
}

export function Chapter() {
  const { slug = '1' } = useParams()
  const locale = useLocale()
  const t = useCopy()
  const meta = (locale === 'en' ? CHAPTERS_EN : CHAPTERS).find((c) => c.slug === slug)
  const [doc, setDoc] = useState<ChapterDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const progress = useReadingProgress(contentRef, !!doc)
  useChapterNumParallax(numRef, !!doc)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setDoc(null)
    modules[chapterFile(locale, slug)]?.().then((m) => {
      if (alive) {
        setDoc(m.default)
        setLoading(false)
      }
    })
    return () => { alive = false }
  }, [slug, locale])

  // 章节上下文挂载到 <html>（accent 群体换色）+ 恢复上次阅读位置 / 深链锚点（来自搜索或 TOC replaceState）
  useEffect(() => {
    if (doc) {
      document.documentElement.dataset.chapter = doc.slug
      const hashTarget = window.location.hash.split('#')[2] // #/chapter/2#h-... 的第三段
      const key = `abw-pos-${doc.slug}`
      const saved = Number(localStorage.getItem(key) || 0)
      if (hashTarget) {
        requestAnimationFrame(() => {
          document.getElementById(decodeURIComponent(hashTarget))?.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior })
          window.scrollBy(0, -70)
          history.replaceState(null, '', `#${localePath(`/chapter/${doc.slug}`, locale)}`)
        })
      } else if (saved > 200) {
        requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: 'instant' as ScrollBehavior }))
      } else {
        window.scrollTo({ top: 0 })
      }
      const onLeave = () => localStorage.setItem(key, String(window.scrollY))
      window.addEventListener('beforeunload', onLeave)
      return () => {
        onLeave()
        window.removeEventListener('beforeunload', onLeave)
      }
    }
  }, [doc, locale])

  if (loading || !doc) {
    return (
      <div className="mx-auto max-w-[calc(var(--measure)+2rem)] pt-6">
        <div className="skeleton h-10 w-2/3 rounded-lg" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton h-4 rounded" style={{ width: `${95 - (i % 4) * 12}%` }} />
          ))}
        </div>
      </div>
    )
  }

  const lengthCount = doc.wordCount ?? doc.cjkChars ?? 0

  return (
    <>
      {/* Agent 状态栏：阅读进度 */}
      <div className="reading-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />

      <div className="mx-auto flex max-w-7xl gap-10">
        <article ref={contentRef} className="mx-auto w-full max-w-[calc(var(--measure)+2rem)] min-w-0">
          {/* 章节扉页：三拍 stagger */}
          <header className="relative mb-10">
            <span
              aria-hidden
              ref={numRef}
              className="hero-num pointer-events-none absolute -top-10 right-0 select-none font-display font-semibold will-change-transform"
              style={{ fontSize: 'var(--fs-display)', color: 'var(--chapter)', opacity: 0.14, lineHeight: 1 }}
            >
              {meta?.n === null || !meta?.n ? '' : String(meta.n).padStart(2, '0')}
            </span>
            <p className="rise-in beat-1 font-mono text-xs uppercase tracking-[0.25em] text-t3">
              {doc.sourceFile} · {fill(t.minutesRead, { n: doc.minutes })}
            </p>
            <h1 className="rise-in beat-2 mt-3 font-display text-4xl font-semibold tracking-tight">
              {doc.title}
            </h1>
            {meta && (
              <p className="rise-in beat-3 mt-3 font-body text-lg text-t2" style={{ color: 'var(--chapter)' }}>
                {meta.tagline}
              </p>
            )}
          </header>

          {doc.blocks.map((b, i) => <BlockView key={i} block={b} />)}

          {/* 脚注 */}
          {doc.footnotes.length > 0 && (
            <section className="mt-14 border-t border-line pt-6">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-t3">{t.footnotesTitle}</h2>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-t2">
                {doc.footnotes.map((f) => (
                  <li key={f.id} id={`fn-${f.id}`} className="scroll-mt-24">
                    <span className="mr-1.5 font-mono text-xs" style={{ color: 'var(--accent)' }}>[{f.id}]</span>
                    <InlineText nodes={f.c} />
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* 内容溯源 */}
          <p className="mt-12 font-mono text-xs text-t3">
            {fill(t.sourceLine, { file: doc.sourceFile, commit: doc.sourceCommit, n: lengthCount.toLocaleString() })}
          </p>

          <PrevNext slug={doc.slug} />
        </article>

        {/* TOC：>1280 显示 */}
        <aside className="sticky top-24 hidden h-fit max-h-[calc(100dvh-8rem)] w-[var(--w-toc)] shrink-0 overflow-y-auto pb-10 xl:block">
          <Toc items={doc.toc} />
        </aside>
      </div>
    </>
  )
}

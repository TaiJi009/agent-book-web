import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, TYPE_ICON, type IconName } from '../components/Icon'
import { Stars } from '../components/Stars'
import { CHAPTERS } from '../lib/chapters'
import { useLocale, localePath } from '../lib/i18n'
import { useCopy, fill, type Copy } from '../lib/copy'
import zhIdx from '../content/experiments/index.json'
import enIdx from '../content/en/experiments/index.json'

interface ExpMeta {
  id: string
  altIds: string[]
  chapter: number
  name: string
  type: 'runnable' | 'repro' | 'design'
  typeLabel: string
  stars: number
  summary: string
  path: string | null
  status: string | null
}

type IndexFile = { experiments: ExpMeta[] }
const INDEX: Record<'zh' | 'en', IndexFile> = { zh: zhIdx as IndexFile, en: enIdx as IndexFile }

const TYPE_CN_KEYS: Record<ExpMeta['type'] | 'all', keyof Copy> = {
  all: 'filterAll', runnable: 'filterRunnable', repro: 'filterRepro', design: 'filterDesign',
}

/** 台账状态 → 徽章（禁 emoji：图标 + 文字） */
function StatusBadge({ status }: { status: string | null }) {
  const t = useCopy()
  if (!status) return null
  const passed = /^Passed/.test(status)
  const cls = passed ? 'ok' : 'warn'
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: `oklch(from var(--${cls}) l c h / .14)`, color: `var(--${cls})` }}
      title={status}
    >
      <Icon name={passed ? 'check' : 'clock'} size={11} />
      {passed ? t.statusPassed : t.statusPartial}
    </span>
  )
}

/** 筛选变化 → 网格 FLIP 重排：留存卡片位移 280ms + 30ms stagger（DESIGN.md §5.3） */
function useFlipGrid(ref: React.RefObject<HTMLDivElement | null>, dep: string) {
  const prev = useRef(new Map<string, { rect: DOMRect; el: HTMLElement }>())
  useLayoutEffect(() => {
    const box = ref.current
    if (!box) return
    const next = new Map<string, { rect: DOMRect; el: HTMLElement }>()
    Array.from(box.children).forEach((c) => {
      const el = c as HTMLElement
      const k = el.dataset.flipKey
      if (k) next.set(k, { rect: el.getBoundingClientRect(), el })
    })
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let stagger = 0
    for (const [k, { rect, el }] of next) {
      const old = prev.current.get(k)
      if (reduced || !old) continue
      const dx = old.rect.left - rect.left
      const dy = old.rect.top - rect.top
      if (!dx && !dy) continue
      el.style.transition = 'none'
      el.style.transform = `translate(${dx}px, ${dy}px)`
      el.style.zIndex = '1'
      // 强制回流后接续过渡
      void el.offsetWidth
      const delay = Math.min(stagger, 240)
      stagger += 30
      el.style.transition = `transform 280ms var(--ease-standard) ${delay}ms`
      el.style.transform = ''
      el.addEventListener('transitionend', () => { el.style.transition = ''; el.style.zIndex = '' }, { once: true })
    }
    prev.current = next
  }, [dep, ref])
}

export function Experiments() {
  const t = useCopy()
  const locale = useLocale()
  const [chapter, setChapter] = useState<number | 'all'>('all')
  const [type, setType] = useState<ExpMeta['type'] | 'all'>('all')
  const [query, setQuery] = useState('')
  const gridRef = useRef<HTMLDivElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)

  const ALL = INDEX[locale].experiments

  const list = useMemo(
    () =>
      ALL.filter((e) => chapter === 'all' || e.chapter === chapter)
        .filter((e) => type === 'all' || e.type === type)
        .filter((e) => !query || (e.summary + e.name + e.id).toLowerCase().includes(query.toLowerCase())),
    [ALL, chapter, type, query],
  )
  useFlipGrid(gridRef, `${locale}|${chapter}|${type}|${query}`)

  // 滑动指示 pill：测量活动 chip 的几何
  useLayoutEffect(() => {
    const box = chipsRef.current
    const active = box?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
    if (!box || !active) { setPill(null); return }
    const b = active.getBoundingClientRect()
    const r = box.getBoundingClientRect()
    setPill({ x: b.left - r.left, w: b.width })
  }, [type])


  return (
    <div className="rise-in mx-auto max-w-5xl">
      <header className="py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3">Experiments</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{t.navExperiments}</h1>
        <p className="mt-2 text-t2">
          {fill(t.expLibDesc, {
            total: ALL.length,
            runnable: ALL.filter((e) => e.type === 'runnable').length,
            repro: ALL.filter((e) => e.type === 'repro').length,
            design: ALL.filter((e) => e.type === 'design').length,
          })}
        </p>
      </header>

      {/* 筛选器 */}
      <div className="sticky top-14 z-30 -mx-2 flex flex-wrap items-center gap-2 bg-bg/90 px-2 py-3 backdrop-blur">
        <label className="relative">
          <Icon name="search" size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-t3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchExpPlaceholder}
            className="h-8 w-44 rounded-full border border-line bg-surface pl-8 pr-3 text-sm outline-none placeholder:text-t3 focus:border-accent"
          />
        </label>
        <select
          value={chapter}
          onChange={(e) => setChapter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          aria-label={t.ariaFilterChapter}
          className="h-8 rounded-full border border-line bg-surface px-3 text-sm outline-none focus:border-accent"
        >
          <option value="all">{t.filterAllChapters}</option>
          {CHAPTERS.filter((c) => c.n !== null).map((c) => (
            <option key={c.slug} value={c.n as number}>{fill(t.chapterN, { n: c.n as number })} · {c.title}</option>
          ))}
        </select>
        <div role="group" aria-label={t.ariaFilterType} ref={chipsRef} className="relative flex gap-1">
          {pill && (
            <span
              aria-hidden
              className="absolute top-0 h-full rounded-full bg-accent"
              style={{
                width: pill.w,
                transform: `translateX(${pill.x}px)`,
                transition: 'transform 300ms var(--spring), width 300ms var(--spring)',
              }}
            />
          )}
          {(['all', 'runnable', 'repro', 'design'] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={type === k}
              onClick={() => setType(k)}
              className={`relative rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--dur-instant)] ${
                type === k ? 'border-transparent text-[var(--accent-ink)]' : 'border-line text-t2 hover:text-t1'
              }`}
            >
              {t[TYPE_CN_KEYS[k]]}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-xs text-t3">{fill(t.nItems, { n: list.length })}</span>
      </div>

      {/* 实验卡片网格 */}
      <div ref={gridRef} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {list.map((e) => (
          <Link
            key={e.id}
            to={localePath(`/experiments/${e.id}`, locale)}
            viewTransition
            data-flip-key={e.id}
            data-chapter={String(e.chapter)}
            className="card-lift press relative overflow-hidden rounded-xl border border-line bg-surface p-4 pl-5"
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: 'var(--chapter)' }} />
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-accent-weak px-1.5 py-0.5 font-mono text-xs font-medium" style={{ color: 'var(--accent)' }}>
                {e.id}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-t3">
                <Icon name={TYPE_ICON[e.type] as IconName} size={12} />
                {e.typeLabel}
              </span>
              {e.stars > 0 && <Stars n={e.stars} />}
              <span className="ml-auto"><StatusBadge status={e.status} /></span>
            </div>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-t2">{e.summary || e.name}</p>
            <p className="mt-2 font-mono text-[11px] text-t3">
              {e.path ?? t.inlineExpCard}
            </p>
          </Link>
        ))}
      </div>
      {list.length === 0 && (
        <div className="py-20 text-center text-t3">
          {t.emptyFiltered}
          <button
            type="button"
            onClick={() => { setQuery(''); setChapter('all'); setType('all') }}
            className="u-link ml-1"
            style={{ color: 'var(--accent)' }}
          >
            {t.relaxFilters}
          </button>
        </div>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { CHAPTERS, CHAPTERS_EN, TOTAL_EXPERIMENTS } from '../lib/chapters'
import { useLocale } from '../lib/i18n'
import { useCopy, fill } from '../lib/copy'

/** 首页 ReAct 循环：光点沿环流动，三节点依次点亮（全站唯一 ambient 动画） */
function ReactLoop() {
  const t = useCopy()
  return (
    <svg viewBox="0 0 180 180" className="size-52 md:size-56" role="img" aria-label={t.reactLoopAria}>
      <circle cx="90" cy="90" r="80" fill="none" stroke="var(--divider)" strokeOpacity="0.55" strokeWidth="1.5" />
      {/* 流动光点：品牌橙 + 同色辉光 */}
      <circle r="11" fill="var(--accent)" opacity="0.18" className="react-orbit-dot" />
      <circle r="5.5" fill="var(--accent)" className="react-orbit-dot" />
      {/* 三节点：想（上）→ 动（右下）→ 观（左下） */}
      {([
        { x: 90, y: 10, label: t.loopThink, d: '0s' },
        { x: 159.3, y: 130, label: t.loopAct, d: '-2s' },
        { x: 20.7, y: 130, label: t.loopObserve, d: '-4s' },
      ] as const).map((p) => (
        <g key={p.d}>
          <circle cx={p.x} cy={p.y} r="16" fill="var(--surface)" stroke="var(--border)" />
          <text
            x={p.x} y={p.y + 5.5} textAnchor="middle" fontSize="14"
            fill="var(--text-1)" fontFamily="var(--font-body)"
          >
            {p.label}
          </text>
        </g>
      ))}
      <text x="90" y="170" textAnchor="middle" fontSize="10" fill="var(--text-3)">
        {t.loopCaption}
      </text>
    </svg>
  )
}

export function Home() {
  const t = useCopy()
  const locale = useLocale()
  const chapters = locale === 'en' ? CHAPTERS_EN : CHAPTERS
  const chapterTo = (slug: string) => (locale === 'en' ? `/en/chapter/${slug}` : `/chapter/${slug}`)
  return (
    <div className="rise-in">
      {/* ── Hero：公式 + ReAct 循环 ── */}
      <section className="flex flex-col items-center gap-6 py-8 text-center md:gap-7 md:py-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3 beat-1 rise-in">
          {t.heroKicker}
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-balance beat-1 rise-in md:text-5xl">
          {t.heroTitle}
          <span className="mt-3 block font-body text-xl font-normal text-t2 md:text-2xl">
            {t.heroSub}
          </span>
        </h1>
        <div className="beat-2 rise-in">
          <ReactLoop />
        </div>
        <div className="beat-3 rise-in flex flex-wrap items-center justify-center gap-3">
          <Link
            to={chapterTo('1')}
            viewTransition
            className="press rounded-lg bg-accent px-6 py-2.5 font-display text-sm font-medium text-[var(--accent-ink)]
                       transition-transform duration-[var(--dur-instant)] hover:shadow-[var(--shadow-2)]"
          >
            {t.startReading}
          </Link>
          <Link
            to={locale === 'en' ? '/en/experiments' : '/experiments'}
            viewTransition
            className="u-link px-2 py-2.5 font-display text-sm font-medium text-t1"
          >
            {fill(t.browseExperiments, { n: TOTAL_EXPERIMENTS })}
          </Link>
        </div>
      </section>

      {/* ── 数据带 ── */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
        {[
          ['10', t.bandChapters],
          [String(TOTAL_EXPERIMENTS), t.bandExperiments],
          ['5', t.bandToolFamilies],
          ['4', t.bandHarnesses],
        ].map(([num, label]) => (
          <div key={label} className="bg-surface px-6 py-5 text-center">
            <div className="font-display text-3xl font-semibold text-t1">{num}</div>
            <div className="mt-1 text-sm text-t3">{label}</div>
          </div>
        ))}
      </section>

      {/* ── 章节网格（每卡带章节色身份） ── */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t.structureTitle}</h2>
        <p className="mt-2 text-t2">{t.structureSub}</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c) => (
            <Link
              key={c.slug}
              to={chapterTo(c.slug)}
              viewTransition
              data-chapter={c.slug}
              className="card-lift press group relative overflow-hidden rounded-xl border border-line bg-surface p-5"
            >
              {/* 章节色左缘（非交互身份面） */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1"
                style={{ background: 'var(--chapter)' }}
              />
              <div className="flex items-baseline gap-3">
                <span
                  className="font-display text-2xl font-semibold"
                  style={{ color: 'var(--chapter)' }}
                >
                  {c.n === null ? c.title[0] : String(c.n).padStart(2, '0')}
                </span>
                <h3 className="font-display text-base font-semibold tracking-tight">{c.title}</h3>
              </div>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm text-t2">{c.tagline}</p>
              {c.experiments > 0 && (
                <p className="mt-3 font-mono text-xs text-t3">{fill(t.expCount, { n: c.experiments })}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

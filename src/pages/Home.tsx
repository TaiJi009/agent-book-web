import { Link } from 'react-router-dom'
import { CHAPTERS, TOTAL_EXPERIMENTS } from '../lib/chapters'

/** 首页 ReAct 循环：光点沿环流动，三节点依次点亮（全站唯一 ambient 动画） */
function ReactLoop() {
  return (
    <svg viewBox="0 0 180 180" className="size-52 md:size-56" role="img" aria-label="ReAct 循环：思考→行动→观察">
      <circle cx="90" cy="90" r="80" fill="none" stroke="var(--divider)" strokeOpacity="0.55" strokeWidth="1.5" />
      {/* 流动光点：品牌橙 + 同色辉光 */}
      <circle r="11" fill="var(--accent)" opacity="0.18" className="react-orbit-dot" />
      <circle r="5.5" fill="var(--accent)" className="react-orbit-dot" />
      {/* 三节点：想（上）→ 动（右下）→ 观（左下） */}
      {([
        { x: 90, y: 10, label: '想', d: '0s' },
        { x: 159.3, y: 130, label: '动', d: '-2s' },
        { x: 20.7, y: 130, label: '观', d: '-4s' },
      ] as const).map((p) => (
        <g key={p.label}>
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
        本书全部内容都在这个循环里展开
      </text>
    </svg>
  )
}

export function Home() {
  return (
    <div className="rise-in">
      {/* ── Hero：公式 + ReAct 循环 ── */}
      <section className="flex flex-col items-center gap-6 py-8 text-center md:gap-7 md:py-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3 beat-1 rise-in">
          Agent = LLM + Context + Tools
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-balance beat-1 rise-in md:text-5xl">
          深入理解 AI Agent
          <span className="mt-3 block font-body text-xl font-normal text-t2 md:text-2xl">
            设计原理与工程实践 · 从「能跑的 Demo」到「可靠的产品」
          </span>
        </h1>
        <div className="beat-2 rise-in">
          <ReactLoop />
        </div>
        <div className="beat-3 rise-in flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/chapter/1"
            viewTransition
            className="press rounded-lg bg-accent px-6 py-2.5 font-display text-sm font-medium text-[var(--accent-ink)]
                       transition-transform duration-[var(--dur-instant)] hover:shadow-[var(--shadow-2)]"
          >
            开始阅读
          </Link>
          <Link
            to="/experiments"
            viewTransition
            className="u-link px-2 py-2.5 font-display text-sm font-medium text-t1"
          >
            浏览 {TOTAL_EXPERIMENTS} 个实验
          </Link>
        </div>
      </section>

      {/* ── 数据带 ── */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
        {[
          ['10', '章正文'],
          [String(TOTAL_EXPERIMENTS), '配套实验'],
          ['5', '类工具体系'],
          ['4', '参考 Harness'],
        ].map(([num, label]) => (
          <div key={label} className="bg-surface px-6 py-5 text-center">
            <div className="font-display text-3xl font-semibold text-t1">{num}</div>
            <div className="mt-1 text-sm text-t3">{label}</div>
          </div>
        ))}
      </section>

      {/* ── 章节网格（每卡带章节色身份） ── */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">全书结构</h2>
        <p className="mt-2 text-t2">
          构建之力（第二至六章）→ 评估与进化（第七至九章）→ 群体协作（第十章）
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((c) => (
            <Link
              key={c.slug}
              to={`/chapter/${c.slug}`}
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
                <p className="mt-3 font-mono text-xs text-t3">{c.experiments} 个实验</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

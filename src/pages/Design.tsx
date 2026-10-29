import { useState } from 'react'
import { CHAPTERS } from '../lib/chapters'
import { Icon } from '../components/Icon'

/* 内部风格画廊（living style guide）：不进公共导航，S0 视觉验收基准 */

const BRAND = [
  ['Dark', '#141413', '正文文字 / 暗色底'],
  ['Light', '#faf9f5', '亮色底'],
  ['Mid Gray', '#b0aea5', '装饰：分隔线/禁用（禁用于正文）'],
  ['Light Gray', '#e8e6dc', '弱底：代码块/侧栏'],
  ['Orange', '#d97757', '主强调：链接/焦点/交互语言'],
  ['Blue', '#6a9bcc', '信息强调：复现类'],
  ['Green', '#788c5d', '成功强调：可运行类'],
] as const

const TYPE_RAMP = [
  ['display 96', 'var(--fs-display)', 'font-semibold', 'Poppins 600 · 扉页章号'],
  ['h1 34', 'var(--fs-h1)', 'font-semibold', '章标题'],
  ['h2 24', 'var(--fs-h2)', 'font-semibold', '节标题（≥24pt 走 Poppins）'],
  ['h3 19', 'var(--fs-h3)', 'font-semibold', '小节标题'],
  ['body 17.5', 'var(--fs-body)', 'font-normal', 'Lora + 思源宋 · 正文 1.92 行高'],
  ['small 14', 'var(--fs-small)', 'font-normal', '说明文字'],
  ['caption 12', 'var(--fs-caption)', 'font-normal', '元信息/脚注'],
] as const

function Section({ id, title, desc, children }: { id: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line py-12 first:border-t-0 first:pt-4">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      {desc && <p className="mt-1 text-sm text-t3">{desc}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function CopyButtonDemo() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      aria-label="复制代码"
      className="press grid size-8 place-items-center rounded-md border border-line bg-sunken text-t2 hover:text-accent"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="var(--ok)" strokeWidth="2.5">
          <path className="check-path" d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h8" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}

function ExpandCardDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="rounded-md bg-sunken px-2 py-0.5 font-mono text-xs text-t2">实验 2-10</span>
        <span className="font-display text-sm font-semibold">上下文压缩策略对比</span>
        <span className="inline-flex items-center gap-0.5">
          {[0, 1, 2].map((i) => <Icon key={i} name="star" size={12} className="fill-current" style={{ color: 'var(--accent)' }} />)}
        </span>
        <span className="ml-auto text-t3 transition-transform duration-[var(--dur-quick)]" style={{ transform: open ? 'rotate(180deg)' : '' }}>
          <Icon name="chevron-down" size={15} />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[var(--dur-smooth)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', transitionTimingFunction: 'var(--ease-standard)' }}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-line px-5 py-4 text-sm text-t2">
            <p style={{ transitionDelay: 'var(--stagger-fine)' }}>六种压缩策略在同一研究任务上的对照：无压缩 → 非任务感知 → 上下文感知 → 带引用 → 自适应窗口化。</p>
            <p className="font-mono text-xs text-t3">压缩率 3.0% · token 减少 75%+ · 引用保留无损索引</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Design() {
  const [ring, setRing] = useState('2')

  return (
    <div className="mx-auto max-w-4xl">
      <header className="py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3">Internal · Living Style Guide</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">设计画廊</h1>
        <p className="mt-2 text-t2">DESIGN.md 的实拍基准：品牌基底层 → 语义派生层 → 章节身份层；所有值以本页为准。</p>
        <nav className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="画廊目录">
          {[
            ['#brand', '品牌色板'], ['#semantic', '语义 tokens'], ['#ring', '章节色环'],
            ['#type', '字体'], ['#space', '间距与深度'], ['#motion', '动效'], ['#states', '组件状态'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="u-link text-t2">{label}</a>
          ))}
        </nav>
      </header>

      <Section id="brand" title="1 · 品牌基底层" desc="brand-guidelines skill 原始值，HEX 锚定，全局唯一真源">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BRAND.map(([name, hex, use]) => (
            <div key={name} className="overflow-hidden rounded-xl border border-line">
              <div className="h-16" style={{ background: hex }} />
              <div className="bg-surface px-3 py-2">
                <div className="font-display text-sm font-medium">{name}</div>
                <div className="font-mono text-xs text-t3">{hex}</div>
                <div className="mt-1 text-xs text-t3">{use}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="semantic" title="2 · 语义派生层" desc="由品牌层派生，随主题切换；下方样张即当前主题实值">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="text-t1">text-1 正文：Agent = LLM + 上下文 + 工具。</p>
            <p className="mt-2 text-t2">text-2 次级说明：上下文决定 Agent 能看到什么。</p>
            <p className="mt-2 text-t3">text-3 元信息：实验 2-10 · 2026-07-30 验收</p>
            <p className="mt-3">
              链接样式（u-link 下划线绘制）：<a href="#semantic" className="u-link" style={{ color: 'var(--accent)' }}>跳到本节开头</a>
            </p>
            <p className="mt-3">行内代码：<code>agent/pre-step</code> 瀑布流事件</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="space-y-3">
              {[['--bg', 'var(--bg)'], ['--bg-sunken', 'var(--bg-sunken)'], ['--surface', 'var(--surface)'], ['--accent', 'var(--accent)'], ['--ok', 'var(--ok)'], ['--info', 'var(--info)'], ['--warn', 'var(--warn)']].map(([name, val]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="size-6 rounded-md border border-line" style={{ background: val }} />
                  <code className="font-mono text-xs">{name}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="ring" title="3 · 章节身份层" desc="12 站 OKLCH 色环（彩度钳制到品牌区间）。点选查看身份面应用；注意：它只用于非交互身份面">
        <div className="flex flex-wrap gap-2">
          {CHAPTERS.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setRing(c.slug)}
              aria-pressed={ring === c.slug}
              data-chapter={c.slug}
              className={`press rounded-full border px-3 py-1.5 font-mono text-xs transition-colors duration-[var(--dur-quick)] ${
                ring === c.slug ? 'border-transparent text-white' : 'border-line text-t2 hover:text-t1'
              }`}
              style={ring === c.slug ? { background: 'var(--chapter)' } : undefined}
            >
              {c.n === null ? c.title : `ch${c.n}`}
            </button>
          ))}
        </div>
        <div data-chapter={ring} className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="h-1.5" style={{ background: 'var(--chapter)' }} />
          <div className="flex items-stretch">
            <span aria-hidden className="w-1 shrink-0" style={{ background: 'var(--chapter)' }} />
            <div className="p-5">
              <p className="font-display text-lg font-semibold">
                身份面样张 ·{' '}
                <span style={{ color: 'var(--chapter)' }}>
                  {CHAPTERS.find((c) => c.slug === ring)?.title}
                </span>
              </p>
              <p className="mt-1 text-sm text-t2">左缘条 / 标题重点字 / 顶部条取章节色；按钮与链接仍是品牌橙。</p>
              <button type="button" className="press mt-4 rounded-lg bg-accent px-4 py-1.5 font-display text-sm font-medium text-[var(--accent-ink)]">
                品牌橙按钮（不随章变化）
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section id="type" title="4 · 字体 ramp" desc="Poppins/Lora（品牌）+ 思源黑/宋（中文配对），@fontsource 本地打包">
        <div className="space-y-5 rounded-xl border border-line bg-surface p-6">
          {TYPE_RAMP.map(([label, size, weight, use]) => (
            <div key={label} className="flex items-baseline gap-6">
              <code className="w-24 shrink-0 font-mono text-xs text-t3">{label}</code>
              <span className={`font-display ${weight} truncate`} style={{ fontSize: size }}>
                深入理解 AI Agent · Agent = LLM
              </span>
              <span className="ml-auto hidden shrink-0 text-xs text-t3 sm:block">{use}</span>
            </div>
          ))}
          <div className="flex items-baseline gap-6 border-t border-line pt-5">
            <code className="w-24 shrink-0 font-mono text-xs text-t3">mono 13.5</code>
            <code className="font-mono" style={{ fontSize: '13.5px' }}>{`while True:  # ReAct loop`}</code>
          </div>
        </div>
      </Section>

      <Section id="space" title="5 · 间距与深度" desc="8pt 网格；深度四层：亮色靠边框、暗色靠阴影">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="font-mono text-xs text-t3">间距 tokens</p>
            <div className="mt-3 space-y-1.5">
              {[1, 2, 3, 4, 6, 8, 12].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="h-2 rounded bg-accent-weak" style={{ width: `calc(var(--sp-${s}) * 4)` }} />
                  <code className="font-mono text-xs text-t3">--sp-{s}</code>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="font-mono text-xs text-t3">深度四层</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                ['0 纸面', 'border-line'],
                ['1 卡片', 'border-line bg-surface'],
                ['2 浮层', 'shadow-2'],
                ['3 模态', 'shadow-3'],
              ].map(([label, cls]) => (
                <div key={label} className={`rounded-lg border border-line p-3 text-center text-sm ${cls}`}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="motion" title="6 · 动效演示" desc="时长/曲线 tokens 实拍：悬停、展开（0fr→1fr）、复制画勾、弹簧、链接绘制">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card-lift rounded-xl border border-line bg-surface p-5">
            <p className="font-display text-sm font-semibold">card-lift · hover 抬升 + 品牌橙描边</p>
            <p className="mt-1 text-sm text-t3">translateY(-2px) · 100ms standard</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="font-display text-sm font-semibold">u-link · 下划线绘制</p>
            <p className="mt-2">
              <a href="#motion" className="u-link text-t1">hover 我看下划线自左向右画出</a>
            </p>
            <p className="mt-2 text-sm text-t3">180ms standard · 离开自右退回</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="font-display text-sm font-semibold">复制按钮 · 勾 stroke 绘制</p>
            <div className="mt-3"><CopyButtonDemo /></div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="font-display text-sm font-semibold">press · 按下回弹</p>
            <button type="button" className="press mt-3 rounded-lg border border-line bg-sunken px-4 py-1.5 font-display text-sm">
              按住试试
            </button>
          </div>
          <div className="md:col-span-2 flex justify-center rounded-xl border border-line bg-surface p-6">
            <ExpandCardDemo />
          </div>
        </div>
        <p className="mt-4 text-sm text-t3">
          系统开启「减弱动态效果」时，以上动效自动降级为 80ms 交叉淡入（motion.css 全局处理）。
        </p>
      </Section>

      <Section id="states" title="7 · 组件状态矩阵" desc="六态全覆盖：default / hover / active / focus-visible / disabled / loading">
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="font-mono text-xs text-t3">Button</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button className="press rounded-lg bg-accent px-4 py-2 font-display text-sm font-medium text-[var(--accent-ink)]">default</button>
            <button className="press rounded-lg bg-accent px-4 py-2 font-display text-sm font-medium text-[var(--accent-ink)] opacity-90 shadow-[var(--shadow-2)]">hover 样张</button>
            <button className="rounded-lg bg-accent px-4 py-2 font-display text-sm font-medium text-[var(--accent-ink)] ring-2 ring-accent ring-offset-2 ring-offset-[var(--bg)]">focus-visible</button>
            <button disabled className="cursor-not-allowed rounded-lg bg-accent px-4 py-2 font-display text-sm font-medium text-[var(--accent-ink)] opacity-40">disabled</button>
            <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-display text-sm font-medium text-[var(--accent-ink)] opacity-70">
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              loading
            </button>
          </div>
          <p className="mt-5 font-mono text-xs text-t3">徽章三色（实验类型）</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'oklch(from var(--ok) l c h / .15)', color: 'var(--ok)' }}><span className="inline-flex items-center gap-1"><Icon name="play" size={12} />可运行</span></span>
            <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'oklch(from var(--info) l c h / .15)', color: 'var(--info)' }}><span className="inline-flex items-center gap-1"><Icon name="book-open" size={12} />复现</span></span>
            <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'oklch(from var(--warn) l c h / .15)', color: 'var(--warn)' }}><span className="inline-flex items-center gap-1"><Icon name="hammer" size={12} />进行中</span></span>
          </div>
        </div>
      </Section>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { CHAPTERS, TOTAL_EXPERIMENTS } from '../lib/chapters'
import { Icon } from '../components/Icon'

/* LEARNING.md 交互化：核心理念 → 学习路径（含关键洞察）→ 三层阅读法 → 难度分级 → 推荐首批项目 */

const INSIGHTS: Record<string, string> = {
  '1': '能跑的 Demo 与可靠产品之间的差距在 Harness，不在模型',
  '2': '全书最关键的一章：上下文决定能力上限，前缀越稳定缓存命中越高',
  '3': '把上下文从单次会话延伸为跨会话积累的持久知识',
  '4': '感知工具控信息量，执行工具控风险；工具设计应通用化',
  '5': '代码不只是写程序，而是能在运行时创造新工具的元能力',
  '6': '四类交互共享同一批系统原语：唤醒、安全点、取消、抢占、快慢分离',
  '7': '没有评估，就分不清「设计带来的提升」和「随机波动」',
  '8': 'SFT 记忆、RL 泛化；数据与环境比算法更重要',
  '9': '更新载体取决于能力如何被表达与验证',
  '10': '多 Agent 的每个设计决策都能在单 Agent 三要素中找到对应',
}

const READ_LAYERS = [
  { name: 'Starter', look: '项目 README 的目标、最小命令、验收条件；正文对应 skeleton', skip: '凭据加载、UI、provider adapter、长篇原始日志', question: '这个实验要证明哪条机制？' },
  { name: 'Builder', look: '入口函数、核心循环、状态/消息 schema、工具和验证器', skip: '与机制无关的兼容层、部署脚本', question: '哪一个变量改变了行为？' },
  { name: 'Maintainer', look: '测试、失败处理、证据格式、manifest/hash、回滚路径', skip: '只有改动实验时才需要的第三方源码细节', question: '结果是否可复核，失败是否被诚实记录？' },
] as const

const FIRST_PROJECTS = ['1-1', '2-10', '3-1', '4-3', '5-4', '6-2', '7-1', '8-9', '9-1', '10-4']

const LEVELS = [
  ['入门级', ['1', '2'], '初学者；只需 Python 基础和 LLM 使用经验'],
  ['进阶级', ['3', '4'], '有一定编程基础，涉及检索系统与工具集成'],
  ['高级', ['5', '6'], '较强编程能力，涉及复杂系统设计；第六章建议了解 HTTP/WebSocket'],
  ['工程级', ['7'], '评估基础设施与统计方法，重工程实践，数学要求不高'],
  ['专家级', ['8'], '全书唯一需要机器学习与模型训练经验的一章'],
  ['应用级', ['9', '10'], '综合运用前面所学，构建持续进化闭环与多 Agent 系统'],
] as const

export function Learning() {
  return (
    <div className="rise-in mx-auto max-w-3xl">
      <header className="py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3">Learning Path</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">学习路径</h1>
        <p className="mt-2 text-t2">如何高效阅读这本书：先建立全局认知，再按需深入；正文给原理骨架，实验给可运行的证据。</p>
      </header>

      {/* 核心理念 */}
      <section className="rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="font-display text-xl font-semibold tracking-tight">Agent = LLM + 上下文 + 工具</p>
        <p className="mt-2 text-sm text-t2">
          生产形态：Agent = Model + Harness（上下文管理 + 工具接口 + 约束 + 验证 + 纠正）——
          后三项正是「能跑的 Demo」与「可靠的产品」之间的差距
        </p>
      </section>

      {/* 十章路径 */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">第 1–6 章 · 构建；第 7–10 章 · 提升</h2>
        <div className="mt-4 space-y-2">
          {CHAPTERS.filter((c) => c.n !== null).map((c) => (
            <Link
              key={c.slug}
              to={`/chapter/${c.slug}`}
              viewTransition
              data-chapter={c.slug}
              className="card-lift flex items-start gap-4 rounded-xl border border-line bg-surface p-4"
            >
              <span
                className="shrink-0 font-display text-lg font-semibold"
                style={{ color: 'var(--chapter)' }}
              >
                {String(c.n).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="font-display text-sm font-semibold">{c.title}</span>
                <span className="mt-0.5 block text-sm text-t2">{INSIGHTS[c.slug]}</span>
              </span>
              <span className="ml-auto shrink-0 self-center font-mono text-[11px] text-t3">
                {c.experiments} 实验
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 三层阅读法 */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">三层阅读法</h2>
        <p className="mt-1 text-sm text-t3">每个实验项目都按此分层；先回答 Starter 层的问题，再决定要不要往下挖。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {READ_LAYERS.map((l, i) => (
            <div key={l.name} className="rounded-xl border border-line bg-surface p-4">
              <p className="flex items-center gap-2 font-display text-sm font-semibold">
                <span className="grid size-5 place-items-center rounded-full bg-accent-weak font-mono text-[10px]" style={{ color: 'var(--accent)' }}>
                  {i + 1}
                </span>
                {l.name}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-t2"><strong className="text-t1">先看</strong>：{l.look}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-t3"><strong>可跳过</strong>：{l.skip}</p>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--accent)' }}>{l.question}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 难度分级 */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">难度分级</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          {LEVELS.map(([name, chs, desc], i) => (
            <div key={name} className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 ${i % 2 ? 'bg-surface' : 'bg-sunken'}`}>
              <span className="w-16 shrink-0 font-display text-sm font-semibold">{name}</span>
              <span className="flex gap-1">
                {chs.map((c) => (
                  <Link key={c} to={`/chapter/${c}`} viewTransition data-chapter={c}
                    className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-t2"
                    style={{ borderColor: 'var(--chapter)' }}>
                    ch{c}
                  </Link>
                ))}
              </span>
              <span className="text-sm text-t2">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 推荐首批项目 */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">推荐首批动手项目</h2>
        <p className="mt-1 text-sm text-t3">每章一个入口实验，覆盖全书主线；共 {TOTAL_EXPERIMENTS} 项可任选延伸。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FIRST_PROJECTS.map((id) => (
            <Link
              key={id}
              to={`/experiments/${id}`}
              viewTransition
              className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-t2 transition-colors duration-[var(--dur-instant)] hover:border-accent hover:text-t1"
            >
              实验 {id}
              <Icon name="arrow-right" size={11} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

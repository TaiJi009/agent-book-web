import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface RefStat { label: string; value: string }
interface RefProject {
  id: string; name: string; oneLiner: string; kind: string; lang: string
  stats: RefStat[]; links: { kind: string; label: string }[]
}
interface RefIndex { projects: RefProject[]; sourceCommit: string }

const KIND_TAG: Record<string, string> = {
  'deepseek-harness': '框架',
  openclaw: '运行时',
  'hermes-agent': '实例',
  pycore: '骨架',
}

export function Reference() {
  const [data, setData] = useState<RefIndex | null>(null)
  useEffect(() => {
    import('../content/reference/index.json').then((m) => setData(m.default as unknown as RefIndex))
  }, [])

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl pt-6">
        <div className="skeleton h-9 w-48 rounded-lg" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-44 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="rise-in mx-auto max-w-3xl pb-16">
      <header className="pt-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-t3">Reference Projects</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">参考项目</h1>
        <p className="mt-3 leading-[1.9] text-t2">
          四个真实仓库，从教学骨架到生产级框架，构成书稿机制讲解的对照系：每个项目都在与正文章节和代码讲解互相印证。
          全部计数与 commit 由构建脚本扫描仓库核实，描述为人工策展。
        </p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {data.projects.map((p) => (
          <Link key={p.id} to={`/reference/${p.id}`} viewTransition
            className="card-lift group rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-t3">
                {p.lang} · {KIND_TAG[p.id] ?? p.kind}
              </span>
              <span className="font-mono text-[11px] text-t3 transition-colors group-hover:text-accent">阅读</span>
            </div>
            <h2 className="mt-2 font-display text-lg font-semibold tracking-tight">{p.name}</h2>
            <p className="mt-2 min-h-16 text-sm leading-[1.8] text-t2">{p.oneLiner}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3">
              {p.stats.map((s) => (
                <span key={s.label} className="font-mono text-[11px] text-t3">
                  {s.label} <span className="text-t1">{s.value}</span>
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 border-t border-line pt-4 font-mono text-xs text-t3">
        书稿基线 commit {data.sourceCommit} · 计数扫描自仓库工作副本
      </p>
    </div>
  )
}

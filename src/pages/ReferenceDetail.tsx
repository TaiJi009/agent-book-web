import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

interface RefLink { kind: 'chapter' | 'walkthrough' | 'experiments'; ch?: number; slug?: string; label: string }
interface RefGroup { name: string; note?: string; items: string[] }
interface RefModule { name: string; note: string }
interface RefProject {
  id: string; name: string; oneLiner: string; kind: string; lang: string; repoPath: string
  stats: RefStat[]; concepts: { title: string; body: string }[]
  groups?: RefGroup[]; modules?: RefModule[]; links: RefLink[]
}
interface RefStat { label: string; value: string }

const index = import.meta.glob<{ default: unknown }>('../content/reference/index.json')

export function ReferenceDetail() {
  const { projectId = '' } = useParams()
  const [projects, setProjects] = useState<RefProject[] | null>(null)

  useEffect(() => {
    let alive = true
    setProjects(null)
    index['../content/reference/index.json']?.().then((m) => {
      const d = m.default as { projects: RefProject[] }
      if (alive) setProjects(d.projects)
    })
    return () => { alive = false }
  }, [])

  const doc = projects?.find((p) => p.id === projectId)

  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl pt-6">
        <div className="skeleton h-9 w-2/3 rounded-lg" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-4 rounded" style={{ width: `${88 - (i % 3) * 15}%` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rise-in mx-auto max-w-3xl pb-16">
      <nav aria-label="面包屑" className="flex items-center gap-2 pt-4 font-mono text-xs text-t3">
        <Link to="/reference" viewTransition className="u-link hover:text-t1">参考项目</Link>
        <span>/</span>
        <span>{doc.id}</span>
      </nav>

      <header className="mt-4 border-b border-line pb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{doc.name}</h1>
        <p className="mt-2 font-body text-lg text-t2">{doc.oneLiner}</p>
        <p className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-t3">
          <span className="rounded-full border border-line px-2 py-0.5">{doc.kind}</span>
          <span className="rounded-full border border-line px-2 py-0.5">{doc.lang}</span>
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line sm:grid-cols-4" style={{ background: 'var(--line)' }}>
        {doc.stats.map((s) => (
          <div key={s.label} className="bg-surface px-4 py-3">
            <p className="font-mono text-lg font-semibold text-t1">{s.value}</p>
            <p className="mt-0.5 font-mono text-[11px] text-t3">{s.label}</p>
          </div>
        ))}
      </div>

      {doc.concepts.map((c, i) => (
        <section key={i} className="py-5">
          <h2 className="mb-2 font-display text-xl font-semibold tracking-tight">{c.title}</h2>
          <p className="leading-[1.9] text-t2">{c.body}</p>
        </section>
      ))}

      {doc.groups && (
        <section className="py-5">
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
            包族地图
            <span className="ml-2 font-mono text-xs font-normal text-t3">{doc.groups.reduce((n, g) => n + g.items.length, 0)} 个包族 · {doc.groups.length} 组</span>
          </h2>
          <div className="space-y-3">
            {doc.groups.map((g) => (
              <div key={g.name} className="rounded-xl border border-line bg-surface p-4">
                <p className="text-sm font-semibold text-t1">
                  {g.name}
                  {g.note && <span className="ml-2 font-normal text-t3">{g.note}</span>}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.items.map((it) => (
                    <code key={it} className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-t2">{it}</code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {doc.modules && (
        <section className="py-5">
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">模块导览</h2>
          <div className="overflow-hidden rounded-xl border border-line">
            {doc.modules.map((m, i) => (
              <div key={i} className="flex flex-col gap-1 border-b border-line bg-surface px-4 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
                <code className="shrink-0 font-mono text-xs text-t1 sm:w-64">{m.name}</code>
                <span className="text-sm text-t2">{m.note}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {doc.links.length > 0 && (
        <section className="py-5">
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">与书稿对照</h2>
          <ul className="space-y-2">
            {doc.links.map((l, i) => (
              <li key={i}>
                <Link
                  to={l.kind === 'chapter' ? `/chapter/${l.ch}` : l.kind === 'walkthrough' ? `/walkthroughs/${l.slug}` : '/experiments'}
                  viewTransition
                  className="group flex items-baseline gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 transition-colors hover:border-accent"
                >
                  {l.kind === 'chapter' && (
                    <span className="shrink-0 font-mono text-[11px] text-t3">ch{l.ch}</span>
                  )}
                  {l.kind === 'walkthrough' && (
                    <span className="shrink-0 font-mono text-[11px] text-t3">讲解</span>
                  )}
                  {l.kind === 'experiments' && (
                    <span className="shrink-0 font-mono text-[11px] text-t3">实验</span>
                  )}
                  <span className="text-sm text-t2 group-hover:text-t1">{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 border-t border-line pt-4 font-mono text-xs leading-relaxed text-t3">
        仓库位置：{doc.repoPath}
      </p>
    </div>
  )
}

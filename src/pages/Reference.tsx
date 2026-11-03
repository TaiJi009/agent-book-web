import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocale, localePath } from '../lib/i18n'
import { useCopy, fill, type Copy } from '../lib/copy'

interface RefStat { label: string; value: string }
interface RefProject {
  id: string; name: string; oneLiner: string; kind: string; lang: string
  stats: RefStat[]; links: { kind: string; label: string }[]
}
interface RefIndex { projects: RefProject[]; sourceCommit: string }

const KIND_TAG_KEY: Record<string, keyof Copy> = {
  'deepseek-harness': 'kindFramework',
  openclaw: 'kindRuntime',
  'hermes-agent': 'kindInstance',
  pycore: 'kindSkeleton',
}

const index = import.meta.glob<{ default: unknown }>([
  '../content/reference/index.json',
  '../content/en/reference/index.json',
])

export function Reference() {
  const [data, setData] = useState<RefIndex | null>(null)
  const locale = useLocale()
  const t = useCopy()
  useEffect(() => {
    let alive = true
    setData(null)
    const key = locale === 'en' ? '../content/en/reference/index.json' : '../content/reference/index.json'
    index[key]?.().then((m) => {
      if (alive) setData(m.default as unknown as RefIndex)
    })
    return () => { alive = false }
  }, [locale])

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
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">{t.navReference}</h1>
        <p className="mt-3 leading-[1.9] text-t2">{t.refDesc}</p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {data.projects.map((p) => (
          <Link key={p.id} to={localePath(`/reference/${p.id}`, locale)} viewTransition
            className="card-lift group rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-t3">
                {p.lang} · {t[KIND_TAG_KEY[p.id] ?? 'kindFramework']}
              </span>
              <span className="font-mono text-[11px] text-t3 transition-colors group-hover:text-accent">{t.readMore}</span>
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
        {fill(t.refFootnote, { commit: data.sourceCommit })}
      </p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CHAPTERS } from '../lib/chapters'
import { CopyCodeButton } from '../components/CopyCodeButton'

interface WtCode { kind: 'code'; file: string; from: number; to: number; total: number; html: string }
interface WtDiagram { kind: 'diagram'; svg: string }
interface WtSection { heading: string; blocks: ({ kind: 'p'; text: string } | WtCode | WtDiagram)[] }
interface WtDoc {
  slug: string; title: string; subtitle: string; project: string
  chapters: string[]; summary: string; sections: WtSection[]; sourceCommit: string
}

const modules = import.meta.glob<{ default: WtDoc }>('../content/walkthroughs/wt-*.json')

/** Shiki html → 纯文本（复制用）：逐行剥 span、还原实体 */
function htmlToText(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent ?? '').replace(/^\n/, '').replace(/\n$/, '')
}

export function WalkthroughDetail() {
  const { slug = '' } = useParams()
  const [doc, setDoc] = useState<WtDoc | null>(null)

  useEffect(() => {
    let alive = true
    setDoc(null)
    modules[`../content/walkthroughs/wt-${slug}.json`]?.().then((m) => alive && setDoc(m.default))
    return () => { alive = false }
  }, [slug])

  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl pt-6">
        <div className="skeleton h-9 w-2/3 rounded-lg" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-4 rounded" style={{ width: `${90 - (i % 3) * 14}%` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rise-in mx-auto max-w-3xl" data-chapter={doc.chapters[0]}>
      <nav aria-label="面包屑" className="flex items-center gap-2 pt-4 font-mono text-xs text-t3">
        <Link to="/walkthroughs" viewTransition className="u-link hover:text-t1">代码讲解</Link>
        <span>/</span>
        <span>{doc.project}</span>
      </nav>

      <header className="mt-4 border-b border-line pb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{doc.title}</h1>
        <p className="mt-2 font-body text-lg text-t2">{doc.subtitle}</p>
        <p className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-xs text-t3">
          源项目：
          <Link to={`/experiments`} viewTransition className="u-link" style={{ color: 'var(--accent)' }}>{doc.project}</Link>
          {doc.chapters.map((c) => (
            <Link key={c} to={`/chapter/${c}`} viewTransition data-chapter={c}
              className="rounded-full border px-2 py-0.5" style={{ borderColor: 'var(--chapter)' }}>
              {CHAPTERS.find((m) => m.slug === c)?.n ? `ch${CHAPTERS.find((m) => m.slug === c)?.n}` : c}
            </Link>
          ))}
        </p>
      </header>

      {doc.sections.map((s, si) => (
        <section key={si} className="py-6">
          {s.heading && <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">{s.heading}</h2>}
          {s.blocks.map((b, bi) => {
            if (b.kind === 'p')
              return <p key={bi} className="my-3 leading-[1.9] text-t2">{b.text}</p>
            if (b.kind === 'diagram')
              return (
                <div key={bi} className="my-5 rounded-xl border border-line bg-surface p-5 text-t2" dangerouslySetInnerHTML={{ __html: b.svg }} />
              )
            return (
              <figure key={bi} className="my-5">
                <div className="overflow-hidden rounded-xl border border-line" style={{ background: 'var(--bg-sunken)' }}>
                  <div className="flex items-center justify-between border-b border-line px-4 py-2">
                    <span className="font-mono text-xs text-t2">
                      {b.file}
                      <span className="ml-2 text-t3">L{b.from}–{b.to}</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono text-[11px] text-t3">共 {b.total} 行 · 完整源码见仓库</span>
                      <CopyCodeButton text={htmlToText(b.html)} />
                    </span>
                  </div>
                  <div className="shiki-host overflow-x-auto p-4 text-[13.5px] leading-[1.7]" dangerouslySetInnerHTML={{ __html: b.html }} />
                </div>
                <figcaption className="mt-2 text-xs text-t3">
                  行级引用：与仓库 {b.file} 对应行号一致；机制讲解见上方文字。
                </figcaption>
              </figure>
            )
          })}
        </section>
      ))}

      <p className="mt-8 border-t border-line pt-4 font-mono text-xs text-t3">
        源 commit {doc.sourceCommit} · 代码为白名单节选
      </p>
    </div>
  )
}

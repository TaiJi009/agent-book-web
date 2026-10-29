import glossaryData from '../content/glossary.json'
import { Link } from 'react-router-dom'
import { CHAPTERS } from '../lib/chapters'
import { Icon } from '../components/Icon'

interface Term { id: string; term: string; en: string; def: string; chapters: string[] }
const TERMS = (glossaryData as { terms: Term[] }).terms

export function Glossary() {
  return (
    <div className="rise-in mx-auto max-w-3xl">
      <header className="py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3">Glossary</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">术语表</h1>
        <p className="mt-2 text-t2">
          全书 {TERMS.length} 个关键概念，每条附出处章节。也可通过 <kbd className="rounded border border-line px-1 font-mono text-xs">⌘K</kbd> 搜索直达。
        </p>
      </header>

      <div className="space-y-3">
        {TERMS.map((t) => (
          <article
            key={t.id}
            id={`term-${t.id}`}
            className="scroll-mt-24 rounded-xl border border-line bg-surface p-5 transition-colors duration-[var(--dur-instant)] hover:border-accent"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-display text-base font-semibold tracking-tight">{t.term}</h2>
              <span className="font-mono text-xs text-t3">{t.en}</span>
              <span className="ml-auto flex flex-wrap gap-1.5">
                {t.chapters.map((c) => {
                  const meta = CHAPTERS.find((m) => m.slug === c)
                  return (
                    <Link
                      key={c}
                      to={`/chapter/${c}`}
                      viewTransition
                      data-chapter={c}
                      className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-t2 transition-colors hover:text-t1"
                      style={{ borderColor: 'var(--chapter)' }}
                    >
                      {meta?.n === null || !meta?.n ? meta?.title : `ch${meta.n}`}
                    </Link>
                  )
                })}
              </span>
            </div>
            <p className="mt-2 text-sm leading-[1.85] text-t2">{t.def}</p>
          </article>
        ))}
      </div>

      <p className="mt-10 flex items-center gap-2 text-sm text-t3">
        <Icon name="arrow-left" size={13} />
        定义均摘自书稿正文语境；完整论证请进入对应章节阅读。
      </p>
    </div>
  )
}

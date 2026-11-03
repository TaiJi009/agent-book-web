import { Link } from 'react-router-dom'
import { CHAPTERS } from '../lib/chapters'
import { Icon } from '../components/Icon'
import { useLocale, localePath } from '../lib/i18n'
import { useCopy, fill } from '../lib/copy'
import zhGlossary from '../content/glossary.json'
import enGlossary from '../content/en/glossary.json'

interface Term { id: string; term: string; en: string; def: string; chapters: string[] }
type GlossaryFile = { terms: Term[] }
const GLOSSARY: Record<'zh' | 'en', GlossaryFile> = {
  zh: zhGlossary as GlossaryFile,
  en: enGlossary as GlossaryFile,
}

export function Glossary() {
  const t = useCopy()
  const locale = useLocale()
  const TERMS = GLOSSARY[locale].terms
  return (
    <div className="rise-in mx-auto max-w-3xl">
      <header className="py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3">Glossary</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{t.navGlossary}</h1>
        <p className="mt-2 text-t2">
          {fill(t.glossaryDesc, { n: TERMS.length })}{' '}
          <kbd className="rounded border border-line px-1 font-mono text-xs">⌘K</kbd>{' '}
          {t.glossarySearchTail}
        </p>
      </header>

      <div className="space-y-3">
        {TERMS.map((term) => (
          <article
            key={term.id}
            id={`term-${term.id}`}
            className="scroll-mt-24 rounded-xl border border-line bg-surface p-5 transition-colors duration-[var(--dur-instant)] hover:border-accent"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-display text-base font-semibold tracking-tight">{term.term}</h2>
              {term.term !== term.en && <span className="font-mono text-xs text-t3">{term.en}</span>}
              <span className="ml-auto flex flex-wrap gap-1.5">
                {term.chapters.map((c) => {
                  const meta = CHAPTERS.find((m) => m.slug === c)
                  return (
                    <Link
                      key={c}
                      to={localePath(`/chapter/${c}`, locale)}
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
            <p className="mt-2 text-sm leading-[1.85] text-t2">{term.def}</p>
          </article>
        ))}
      </div>

      <p className="mt-10 flex items-center gap-2 text-sm text-t3">
        <Icon name="arrow-left" size={13} />
        {t.glossaryNote}
      </p>
    </div>
  )
}

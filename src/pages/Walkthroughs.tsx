import { Link } from 'react-router-dom'
import { useLocale, localePath } from '../lib/i18n'
import { useCopy, fill } from '../lib/copy'
import { Icon } from '../components/Icon'
import zhIndex from '../content/walkthroughs/index.json'
import enIndex from '../content/en/walkthroughs/index.json'

interface WtMeta {
  slug: string; title: string; subtitle: string; project: string
  chapters: string[]; summary: string; order: number
}
type WtIndexFile = { walkthroughs: WtMeta[] }
const INDEX: Record<'zh' | 'en', WtIndexFile> = { zh: zhIndex as WtIndexFile, en: enIndex as WtIndexFile }

export function Walkthroughs() {
  const t = useCopy()
  const locale = useLocale()
  const ALL = INDEX[locale].walkthroughs
  return (
    <div className="rise-in mx-auto max-w-4xl">
      <header className="py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3">Code Walkthroughs</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{t.navWalkthroughs}</h1>
        <p className="mt-2 text-t2">{fill(t.wtDesc, { n: ALL.length })}</p>
      </header>

      <div className="space-y-3">
        {ALL.map((w) => (
          <Link
            key={w.slug}
            to={localePath(`/walkthroughs/${w.slug}`, locale)}
            viewTransition
            data-chapter={w.chapters[0]}
            className="card-lift press block rounded-xl border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-display text-base font-semibold tracking-tight">{w.title}</h2>
              <span className="flex gap-1">
                {w.chapters.map((c) => (
                  <span key={c} className="rounded-full border border-line px-1.5 py-0.5 font-mono text-[10px] text-t3">
                    ch{c}
                  </span>
                ))}
              </span>
              <span className="ml-auto font-mono text-[11px] text-t3">{w.project}</span>
            </div>
            <p className="mt-1.5 text-sm text-t2">{w.subtitle}</p>
            <p className="mt-1.5 flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--accent)' }}>
              {t.readMore} <Icon name="arrow-right" size={11} />
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

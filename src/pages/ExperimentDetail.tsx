import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BlockView } from '../components/BlockRenderer'
import { Icon, TYPE_ICON, type IconName } from '../components/Icon'
import { Stars } from '../components/Stars'
import { CopyCodeButton } from '../components/CopyCodeButton'
import type { Block } from '../lib/types'
import { CHAPTERS } from '../lib/chapters'
import { useLocale, localePath } from '../lib/i18n'
import { useCopy, fill } from '../lib/copy'
import zhIdx from '../content/experiments/index.json'
import enIdx from '../content/en/experiments/index.json'

interface CodeFile { path: string; value: string; html: string; truncated: boolean }
interface ExpDetail {
  id: string
  altIds: string[]
  chapter: number
  name: string
  title: string | null
  type: 'runnable' | 'repro' | 'design'
  typeLabel: string
  stars: number
  summary: string
  path: string | null
  external: boolean
  status: string | null
  statusNote: string | null
  readme: Block[]
  codeFiles: CodeFile[]
}

type IndexFile = { experiments: Pick<ExpDetail, 'id' | 'title' | 'summary' | 'typeLabel'>[] }
const INDEX: Record<'zh' | 'en', IndexFile> = { zh: zhIdx as IndexFile, en: enIdx as IndexFile }

/* 详情 JSON 永远来自 zh 目录（上游实验文档仅中文）；en 由英文索引覆盖 title/summary/typeLabel */
const modules = import.meta.glob<{ default: ExpDetail }>('../content/experiments/exp-*.json')

export function ExperimentDetail() {
  const { id = '' } = useParams()
  const locale = useLocale()
  const t = useCopy()
  const [doc, setDoc] = useState<ExpDetail | null>(null)
  const [tab, setTab] = useState<'readme' | number>('readme')
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let alive = true
    setDoc(null)
    setMissing(false)
    setTab('readme')
    modules[`../content/experiments/exp-${id}.json`]?.().then((m) => {
      if (alive) setDoc(m.default)
    }).catch(() => alive && setMissing(true))
    return () => { alive = false }
  }, [id])

  useEffect(() => {
    if (doc) document.documentElement.dataset.chapter = String(doc.chapter)
  }, [doc])

  if (missing) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-xl font-semibold">{fill(t.expNotFound, { id })}</p>
        <Link to={localePath('/experiments', locale)} viewTransition className="u-link mt-3 inline-block" style={{ color: 'var(--accent)' }}>
          {t.backToExperiments}
        </Link>
      </div>
    )
  }
  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl pt-6">
        <div className="skeleton h-9 w-1/3 rounded-lg" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-4 rounded" style={{ width: `${92 - (i % 3) * 15}%` }} />
          ))}
        </div>
      </div>
    )
  }

  // en：英文索引元数据覆盖 zh 详情的 title/summary/typeLabel（readme/codeFiles 保持 zh）
  const idxRec = INDEX[locale].experiments.find((e) => e.id === doc.id)
  const view = locale === 'en' && idxRec
    ? { ...doc, title: idxRec.title, summary: idxRec.summary, typeLabel: idxRec.typeLabel }
    : doc
  const meta = CHAPTERS.find((c) => c.slug === String(view.chapter))
  const passed = view.status ? /^Passed/.test(view.status) : false

  return (
    <div className="rise-in mx-auto max-w-3xl" data-chapter={String(view.chapter)}>
      <nav aria-label={t.ariaBreadcrumb} className="flex items-center gap-2 pt-4 font-mono text-xs text-t3">
        <Link to={localePath('/experiments', locale)} viewTransition className="u-link hover:text-t1">{t.navExperiments}</Link>
        <span>/</span>
        <Link to={`${localePath(`/chapter/${view.chapter}`, locale)}#exp-${view.id}`} viewTransition className="u-link hover:text-t1">
          {fill(t.chapterN, { n: view.chapter })}
        </Link>
      </nav>

      {/* 头部 */}
      <header className="mt-4 border-b border-line pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-accent-weak px-2 py-0.5 font-mono text-sm font-medium" style={{ color: 'var(--accent)' }}>
            {fill(t.expBadge, { id: view.id })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-t2">
            <Icon name={TYPE_ICON[view.type] as IconName} size={12} />
            {view.typeLabel}
          </span>
          {view.stars > 0 && <Stars n={view.stars} size={13} tone="accent" />}
          {view.status && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: `oklch(from var(--${passed ? 'ok' : 'warn'}) l c h / .14)`, color: `var(--${passed ? 'ok' : 'warn'})` }}
              title={view.status}
            >
              <Icon name={passed ? 'check' : 'clock'} size={12} />
              {passed ? t.statusPassed : t.statusPartial}
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          {view.title ? <>{fill(t.expBadge, { id: view.id })} · {view.title}</> : view.name}
        </h1>
        <p className="mt-1.5 font-mono text-xs text-t3">{view.name}</p>
        <p className="mt-2 leading-relaxed text-t2">{view.summary}</p>
        <p className="mt-3 font-mono text-xs text-t3">
          {view.path ? <>{t.projPath}<span className="text-t2">{view.path}</span></> : t.inlineExp}
          {meta && <> · <span style={{ color: 'var(--chapter)' }}>{meta.tagline}</span></>}
        </p>
        {view.statusNote && (
          <div className="mt-4 rounded-xl border border-line bg-sunken px-4 py-3 text-sm leading-relaxed text-t2">
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-t3">{t.ledgerLabel} · </span>
            {view.statusNote}
          </div>
        )}
      </header>

      {/* Tab：README / 代码文件 */}
      {(view.readme.length > 0 || view.codeFiles.length > 0) && (
        <div role="tablist" aria-label={t.ariaDetailView} className="mt-6 flex flex-wrap gap-1 border-b border-line">
          {view.readme.length > 0 && (
            <button
              role="tab" aria-selected={tab === 'readme'}
              onClick={() => setTab('readme')}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors duration-[var(--dur-instant)] ${
                tab === 'readme' ? 'font-medium text-t1' : 'border-transparent text-t3 hover:text-t2'
              }`}
              style={tab === 'readme' ? { borderColor: 'var(--accent)' } : undefined}
            >
              <Icon name="book-open" size={14} /> {t.tabReadme}
            </button>
          )}
          {view.codeFiles.map((f, i) => (
            <button
              key={f.path}
              role="tab" aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 font-mono text-[13px] transition-colors duration-[var(--dur-instant)] ${
                tab === i ? 'font-medium text-t1' : 'border-transparent text-t3 hover:text-t2'
              }`}
              style={tab === i ? { borderColor: 'var(--accent)' } : undefined}
            >
              <Icon name="box" size={13} /> {f.path}
            </button>
          ))}
        </div>
      )}

      {/* README */}
      {tab === 'readme' && (
        <div className="py-6">
          {view.readme.length === 0 ? (
            <p className="text-sm text-t3">
              {view.path ? t.noReadmePath : t.noReadmeInline}
            </p>
          ) : (
            <>
              {locale === 'en' && (
                <p className="mb-4 rounded-lg border border-line bg-sunken px-4 py-2.5 text-sm text-t2">
                  {t.expZhDocNotice}
                </p>
              )}
              <div className="text-[0.95rem]">
                {view.readme.map((b, i) => <BlockView key={i} block={b} />)}
              </div>
            </>
          )}
        </div>
      )}

      {/* 代码文件 */}
      {typeof tab === 'number' && view.codeFiles[tab] && (
        <div className="py-6">
          <div className="overflow-hidden rounded-xl border border-line" style={{ background: 'var(--bg-sunken)' }}>
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="font-mono text-xs text-t2">{view.path}/{view.codeFiles[tab].path}</span>
              <span className="inline-flex items-center gap-2">
                {view.codeFiles[tab].truncated && <span className="font-mono text-[11px] text-t3">{t.truncated400}</span>}
                <CopyCodeButton text={view.codeFiles[tab].value} />
              </span>
            </div>
            <div className="shiki-host overflow-x-auto p-4 text-[13.5px] leading-[1.7]" dangerouslySetInnerHTML={{ __html: view.codeFiles[tab].html }} />
          </div>
          <p className="mt-3 font-mono text-xs text-t3">
            {fill(t.whitelistNote, { path: view.path ?? '' })}
          </p>
        </div>
      )}

      {view.altIds.length > 0 && (
        <p className="font-mono text-xs text-t3">{fill(t.altIdsNote, { ids: view.altIds.join(locale === 'en' ? ', ' : '、') })}</p>
      )}
    </div>
  )
}

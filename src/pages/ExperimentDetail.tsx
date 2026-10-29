import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BlockView } from '../components/BlockRenderer'
import { Icon, TYPE_ICON, type IconName } from '../components/Icon'
import { Stars } from '../components/Stars'
import { CopyCodeButton } from '../components/CopyCodeButton'
import type { Block } from '../lib/types'
import { CHAPTERS } from '../lib/chapters'

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

const modules = import.meta.glob<{ default: ExpDetail }>('../content/experiments/exp-*.json')

export function ExperimentDetail() {
  const { id = '' } = useParams()
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
        <p className="font-display text-xl font-semibold">实验 {id} 不在索引中</p>
        <Link to="/experiments" viewTransition className="u-link mt-3 inline-block" style={{ color: 'var(--accent)' }}>
          返回实验库
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

  const meta = CHAPTERS.find((c) => c.slug === String(doc.chapter))
  const passed = doc.status ? /^Passed/.test(doc.status) : false

  return (
    <div className="rise-in mx-auto max-w-3xl" data-chapter={String(doc.chapter)}>
      <nav aria-label="面包屑" className="flex items-center gap-2 pt-4 font-mono text-xs text-t3">
        <Link to="/experiments" viewTransition className="u-link hover:text-t1">实验库</Link>
        <span>/</span>
        <Link to={`/chapter/${doc.chapter}#exp-${doc.id}`} viewTransition className="u-link hover:text-t1">
          第 {doc.chapter} 章
        </Link>
      </nav>

      {/* 头部 */}
      <header className="mt-4 border-b border-line pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-accent-weak px-2 py-0.5 font-mono text-sm font-medium" style={{ color: 'var(--accent)' }}>
            实验 {doc.id}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-t2">
            <Icon name={TYPE_ICON[doc.type] as IconName} size={12} />
            {doc.typeLabel}
          </span>
          {doc.stars > 0 && <Stars n={doc.stars} size={13} tone="accent" />}
          {doc.status && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: `oklch(from var(--${passed ? 'ok' : 'warn'}) l c h / .14)`, color: `var(--${passed ? 'ok' : 'warn'})` }}
              title={doc.status}
            >
              <Icon name={passed ? 'check' : 'clock'} size={12} />
              {passed ? '已验收' : '部分验收'}
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          {doc.title ? <>实验 {doc.id} · {doc.title}</> : doc.name}
        </h1>
        <p className="mt-1.5 font-mono text-xs text-t3">{doc.name}</p>
        <p className="mt-2 leading-relaxed text-t2">{doc.summary}</p>
        <p className="mt-3 font-mono text-xs text-t3">
          {doc.path ? <>项目路径：<span className="text-t2">{doc.path}</span></> : '正文实验（无独立项目目录）'}
          {meta && <> · <span style={{ color: 'var(--chapter)' }}>{meta.tagline}</span></>}
        </p>
        {doc.statusNote && (
          <div className="mt-4 rounded-xl border border-line bg-sunken px-4 py-3 text-sm leading-relaxed text-t2">
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-t3">台账 · </span>
            {doc.statusNote}
          </div>
        )}
      </header>

      {/* Tab：README / 代码文件 */}
      {(doc.readme.length > 0 || doc.codeFiles.length > 0) && (
        <div role="tablist" aria-label="详情视图" className="mt-6 flex flex-wrap gap-1 border-b border-line">
          {doc.readme.length > 0 && (
            <button
              role="tab" aria-selected={tab === 'readme'}
              onClick={() => setTab('readme')}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors duration-[var(--dur-instant)] ${
                tab === 'readme' ? 'font-medium text-t1' : 'border-transparent text-t3 hover:text-t2'
              }`}
              style={tab === 'readme' ? { borderColor: 'var(--accent)' } : undefined}
            >
              <Icon name="book-open" size={14} /> 说明
            </button>
          )}
          {doc.codeFiles.map((f, i) => (
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
          {doc.readme.length === 0 ? (
            <p className="text-sm text-t3">
              {doc.path ? '该项目无 README；完整源码见仓库路径。' : '正文实验：请阅读对应章节正文。'}
            </p>
          ) : (
            <div className="text-[0.95rem]">
              {doc.readme.map((b, i) => <BlockView key={i} block={b} />)}
            </div>
          )}
        </div>
      )}

      {/* 代码文件 */}
      {typeof tab === 'number' && doc.codeFiles[tab] && (
        <div className="py-6">
          <div className="overflow-hidden rounded-xl border border-line" style={{ background: 'var(--bg-sunken)' }}>
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="font-mono text-xs text-t2">{doc.path}/{doc.codeFiles[tab].path}</span>
              <span className="inline-flex items-center gap-2">
                {doc.codeFiles[tab].truncated && <span className="font-mono text-[11px] text-t3">已截断至 400 行 · 完整源码见仓库</span>}
                <CopyCodeButton text={doc.codeFiles[tab].value} />
              </span>
            </div>
            <div className="shiki-host overflow-x-auto p-4 text-[13.5px] leading-[1.7]" dangerouslySetInnerHTML={{ __html: doc.codeFiles[tab].html }} />
          </div>
          <p className="mt-3 font-mono text-xs text-t3">
            白名单节选（≤3 文件 × 400 行）。完整代码与运行方式见仓库 {doc.path}
          </p>
        </div>
      )}

      {doc.altIds.length > 0 && (
        <p className="font-mono text-xs text-t3">关联编号：{doc.altIds.join('、')}（同一项目在多章引用）</p>
      )}
    </div>
  )
}

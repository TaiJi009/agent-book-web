import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Block } from '../lib/types'
import { InlineText } from './InlineText'
import { Stars } from './Stars'
import { Icon } from './Icon'
import { CopyCodeButton } from './CopyCodeButton'
import { htmlToText } from '../lib/htmlToText'
import { useCopy, fill } from '../lib/copy'

/* ── 图片灯箱：点击放大，Esc/点击关闭 ── */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const t = useCopy()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label={alt || t.zoomImage}
      className="fixed inset-0 z-[90] grid place-items-center p-6"
      style={{ background: 'var(--overlay)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <img src={src} alt={alt} className="max-h-[88vh] max-w-full rounded-xl bg-surface p-2 shadow-[var(--shadow-3)]" />
    </div>,
    document.body,
  )
}

export function Figure({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)
  const t = useCopy()
  return (
    <figure className="my-6 text-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? fill(t.ariaZoomWithAlt, { alt }) : t.ariaZoomImage}
        className="block w-full cursor-zoom-in"
      >
        <img src={src} alt={alt} loading="lazy" className="mx-auto max-w-full rounded-lg border border-line bg-surface" />
      </button>
      {alt && <figcaption className="mt-2 text-sm text-t3">{alt}</figcaption>}
      {open && <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </figure>
  )
}

/* ── 实验卡：折叠正文，渐进披露 ── */
export function ExperimentCard({ block }: { block: Extract<Block, { kind: 'experiment' }> }) {
  const [open, setOpen] = useState(false)
  const t = useCopy()
  return (
    <aside
      id={`exp-${block.id}`}
      className="relative my-6 overflow-hidden rounded-xl border border-line bg-surface scroll-mt-24"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: 'var(--chapter)' }} />
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 pl-6 text-left"
      >
        <span className="shrink-0 rounded-md bg-accent-weak px-2 py-0.5 font-mono text-xs font-medium" style={{ color: 'var(--accent)' }}>
          {fill(t.expBadge, { id: block.id })}
        </span>
        <span className="font-display text-sm font-semibold">{block.title}</span>
        <span data-stars={block.stars} title={fill(t.ariaStars, { n: block.stars })}>
          {block.stars > 0 && (open
            ? <Stars key="star-pop" n={block.stars} pop />
            : <Stars n={block.stars} />)}
        </span>
        <span
          aria-hidden
          className="ml-auto shrink-0 text-t3 transition-transform duration-[var(--dur-quick)]"
          style={{ transform: open ? 'rotate(180deg)' : '', transitionTimingFunction: 'var(--ease-standard)' }}
        >
          <Icon name="chevron-down" size={15} />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[var(--dur-smooth)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', transitionTimingFunction: 'var(--ease-standard)' }}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-line px-6 py-4 text-[0.95rem] leading-relaxed text-t2">
            {block.body.map((b, i) => <BlockView key={i} block={b} nested />)}
          </div>
        </div>
      </div>
    </aside>
  )
}

function Callout({ block }: { block: Extract<Block, { kind: 'callout' }> }) {
  return (
    <aside className="my-6 rounded-xl border border-line bg-sunken px-5 py-4">
      <p className="font-display text-xs font-semibold uppercase tracking-wider text-t3">{block.label}</p>
      <div className="mt-2 space-y-3 text-[0.95rem] leading-relaxed text-t2">
        {block.body.map((b, i) => <BlockView key={i} block={b} nested />)}
      </div>
    </aside>
  )
}

/* ── 块渲染器 ── */
export function BlockView({ block, nested = false }: { block: Block; nested?: boolean }) {
  switch (block.kind) {
    case 'heading': {
      const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'][block.depth - 1] ?? 'h6') as 'h2'
      const cls =
        block.depth === 1
          ? 'mt-2 font-display text-3xl font-semibold tracking-tight'
          : block.depth === 2
            ? 'mt-12 scroll-mt-24 font-display text-2xl font-semibold tracking-tight'
            : 'mt-8 scroll-mt-24 font-display text-[1.1875rem] font-semibold tracking-tight'
      return <Tag id={block.id} className={cls}>{block.text}</Tag>
    }
    case 'p':
      return <p className={`leading-[var(--leading-prose)] text-t1 ${nested ? 'my-2' : 'my-4'}`}><InlineText nodes={block.c} /></p>
    case 'quote':
      return (
        <blockquote className="my-4 border-l-2 border-divider pl-4 text-t2">
          {block.c.map((b, i) => <BlockView key={i} block={b} nested />)}
        </blockquote>
      )
    case 'callout':
      return <Callout block={block} />
    case 'experiment':
      return <ExperimentCard block={block} />
    case 'code':
      return (
        <div className="group relative my-5 overflow-hidden rounded-xl border border-line" style={{ background: 'var(--bg-sunken)' }}>
          {/* 右上角复制：hover 显现，触屏常显 60%；文案经 htmlToText 从 Shiki 产物反解 */}
          <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-[var(--dur-instant)] focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-60">
            <CopyCodeButton text={htmlToText(block.html)} />
          </div>
          <div
            className="shiki-host overflow-x-auto p-4 text-[13.5px] leading-[1.7]"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        </div>
      )
    case 'math':
      return block.html ? (
        <div className="my-5 overflow-x-auto text-center" dangerouslySetInnerHTML={{ __html: block.html }} />
      ) : (
        <p className="my-4 overflow-x-auto font-mono text-sm">{block.v}</p>
      )
    case 'table':
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-sunken">
                {block.header.map((c, i) => (
                  <th key={i} className="border-b border-line px-4 py-2.5 text-left font-display font-semibold">
                    <InlineText nodes={c} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, ri) => (
                <tr key={ri} className="transition-colors duration-[var(--dur-instant)] hover:bg-sunken">
                  {r.map((c, ci) => (
                    <td key={ci} className="border-b border-line px-4 py-2.5 align-top text-t2">
                      <InlineText nodes={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag className={`my-4 space-y-2 pl-6 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-t3`}>
          {block.items.map((item, i) => (
            <li key={i} className="pl-1 leading-[1.85]">
              {item.map((b, j) => <BlockView key={j} block={b} nested />)}
            </li>
          ))}
        </Tag>
      )
    }
    case 'figure':
      return <Figure src={block.src} alt={block.alt} />
    case 'hr':
      return <hr className="my-10 border-t border-line" />
    default:
      return null
  }
}

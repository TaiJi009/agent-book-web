import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { search, type Hit } from '../lib/search'
import { Icon } from './Icon'

const TYPE_LABEL = { section: '章节', experiment: '实验', term: '术语' } as const
const TYPE_ICON = { section: 'book-open', experiment: 'beaker', term: 'layers' } as const

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [sel, setSel] = useState(0)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQ(''); setHits([]); setSel(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setBusy(true)
    let alive = true
    const t = setTimeout(async () => {
      const r = await search(q)
      if (!alive) return
      setHits(r); setSel(0); setBusy(false)
    }, 120)
    return () => { alive = false; clearTimeout(t) }
  }, [q, open])

  const go = (h: Hit | undefined) => {
    if (!h) return
    onClose()
    if (h.type === 'section' || h.type === 'term') {
      navigate(`/chapter/${h.chapter}#${h.anchor}`)
    } else {
      navigate(`/experiments/${h.id.replace('exp-', '')}`)
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, hits.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
      if (e.key === 'Enter') { e.preventDefault(); go(hits[sel]) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, hits, sel]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null
  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-label="全局搜索"
      className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh]"
      style={{ background: 'var(--overlay)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-[min(640px,92vw)] overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-3)]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'rise-in var(--dur-smooth) var(--ease-entry) both' }}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Icon name="search" size={16} className="text-t3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索章节、实验、术语…"
            aria-label="搜索"
            className="h-12 flex-1 bg-transparent font-body text-[15px] outline-none placeholder:text-t3"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-t3">ESC</kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2" role="listbox" aria-label="搜索结果">
          {q.trim().length >= 2 && !busy && hits.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-t3">没有匹配结果——试试更短的关键词。</p>
          )}
          {q.trim().length < 2 && (
            <p className="px-3 py-8 text-center text-sm text-t3">输入至少两个字符开始检索全书、实验库与术语表。</p>
          )}
          {hits.map((h, i) => (
            <button
              key={h.id}
              role="option"
              aria-selected={i === sel}
              onClick={() => go(h)}
              onMouseEnter={() => setSel(i)}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-[var(--dur-instant)]"
              style={i === sel ? { background: 'var(--accent-weak)' } : undefined}
            >
              <span className="mt-0.5 shrink-0 text-t3"><Icon name={TYPE_ICON[h.type]} size={15} /></span>
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-medium text-t1">{h.title}</span>
                <span className="mt-0.5 block truncate text-xs text-t3">{h.text.slice(0, 90)}</span>
              </span>
              <span className="ml-auto shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-t3">
                {TYPE_LABEL[h.type]}{h.type === 'section' ? ` · ch${h.chapter}` : ''}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2 font-mono text-[10px] text-t3">
          <span>↑↓ 选择</span><span>Enter 跳转</span><span>Esc 关闭</span>
          <span className="ml-auto">bigram 全文检索 · 纯前端</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}

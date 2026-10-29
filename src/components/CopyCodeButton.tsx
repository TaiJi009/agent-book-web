import { useEffect, useRef, useState } from 'react'

/**
 * 复制代码按钮：图标 swap（copy → check 勾 stroke 绘制 240ms，2s 还原）。
 * DESIGN.md §5.3「复制代码」条目的真实实现（Design 画廊为演示复刻）。
 */
export function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // 剪贴板不可用（权限/旧内核）：退化为 execCommand
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* 静默失败 */ }
      ta.remove()
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? '已复制' : '复制代码'}
      className="press grid size-7 shrink-0 place-items-center rounded-md text-t3 transition-colors duration-[var(--dur-instant)] hover:text-accent"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="var(--ok)" strokeWidth={2.2}>
          <path className="check-path" d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.7}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h8" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}

import { Icon } from './Icon'

/**
 * 难度星级：SVG 点亮（替换文本 ★，符合禁 emoji/图标走 Icon 的硬约束）。
 * pop=true 时逐颗弹入（展开瞬间调用方换 key 重挂载触发，每颗延迟 40ms）。
 */
export function Stars({
  n, size = 12, tone = 't3', pop = false,
}: { n: number; size?: number; tone?: 't3' | 'accent'; pop?: boolean }) {
  if (n <= 0) return null
  return (
    <span className={pop ? 'star-pop' : 'inline-flex shrink-0 items-center gap-0.5'} role="img" aria-label={`难度 ${n} 星`}>
      {Array.from({ length: n }, (_, i) => (
        <Icon key={i} name="star" size={size} className="fill-current"
          style={{
            color: tone === 'accent' ? 'var(--accent)' : undefined,
            ...(pop ? { animationDelay: `${i * 40}ms` } : {}),
          }} />
      ))}
    </span>
  )
}

import { Link } from 'react-router-dom'
import type { Inline } from '../lib/types'
import { useLocale, localePath } from '../lib/i18n'
import { useCopy } from '../lib/copy'

/** 行内描述符渲染（抽取器产物，运行期零 markdown 依赖） */
export function InlineText({ nodes }: { nodes: Inline[] }) {
  const t = useCopy()
  const locale = useLocale()
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case 'skip':
            return null
          case 'text':
            return <span key={i}>{n.v}</span>
          case 'strong':
            return <strong key={i} className="font-semibold" style={{ color: 'var(--heading)' }}><InlineText nodes={n.c} /></strong>
          case 'em':
            return <em key={i}><InlineText nodes={n.c} /></em>
          case 'del':
            return <del key={i}><InlineText nodes={n.c} /></del>
          case 'code':
            return <code key={i}>{n.v}</code>
          case 'math':
            return n.html
              ? <span key={i} dangerouslySetInnerHTML={{ __html: n.html }} />
              : <code key={i}>{n.v}</code>
          case 'a':
            /* 纯页内锚点：HashRouter 下直接改写 hash 会被当路由解析成 404 → 阻止默认行为，平滑滚动到目标元素 */
            if (n.href.startsWith('#') && !n.href.startsWith('#/')) {
              const href = n.href
              return (
                <a key={i} href={href} className="u-link" style={{ color: 'var(--accent)' }}
                   onClick={(e) => {
                     e.preventDefault()
                     let id = href.slice(1)
                     try { id = decodeURIComponent(id) } catch { /* 保留原样 */ }
                     document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                   }}
                >
                  <InlineText nodes={n.c} />
                </a>
              )
            }
            if (n.href.startsWith('#/')) {
              return <Link key={i} to={n.href.slice(1)} viewTransition className="u-link" style={{ color: 'var(--accent)' }}><InlineText nodes={n.c} /></Link>
            }
            return (
              <a key={i} href={n.href} target={n.ext ? '_blank' : undefined} rel="noreferrer"
                 className="u-link" style={{ color: 'var(--accent)' }}>
                <InlineText nodes={n.c} />
              </a>
            )
          case 'img':
            return <img key={i} src={n.src} alt={n.alt} className="inline-block max-w-full rounded-lg align-middle" loading="lazy" />
          case 'br':
            return <br key={i} />
          case 'fnref':
            return (
              <sup key={i} className="fnref ml-0.5" data-fn={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById(`fn-${n.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    const route = window.location.hash.match(/^#(?:\/en)?\/chapter\/([^#?]+)/)?.[1] ?? ''
                    history.replaceState(null, '', `#${localePath(`/chapter/${route}`, locale)}`)
                  }}
                  className="cursor-help font-mono text-[0.72em] transition-colors"
                  style={{ color: 'var(--accent)' }}
                  title={`${t.fnTitle} [${n.id}]`}
                >
                  [{n.id}]
                </button>
              </sup>
            )
          default:
            return null
        }
      })}
    </>
  )
}

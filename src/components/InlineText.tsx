import { Link } from 'react-router-dom'
import type { Inline } from '../lib/types'

/** 行内描述符渲染（抽取器产物，运行期零 markdown 依赖） */
export function InlineText({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case 'skip':
            return null
          case 'text':
            return <span key={i}>{n.v}</span>
          case 'strong':
            return <strong key={i} className="font-semibold"><InlineText nodes={n.c} /></strong>
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
                    history.replaceState(null, '', `#/chapter/${window.location.hash.match(/^#\/chapter\/([^#?]+)/)?.[1] ?? ''}`)
                  }}
                  className="cursor-help font-mono text-[0.72em] transition-colors"
                  style={{ color: 'var(--accent)' }}
                  title={`脚注 [${n.id}]`}
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

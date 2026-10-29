import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'

export function Placeholder({ title, note }: { title: string; note: string }) {
  const { slug } = useParams()
  return (
    <div className="rise-in mx-auto max-w-xl py-24 text-center">
      <div className="mx-auto mb-6 w-fit">
        <svg viewBox="0 0 180 60" className="w-40" role="img" aria-label="ReAct 循环走丢了">
          <circle cx="30" cy="30" r="18" fill="var(--surface)" stroke="var(--border)" />
          <circle cx="90" cy="30" r="18" fill="var(--surface)" stroke="var(--border)" />
          <circle cx="150" cy="30" r="18" fill="var(--surface)" stroke="var(--border)" />
          <path d="M 48 30 H 72 M 108 30 H 132" stroke="var(--border)" strokeDasharray="4 4" />
        </svg>
      </div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
      {slug && <p className="mt-1 font-mono text-sm text-t3">chapter/{slug}</p>}
      <p className="mt-2 text-t2">{note}</p>
      <Link to="/" viewTransition className="u-link mt-6 inline-block" style={{ color: 'var(--accent)' }}>
        返回首页
      </Link>
    </div>
  )
}

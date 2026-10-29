import { Link } from 'react-router-dom'
import wtIndex from '../content/walkthroughs/index.json'
import { Icon } from '../components/Icon'

interface WtMeta {
  slug: string; title: string; subtitle: string; project: string
  chapters: string[]; summary: string; order: number
}
const ALL = (wtIndex as { walkthroughs: WtMeta[] }).walkthroughs

export function Walkthroughs() {
  return (
    <div className="rise-in mx-auto max-w-4xl">
      <header className="py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-t3">Code Walkthroughs</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">代码讲解</h1>
        <p className="mt-2 text-t2">
          {ALL.length} 个关键机制的深读：架构小图 + 分段讲解 + 行级注释代码，全部与真实仓库行号对齐。
          按书稿章节组织，可从正文实验卡与参考项目页交叉跳转。
        </p>
      </header>

      <div className="space-y-3">
        {ALL.map((w) => (
          <Link
            key={w.slug}
            to={`/walkthroughs/${w.slug}`}
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
              阅读 <Icon name="arrow-right" size={11} />
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

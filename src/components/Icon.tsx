/** 统一图标库：24px 网格 / 1.5px 描边 / 单色 currentColor（DESIGN.md 硬约束：UI 禁用 emoji） */

export type IconName =
  | 'sun' | 'moon' | 'chevron-down' | 'check' | 'x' | 'play' | 'book-open'
  | 'beaker' | 'hammer' | 'external' | 'arrow-right' | 'arrow-left'
  | 'clock' | 'search' | 'menu' | 'copy' | 'box' | 'layers' | 'route' | 'star'

const PATHS: Record<IconName, React.ReactNode> = {
  star: (
    <path
      d="M12 3.6l2.5 5.14 5.6.78-4.1 3.94 1.03 5.64L12 16.4l-5.03 2.7 1.03-5.64L3.9 9.52l5.6-.78L12 3.6z"
      strokeLinejoin="round"
    />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" strokeLinecap="round" />
    </>
  ),
  moon: <path d="M20.2 14.2A8.3 8.3 0 0 1 9.8 3.8a8.3 8.3 0 1 0 10.4 10.4Z" strokeLinejoin="round" />,
  'chevron-down': <path d="m5.5 9 6.5 6.5L18.5 9" strokeLinecap="round" strokeLinejoin="round" />,
  check: <path d="m4.5 12.5 5 5L19.5 6.5" strokeLinecap="round" strokeLinejoin="round" />,
  x: <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />,
  play: <path d="M7.5 4.8v14.4L19 12 7.5 4.8Z" strokeLinejoin="round" />,
  'book-open': (
    <>
      <path d="M12 6.2C10.4 4.7 8.2 4 3.8 4v14.5c4.4 0 6.6.7 8.2 2.2 1.6-1.5 3.8-2.2 8.2-2.2V4c-4.4 0-6.6.7-8.2 2.2Z" strokeLinejoin="round" />
      <path d="M12 6.2v14.5" />
    </>
  ),
  beaker: (
    <>
      <path d="M9.5 3.5v6.2L4.6 17a2.4 2.4 0 0 0 2 3.7h10.8a2.4 2.4 0 0 0 2-3.7l-4.9-7.3V3.5" strokeLinejoin="round" />
      <path d="M8 3.5h8M6.8 14.5h10.4" strokeLinecap="round" />
    </>
  ),
  hammer: <path d="m13.2 7.6 3.2 3.2M14.6 3.4a4.5 4.5 0 0 1 6 6l-2.8-1 -1.4 1.4-2.2-2.2 1.4-1.4-1-2.8ZM12.7 9.1 4 17.8a1.8 1.8 0 0 0 2.5 2.5l8.7-8.7" strokeLinecap="round" strokeLinejoin="round" />,
  external: (
    <>
      <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v10A2.5 2.5 0 0 0 6.5 20h10a2.5 2.5 0 0 0 2.5-2.5V14" strokeLinecap="round" />
      <path d="M14 4h6v6M20 4l-8.5 8.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'arrow-right': <path d="M4.5 12h14m0 0-5.5-5.5M18.5 12 13 17.5" strokeLinecap="round" strokeLinejoin="round" />,
  'arrow-left': <path d="M19.5 12h-14m0 0L11 6.5M5.5 12 11 17.5" strokeLinecap="round" strokeLinejoin="round" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.4V12l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.6 15.6 4.4 4.4" strokeLinecap="round" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" strokeLinecap="round" />
    </>
  ),
  box: (
    <>
      <path d="M12 2.8 21 7.4v9.2l-9 4.6-9-4.6V7.4l9-4.6Z" strokeLinejoin="round" />
      <path d="M3.3 7.6 12 12l8.7-4.4M12 12v9.2" strokeLinejoin="round" />
    </>
  ),
  layers: <path d="m12 3.5 9 4.5-9 4.5L3 8l9-4.5ZM4.8 12.3 12 16l7.2-3.7M4.8 16.3 12 20l7.2-3.7" strokeLinejoin="round" strokeLinecap="round" />,
  route: (
    <>
      <circle cx="5.5" cy="18.5" r="2.2" />
      <circle cx="18.5" cy="5.5" r="2.2" />
      <path d="M7.7 18.5H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7.3" strokeLinecap="round" />
    </>
  ),
}

export function Icon({ name, size = 18, className, label, style }: { name: IconName; size?: number; className?: string; label?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      className={className}
      style={style}
    >
      {PATHS[name]}
    </svg>
  )
}

/** 实验类型 → 图标 + 文字（替代书中 ✅📖🚧 emoji 记号进入 UI） */
export const TYPE_ICON = { runnable: 'play', repro: 'book-open', design: 'hammer' } as const

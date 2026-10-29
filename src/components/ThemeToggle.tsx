import { useState } from 'react'
import { getTheme, setThemeWithTransition, type Theme } from '../lib/theme'
import { Icon } from './Icon'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getTheme)

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeWithTransition(next, { x: e.clientX, y: e.clientY })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
      className="press grid size-9 place-items-center rounded-md border border-line bg-surface text-t2
                 transition-colors duration-[var(--dur-instant)] hover:text-accent"
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
    </button>
  )
}

import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { SearchModal } from '../components/SearchModal'
import { preloadSearchIndex } from '../lib/search'
import { Icon } from '../components/Icon'
import { useLocale, localePath, useDocumentLocale } from '../lib/i18n'
import { useCopy } from '../lib/copy'

const NAV = [
  { to: '/', key: 'navHome' },
  { to: '/experiments', key: 'navExperiments' },
  { to: '/walkthroughs', key: 'navWalkthroughs' },
  { to: '/reference', key: 'navReference' },
  { to: '/learning', key: 'navLearning' },
  { to: '/glossary', key: 'navGlossary' },
] as const

export function SiteLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const locale = useLocale()
  const t = useCopy()
  useDocumentLocale(locale)

  // 路由变化收起移动菜单
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // 首次搜索零等待：闲时预载当前语言的检索索引（切换语言后预载新索引）
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => preloadSearchIndex(locale)) : setTimeout(() => preloadSearchIndex(locale), 1200)
    return () => { if (typeof id === 'number') clearTimeout(id) }
  }, [locale])

  // ⌘K / Ctrl+K 全局搜索；Esc 收起移动菜单
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-dvh bg-bg text-t1">
      {/* 跳转链接：HashRouter 下不能用原生 hash href，preventDefault 后聚焦 main */}
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}
      >
        {t.skipToContent}
      </a>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* 静态前缀：顶栏永不重排 */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
        <div className="relative mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to={localePath('/', locale)} className="flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-tight">
            <span
              className="grid size-7 place-items-center rounded-md font-body text-sm font-semibold text-white"
              style={{ background: 'var(--brand-dark)' }}
            >
              A
            </span>
            <span>
              {t.siteName}
              <span className="ml-2 hidden text-xs font-normal text-t3 sm:inline">{t.siteBadge}</span>
            </span>
          </Link>

          <nav aria-label={t.ariaMainNav} className="ml-auto hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={localePath(n.to, locale)}
                viewTransition
                className={({ isActive }) =>
                  `rounded-md px-2.5 py-1.5 text-sm transition-colors duration-[var(--dur-instant)] ${
                    isActive ? 'bg-accent-weak text-t1' : 'text-t2 hover:bg-[var(--row-hover)] hover:text-t1'
                  }`
                }
              >
                {t[n.key]}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t.closeMenu : t.openMenu}
              aria-expanded={menuOpen}
              className="grid size-8 place-items-center rounded-full border border-line bg-surface text-t2 transition-colors duration-[var(--dur-instant)] hover:border-accent hover:text-t1 lg:hidden"
            >
              <Icon name={menuOpen ? 'x' : 'menu'} size={15} />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t.openSearch}
              className="flex h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs text-t3 transition-colors duration-[var(--dur-instant)] hover:border-accent hover:text-t2"
            >
              <Icon name="search" size={13} />
              {t.searchButton}
              <kbd className="hidden font-mono text-[10px] sm:inline">⌘K</kbd>
            </button>
            {/* 语言切换：保持当前路径，仅切 locale 前缀 */}
            <button
              type="button"
              onClick={() => navigate(localePath(pathname, locale === 'en' ? 'zh' : 'en'), { viewTransition: true })}
              aria-label={locale === 'en' ? t.switchToZh : t.switchToEn}
              className="press flex h-9 items-center rounded-md border border-line bg-surface px-2.5 font-display text-xs font-semibold tracking-wide text-t2 transition-colors duration-[var(--dur-instant)] hover:border-accent hover:text-t1"
            >
              {locale === 'en' ? t.langToggleZh : t.langToggleEn}
            </button>
            <ThemeToggle />
          </div>

          {/* 移动端导航面板：<lg 视口的主导航入口 */}
          {menuOpen && (
            <nav
              aria-label={t.ariaMobileNav}
              className="rise-in absolute inset-x-0 top-full border-b border-line bg-bg/95 backdrop-blur lg:hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
                {NAV.map((n) => (
                  <NavLink
                    key={n.to}
                    to={localePath(n.to, locale)}
                    viewTransition
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors duration-[var(--dur-instant)] ${
                        isActive ? 'bg-accent-weak font-medium text-t1' : 'text-t2 active:bg-sunken'
                      }`
                    }
                  >
                    {t[n.key]}
                    <Icon name="arrow-right" size={14} className="text-t3" />
                  </NavLink>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 pb-24 pt-8 outline-none sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 text-sm text-t3 sm:px-6">
          <p className="mr-auto">
            {t.footerDerivedFrom}
            <a href="https://github.com/bojieli/ai-agent-book" target="_blank" rel="noreferrer" className="u-link">
              {t.footerBookTitle}
            </a>
            {t.footerLicense} {t.footerUnofficial}
          </p>
          <Link to={localePath('/glossary', locale)} viewTransition className="u-link">{t.navGlossary}</Link>
          <Link to="/design" className="font-mono text-xs">/design</Link>
        </div>
      </footer>
    </div>
  )
}

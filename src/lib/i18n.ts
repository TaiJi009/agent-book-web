import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** 站点语言。locale 完全由 URL 派生（#/en/… 前缀 = 英文），无独立状态，链接可直接分享 */
export type Locale = 'zh' | 'en'

export function useLocale(): Locale {
  const { pathname } = useLocation()
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'zh'
}

/** 路径语言前缀映射：zh→en 加 /en，en→zh 去掉 /en */
export function localePath(path: string, locale: Locale): string {
  if (locale === 'en') return path === '/' ? '/en' : `/en${path}`
  return path.startsWith('/en') ? (path.slice(3) || '/') : path
}

/** html lang + document.title 随 locale 切换（SiteLayout 挂载一次） */
export function useDocumentLocale(locale: Locale) {
  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN'
    document.title = locale === 'en'
      ? 'AI Agents in Depth · Knowledge Site'
      : '深入理解 AI Agent · 知识站'
  }, [locale])
}

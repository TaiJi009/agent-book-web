export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function applyTheme(t: Theme) {
  const root = document.documentElement
  // 关键：VT 回调内翻转属性会触发 transition-colors，而 VT 接管渲染期间
  // CSSTransition 可能永久卡在起点（计算样式滞留旧色）。冻结全局过渡让颜色瞬时落定，
  // 视觉过渡完全交给圆形揭示。rAF 饿死环境用 setTimeout 兜底解冻。
  root.classList.add('theme-switching')
  root.dataset.theme = t === 'dark' ? 'dark' : ''
  try { localStorage.setItem('abw-theme', t) } catch { /* 私密模式忽略 */ }
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')))
  setTimeout(() => root.classList.remove('theme-switching'), 250)
}

/**
 * 主题切换：View Transitions 圆形揭示（自点击坐标扩散）。
 * 嵌入式/遮挡视口下 rAF 可能被饿死，故四条兜底：
 *  1) 回调同步完成（不等待任何帧）——主题必然落盘；
 *  2) applyTheme 冻结全局 color transition——不让过渡在 VT 接管渲染期间启动；
 *  3) 700ms 后强制清理 viewTransitionName——后续切换永不阻塞；
 *  4) 强杀滞留 CSSTransition——渲染帧停摆时过渡会卡在 startTime=0（计算样式
 *     永远返回旧色），finish() 使其立即落到终点值（= 底层新色）。
 */
function killStuckColorTransitions() {
  for (const a of document.getAnimations()) {
    if (a.constructor.name === 'CSSTransition' && a.playState === 'running') {
      try { a.finish() } catch { try { a.cancel() } catch { /* ignore */ } }
    }
  }
}

export function setThemeWithTransition(next: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const start = (document as Document & {
    startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<unknown> }
  }).startViewTransition

  const apply = () => applyTheme(next)
  if (!start || reduced) { apply(); return }
  if (root.style.viewTransitionName) { apply(); return } // 上一次过渡未清干净：直接切换

  root.style.viewTransitionName = 'theme'
  if (origin) {
    root.style.setProperty('--vt-x', `${origin.x}px`)
    root.style.setProperty('--vt-y', `${origin.y}px`)
  }
  try {
    const transition = start(() => { apply() })
    // 两道强杀：700ms 常规清理；1200ms 兜底（覆盖 VT 收尾窗口内新建的过渡）
    setTimeout(() => { root.style.viewTransitionName = ''; killStuckColorTransitions() }, 700)
    setTimeout(killStuckColorTransitions, 1200)
    void transition.finished.catch(() => {}).finally(() => {
      root.style.viewTransitionName = ''
      killStuckColorTransitions()
    })
  } catch {
    apply()
    root.style.viewTransitionName = ''
  }
}

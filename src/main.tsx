import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts'
import './styles/global.css'
import 'katex/dist/katex.min.css'
import App from './App'

// SPA 自管滚动（锚点跳转/阅读位置恢复），禁用浏览器对 history 条目的自动滚动恢复
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base './' + HashRouter：dist 可被任意静态服务器/子路径托管
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // 分享模式：JS/CSS 内联进单个 index.html（file:// 双击即开）；字体由 assetsInlineLimit=0 保留为外部文件
    ...(mode === 'single' ? [viteSingleFile({ removeViteModuleLoader: true, useRecommendedBuildConfig: false })] : []),
  ],
  build: {
    target: 'es2022',
    // single 模式：JS/CSS 内联进 index.html；字体保持外部文件（vault 约定：资源与 html 同层）
    ...(mode === 'single'
      ? {
          cssCodeSplit: false,
          assetsInlineLimit: 0,
          rollupOptions: { output: { inlineDynamicImports: true } },
        }
      : {}),
  },
}))

# agent-book-web

《深入理解 AI Agent：设计原理与工程实践》的开源知识站（中英双语）：章节正文、配套实验库、代码讲解、参考项目导航。React 19 + Vite 6 + TypeScript + Tailwind CSS 4 纯前端单页应用，构建产物可托管于任意静态服务器。

线上地址：<https://taiji009.github.io/agent-book-web/>（英文版 `/#/en/`，顶栏 EN/中 切换）

## 内容来源与版权

本站内容改编自李博杰的开源书稿 [bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book)（Apache License 2.0），内容快照为上游 commit `6da8917c`（2026-10-28）。修改包括：将书稿 Markdown 提取为结构化 JSON、重排为 web 版式、补充代码讲解与参考项目导航。

- 中文内容取自上游 `book/`；英文内容取自上游 `book-en/`（社区翻译，可能滞后于中文版）
- 实验详情文档上游仅有中文，英文版详情页复用中文并标注
- 第三方内容归属、字体与第三方仓库声明见 [NOTICE.md](NOTICE.md)
- 本仓库依 Apache License 2.0 授权（见 [LICENSE](LICENSE)）
- 本站为非官方第三方项目，与上游书稿作者无隶属或背书关系

## 开发

```bash
npm install
npm run dev           # 本地开发服务器
npm run build         # 产物输出 dist/
npm run build:single  # 单文件分享版（file:// 双击即开，字体保持外部文件；仅中文版）
npm run content       # 重建中文内容（依赖本地书稿与参考仓库路径，仅本地可用；
                      # 仓库已附带生成好的 src/content/，常规开发无需运行）
npm run content:en    # 重建英文内容（book-en/ → src/content/en/）
```

## 部署

GitHub Pages：推送到 `main` 后由 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 自动构建并部署。路由采用 HashRouter + 相对 base（`base: './'`），可托管于任意静态服务器、子路径或 `file://` 场景（单文件模式）。

## 技术栈

React 19 · Vite 6 · TypeScript · Tailwind CSS 4 · Shiki · KaTeX · @fontsource（Noto Serif SC / Noto Sans SC / Lora / Poppins / JetBrains Mono）

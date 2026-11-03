# NOTICE

本仓库（agent-book-web）为混合来源项目：除下列第三方授权内容外，其余部分版权归仓库作者所有，依 Apache License 2.0 授权（见 [LICENSE](LICENSE)）。

## 上游书稿（衍生内容的主要来源）

- **作品**：《深入理解 AI Agent：设计原理与工程实践》的章节正文、配套实验内容与插图（fig*.svg 等）
- **上游仓库**：<https://github.com/bojieli/ai-agent-book> · Copyright © 李博杰 (bojieli)，Apache License 2.0
- **本站内容快照**：上游 commit `6da8917c`（2026-10-28 工作区 checkout）
- **修改说明**：书稿 Markdown 经 `scripts/extract-book.mjs`、`scripts/extract-experiments.mjs`、`scripts/build-walkthroughs.mjs`、`scripts/build-reference.mjs` 等提取脚本转换为结构化 JSON（`src/content/`）并重排为 web 版式；提取脚本与生成数据均在本仓库中公开，生成数据内含 `sourceCommit` 字段以便溯源

## 英文版内容来源

- **章节正文（英文）**：取自上游 `book-en/`，为上游社区翻译（署名 @nsdevaraj、@whanyu1212，Apache License 2.0），可能滞后于中文原版（如 ch7–ch10 缺少部分实验块，如实呈现）；插图取自上游 `book-en/images/`（已英文化）
- **章级实验索引（英文）**：取自上游各章 `chapterN/README.en.md`；台账 `EXPERIMENT_LEDGER.md` 原生英文
- **实验详情文档**：上游未提供逐实验英文文档，英文版详情页复用中文详情并在页面标注
- **本站自有内容的英文版**（代码讲解 8 篇、参考项目策展、学习路径、术语表定义、UI 文案）为本仓库作者的翻译/创作，随本仓库同许可分发

## 字体（经 @fontsource 分发，均为 SIL Open Font License 1.1）

- Noto Sans SC、Noto Serif SC（思源黑体 / 思源宋体）
- Lora、Poppins、JetBrains Mono

## 「参考项目」页提及的第三方仓库

openclaw、hermes-agent、DeepSeek 相关仓库等仅以名称与链接形式列出（见 `src/content/reference/`），本仓库不重分发其源码，各自许可证以其所属仓库为准。

## 免责声明

本项目为非官方第三方项目，与上游书稿作者无隶属或背书关系。Apache License 2.0 不授予商标使用权，本站命名与内容不用于暗示官方身份。

import { useLocale, type Locale } from './i18n'

/**
 * 全站 UI 文案字典（正文内容不在其中——正文来自 content/*.json 按语言加载）。
 * zh 为基准键集，en 必须同构（TS 约束）。批次推进时按页补充键。
 */
const zh = {
  // ── SiteLayout ──
  siteName: '深入理解 AI Agent',
  siteBadge: '知识站',
  navHome: '首页',
  navExperiments: '实验库',
  navWalkthroughs: '代码讲解',
  navReference: '参考项目',
  navLearning: '学习路径',
  navQuiz: '思考题',
  navGlossary: '术语表',
  skipToContent: '跳到正文',
  searchButton: '搜索',
  ariaMainNav: '主导航',
  ariaMobileNav: '移动端导航',
  openMenu: '打开导航菜单',
  closeMenu: '收起导航菜单',
  openSearch: '打开搜索',
  switchToEn: '切换到 English',
  switchToZh: '切换到中文',
  langToggleEn: 'EN',
  langToggleZh: '中',
  footerDerivedFrom: '内容源自开源书稿',
  footerBookTitle: '《深入理解 AI Agent》',
  footerLicense: '（Apache-2.0）·',
  footerUnofficial: '本站为非官方第三方只读知识站',

  // ── Home ──
  heroKicker: 'Agent = LLM + Context + Tools',
  heroTitle: '深入理解 AI Agent',
  heroSub: '设计原理与工程实践 · 从「能跑的 Demo」到「可靠的产品」',
  startReading: '开始阅读',
  reactLoopAria: 'ReAct 循环：思考→行动→观察',
  loopThink: '想',
  loopAct: '动',
  loopObserve: '观',
  loopCaption: '本书全部内容都在这个循环里展开',
  bandChapters: '章正文',
  bandExperiments: '配套实验',
  bandToolFamilies: '类工具体系',
  bandHarnesses: '参考 Harness',
  structureTitle: '全书结构',
  structureSub: '构建之力（第二至六章）→ 评估与进化（第七至九章）→ 群体协作（第十章）',
  expCount: '{n} 个实验',
  browseExperiments: '浏览 {n} 个实验',

  // ── Chapter ──
  tocAria: '本章目录',
  ariaChapterNav: '章节导航',
  prevChapter: '← 上一章',
  nextChapter: '下一章 →',
  minutesRead: '约 {n} 分钟',
  footnotesTitle: '脚注',
  sourceLine: '源：{file} @ {commit} · {n} 字',

  // ── BlockRenderer / Stars / InlineText ──
  zoomImage: '图片放大',
  ariaZoomImage: '放大图片',
  ariaZoomWithAlt: '放大图片：{alt}',
  expBadge: '实验 {id}',
  ariaStars: '难度 {n} 星',
  fnTitle: '脚注',

  // ── Placeholder ──
  notFoundTitle: 'Agent 走丢了',
  notFoundNote: '404 · 这个路径不在上下文里',
  backHome: '返回首页',
  placeholderAria: 'ReAct 循环走丢了',

  // ── 实验库 / 实验详情 ──
  chapterN: '第 {n} 章',
  expNotFound: '实验 {id} 不在索引中',
  backToExperiments: '返回实验库',
  projPath: '项目路径：',
  inlineExp: '正文实验（无独立项目目录）',
  inlineExpCard: '正文实验（无独立项目）',
  ledgerLabel: '台账',
  tabReadme: '说明',
  ariaDetailView: '详情视图',
  noReadmePath: '该项目无 README；完整源码见仓库路径。',
  noReadmeInline: '正文实验：请阅读对应章节正文。',
  truncated400: '已截断至 400 行 · 完整源码见仓库',
  whitelistNote: '白名单节选（≤3 文件 × 400 行）。完整代码与运行方式见仓库 {path}',
  altIdsNote: '关联编号：{ids}（同一项目在多章引用）',
  ariaBreadcrumb: '面包屑',
  expZhDocNotice: '详情文档暂为中文（上游英文版尚未提供逐实验文档）；标题与摘要已本地化。',
  expLibDesc: '全书 {total} 项配套实验：{runnable} 可运行 · {repro} 外部复现 · {design} 设计文档。台账状态如实呈现，包括负结果。',
  searchExpPlaceholder: '搜索实验…',
  ariaFilterChapter: '按章节筛选',
  ariaFilterType: '按类型筛选',
  filterAllChapters: '全部章节',
  filterAll: '全部',
  filterRunnable: '可运行',
  filterRepro: '复现',
  filterDesign: '设计',
  nItems: '{n} 项',
  emptyFiltered: '没有匹配的实验。',
  relaxFilters: '放宽筛选',
  statusPassed: '已验收',
  statusPartial: '部分验收',

  // ── SearchModal ──
  ariaGlobalSearch: '全局搜索',
  searchPlaceholder: '搜索章节、实验、术语…',
  ariaSearch: '搜索',
  ariaSearchResults: '搜索结果',
  noResults: '没有匹配结果——试试更短的关键词。',
  searchHint: '输入至少两个字符开始检索全书、实验库与术语表。',
  typeSection: '章节',
  typeExperiment: '实验',
  typeTerm: '术语',
  keySelect: '↑↓ 选择',
  keyGo: 'Enter 跳转',
  keyClose: 'Esc 关闭',
  searchEngineNote: 'bigram 全文检索 · 纯前端',

  // ── Quiz（思考题） ──
  quizTitle: '思考题',
  quizDesc: '全书 {total} 道章末思考题：1 星 {s1} 道 · 2 星 {s2} 道 · 3 星 {s3} 道。建议先自己作答，再对照提纲。',
  quizAnswerSource: '参考答案为上游 AI 生成提纲，经人工略作审校，仅供参照。',
  quizAnswerToggle: '查看参考答案',
  quizAnswerHide: '收起参考答案',
  quizAnswerNone: '暂无参考答案。',
  quizDriftNote: '此题答案基于旧版题集，可能与当前题干不匹配',

  // ── Glossary ──
  glossaryDesc: '全书 {n} 个关键概念，每条附出处章节。也可通过',
  glossarySearchTail: '搜索直达。',
  glossaryNote: '定义均摘自书稿正文语境；完整论证请进入对应章节阅读。',

  // ── 代码讲解 / 参考项目 ──
  wtDesc: '{n} 个关键机制的深读：架构小图 + 分段讲解 + 行级注释代码，全部与真实仓库行号对齐。按书稿章节组织，可从正文实验卡与参考项目页交叉跳转。',
  sourceProject: '源项目：',
  totalLines: '共 {n} 行 · 完整源码见仓库',
  lineRefNote: '行级引用：与仓库 {file} 对应行号一致；机制讲解见上方文字。',
  wtFootnote: '源 commit {commit} · 代码为白名单节选',
  refDesc: '四个真实仓库，从教学骨架到生产级框架，构成书稿机制讲解的对照系：每个项目都在与正文章节和代码讲解互相印证。全部计数与 commit 由构建脚本扫描仓库核实，描述为人工策展。',
  kindFramework: '框架',
  kindRuntime: '运行时',
  kindInstance: '实例',
  kindSkeleton: '骨架',
  readMore: '阅读',
  refFootnote: '书稿基线 commit {commit} · 计数扫描自仓库工作副本',
  groupMapTitle: '包族地图',
  groupMapCount: '{n} 个包族 · {m} 组',
  moduleTourTitle: '模块导览',
  crossRefTitle: '与书稿对照',
  linkWalkthrough: '讲解',
  linkExperiment: '实验',
  repoLocation: '仓库位置：{path}',

  // ── 小组件 ──
  themeToLight: '切换到亮色主题',
  themeToDark: '切换到暗色主题',
  copied: '已复制',
  copyCode: '复制代码',
} as const

const en: Record<keyof typeof zh, string> = {
  // ── SiteLayout ──
  siteName: 'AI Agents in Depth',
  siteBadge: 'Knowledge Site',
  navHome: 'Home',
  navExperiments: 'Experiments',
  navWalkthroughs: 'Walkthroughs',
  navReference: 'Reference',
  navLearning: 'Learning',
  navQuiz: 'Quiz',
  navGlossary: 'Glossary',
  skipToContent: 'Skip to content',
  searchButton: 'Search',
  ariaMainNav: 'Main navigation',
  ariaMobileNav: 'Mobile navigation',
  openMenu: 'Open navigation menu',
  closeMenu: 'Close navigation menu',
  openSearch: 'Open search',
  switchToEn: 'Switch to English',
  switchToZh: '切换到中文',
  langToggleEn: 'EN',
  langToggleZh: '中',
  footerDerivedFrom: 'Content derived from the open-source book',
  footerBookTitle: 'AI Agents in Depth',
  footerLicense: '(Apache-2.0) ·',
  footerUnofficial: 'An unofficial third-party read-only knowledge site',

  // ── Home ──
  heroKicker: 'Agent = LLM + Context + Tools',
  heroTitle: 'AI Agents in Depth',
  heroSub: 'Design principles & engineering practice · from "a demo that runs" to "a product that ships"',
  startReading: 'Start reading',
  reactLoopAria: 'ReAct loop: think → act → observe',
  loopThink: 'T',
  loopAct: 'A',
  loopObserve: 'O',
  loopCaption: 'Every chapter of this book unfolds inside this loop',
  bandChapters: 'Book chapters',
  bandExperiments: 'Companion experiments',
  bandToolFamilies: 'Tool families',
  bandHarnesses: 'Reference harnesses',
  structureTitle: 'Book structure',
  structureSub: 'Building (Ch. 2–6) → Evaluation & evolution (Ch. 7–9) → Multi-agent collaboration (Ch. 10)',
  expCount: '{n} experiments',
  browseExperiments: 'Browse {n} experiments',

  // ── Chapter ──
  tocAria: 'On this page',
  ariaChapterNav: 'Chapter navigation',
  prevChapter: '← Previous',
  nextChapter: 'Next →',
  minutesRead: '{n} min read',
  footnotesTitle: 'Footnotes',
  sourceLine: 'Source: {file} @ {commit} · {n} words',

  // ── BlockRenderer / Stars / InlineText ──
  zoomImage: 'Zoom image',
  ariaZoomImage: 'Zoom image',
  ariaZoomWithAlt: 'Zoom image: {alt}',
  expBadge: 'Experiment {id}',
  ariaStars: 'Difficulty: {n} stars',
  fnTitle: 'Footnote',

  // ── Placeholder ──
  notFoundTitle: 'Agent wandered off',
  notFoundNote: '404 · This path is not in context',
  backHome: 'Back to home',
  placeholderAria: 'The ReAct loop got lost',

  // ── 实验库 / 实验详情 ──
  chapterN: 'Chapter {n}',
  expNotFound: 'Experiment {id} is not in the index',
  backToExperiments: 'Back to experiments',
  projPath: 'Project path: ',
  inlineExp: 'In-chapter experiment (no standalone project)',
  inlineExpCard: 'In-chapter experiment (no standalone project)',
  ledgerLabel: 'Ledger',
  tabReadme: 'Docs',
  ariaDetailView: 'Detail views',
  noReadmePath: 'This project has no README; see the repo path for full source.',
  noReadmeInline: 'In-chapter experiment: read the corresponding chapter.',
  truncated400: 'Truncated to 400 lines · full source in the repo',
  whitelistNote: 'Whitelisted excerpt (≤3 files × 400 lines). Full code and usage: {path}',
  altIdsNote: 'Also referenced as: {ids} (same project cited across chapters)',
  ariaBreadcrumb: 'Breadcrumb',
  expZhDocNotice: 'The detailed documentation below is in Chinese — the upstream English edition does not yet include per-experiment docs. Title and summary are localized.',
  expLibDesc: '{total} companion experiments across the book: {runnable} runnable · {repro} external reproductions · {design} design docs. Ledger status shown as-is, including negative results.',
  searchExpPlaceholder: 'Search experiments…',
  ariaFilterChapter: 'Filter by chapter',
  ariaFilterType: 'Filter by type',
  filterAllChapters: 'All chapters',
  filterAll: 'All',
  filterRunnable: 'Runnable',
  filterRepro: 'Repro',
  filterDesign: 'Design',
  nItems: '{n} items',
  emptyFiltered: 'No matching experiments.',
  relaxFilters: 'Relax filters',
  statusPassed: 'Verified',
  statusPartial: 'Partial',

  // ── SearchModal ──
  ariaGlobalSearch: 'Global search',
  searchPlaceholder: 'Search chapters, experiments, terms…',
  ariaSearch: 'Search',
  ariaSearchResults: 'Search results',
  noResults: 'No matches — try a shorter keyword.',
  searchHint: 'Type at least two characters to search chapters, experiments, and the glossary.',
  typeSection: 'Section',
  typeExperiment: 'Experiment',
  typeTerm: 'Term',
  keySelect: '↑↓ Navigate',
  keyGo: 'Enter Open',
  keyClose: 'Esc Close',
  searchEngineNote: 'bigram full-text search · client-side',

  // ── Quiz（思考题） ──
  quizTitle: 'Thought Questions',
  quizDesc: '{total} end-of-chapter thought questions across the book: {s1} one-star · {s2} two-star · {s3} three-star. Try answering first, then compare with the outline.',
  quizAnswerSource: 'Reference answers are AI-generated outlines from upstream, lightly reviewed by humans — for reference only.',
  quizAnswerToggle: 'View answer',
  quizAnswerHide: 'Hide answer',
  quizAnswerNone: 'No reference answer yet.',
  quizDriftNote: 'This answer was written for an earlier version of the question set and may not match the current question',

  // ── Glossary ──
  glossaryDesc: '{n} key concepts from the book, each linked to its source chapters. Also reachable via',
  glossarySearchTail: 'search.',
  glossaryNote: "Definitions are drawn from the book's own context; read the linked chapters for the full arguments.",

  // ── 代码讲解 / 参考项目 ──
  wtDesc: '{n} deep reads of key mechanisms: architecture diagrams, sectioned prose, and line-annotated code, all aligned with real repo line numbers. Organized by book chapter, cross-linked from experiment cards and reference pages.',
  sourceProject: 'Source project: ',
  totalLines: '{n} lines total · full source in the repo',
  lineRefNote: 'Line-level excerpt: matches {file} in the repo exactly; see the prose above for the mechanism.',
  wtFootnote: 'Source commit {commit} · code is a whitelisted excerpt',
  refDesc: 'Four real repositories, from teaching skeleton to production framework, forming the reference frame for the book\'s mechanism walkthroughs: each project cross-validates chapters and code walkthroughs. All counts and commits are verified by build scripts scanning the repos; descriptions are human-curated.',
  kindFramework: 'Framework',
  kindRuntime: 'Runtime',
  kindInstance: 'Instance',
  kindSkeleton: 'Skeleton',
  readMore: 'Read',
  refFootnote: 'Book baseline commit {commit} · counts scanned from repo working copies',
  groupMapTitle: 'Package family map',
  groupMapCount: '{n} families · {m} groups',
  moduleTourTitle: 'Module tour',
  crossRefTitle: 'Book cross-references',
  linkWalkthrough: 'Walkthrough',
  linkExperiment: 'Experiment',
  repoLocation: 'Repo location: {path}',

  // ── 小组件 ──
  themeToLight: 'Switch to light theme',
  themeToDark: 'Switch to dark theme',
  copied: 'Copied',
  copyCode: 'Copy code',
}

export type Copy = Record<keyof typeof zh, string>

const DICT: Record<Locale, Copy> = { zh, en }

/** 取当前 locale 的文案对象（组件里 const t = useCopy() 后 t.navHome） */
export function useCopy(): Copy {
  return DICT[useLocale()]
}

/** 模板插值：fill('{n} 个实验', { n: 3 }) → '3 个实验' */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

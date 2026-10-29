#!/usr/bin/env node
/**
 * build-reference.mjs — 参考项目数据构建（PLAN.md §6）
 * 扫描 Reference/ 与 Book/opensource-repos/ 下的真实仓库核实计数与 commit；
 * 描述、概念讲解与交叉链接为人工策展（CURATION），仓库存在性 fail-fast。
 * 输出：src/content/reference/index.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const HR = resolve(ROOT, '..') // Harness-Research
const DSH = join(HR, 'Reference/deepseek-harness')
const OC_SNAP = join(HR, 'Reference/openclaw/openclaw-main')
const OC_GIT = join(HR, 'Book/AI-Agents-in-Depth/opensource-repos/openclaw')
const HERMES = join(HR, 'Book/AI-Agents-in-Depth/opensource-repos/hermes-agent')
const PYCORE = join(HR, 'Reference/pycore')

for (const [p, label] of [[DSH, 'deepseek-harness'], [OC_SNAP, 'openclaw 快照'], [OC_GIT, 'openclaw git'], [HERMES, 'hermes-agent'], [PYCORE, 'pycore']])
  if (!existsSync(p)) throw new Error(`参考项目路径缺失：${label} → ${p}`)

const git = (repo) => {
  try { return execSync(`git -C "${repo}" rev-parse --short HEAD`).toString().trim() } catch { return null }
}

const listDirs = (p) => readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()

/** 统计 root 下 depth 层内 package.json 数（跳过 node_modules） */
function countPkgJson(root, maxDepth = 3) {
  let n = 0
  const walk = (dir, depth) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules') continue
      const full = join(dir, e.name)
      if (e.isFile() && e.name === 'package.json') { n++; continue }
      if (e.isDirectory() && depth < maxDepth) walk(full, depth + 1)
    }
  }
  walk(root, 0)
  return n
}

/** 递归统计 .py 文件数（跳过 __pycache__） */
function countPy(root) {
  let n = 0
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === '__pycache__') continue
      const full = join(dir, e.name)
      if (e.isFile() && e.name.endsWith('.py')) n++
      else if (e.isDirectory()) walk(full)
    }
  }
  walk(root)
  return n
}

// ── deepseek-harness：52 个包族、363 个包 ─────────────────────────────
const dshTop = listDirs(join(DSH, 'packages'))
const dshPkgs = countPkgJson(join(DSH, 'packages'))
const dshCommit = git(DSH)

// ── openclaw：快照读 extensions/skills，commit 来自浅同步副本 ──────────
const ocExt = listDirs(join(OC_SNAP, 'extensions'))
const ocSkills = listDirs(join(OC_SNAP, 'skills'))
const ocPkgs = listDirs(join(OC_SNAP, 'packages'))
const ocCommit = git(OC_GIT)
const ocVersion = JSON.parse(readFileSync(join(OC_SNAP, 'package.json'), 'utf8')).version

// ── hermes-agent ─────────────────────────────────────────────────────
const hermesCommit = git(HERMES)
const hermesStateN = readdirSync(HERMES).filter((f) => /^hermes_state_.*\.py$/.test(f)).length
for (const d of ['gateway', 'agent', 'skills', 'evals', 'tools'])
  if (!existsSync(join(HERMES, d))) throw new Error(`hermes-agent 缺少目录 ${d}`)

// ── pycore ───────────────────────────────────────────────────────────
const pycoreMods = listDirs(PYCORE).filter((d) => !d.startsWith('__') && d !== 'docs')
const pycoreN = countPy(PYCORE)
const pycoreVersion = readFileSync(join(PYCORE, '__init__.py'), 'utf8').match(/__version__\s*=\s*"([^"]+)"/)?.[1] ?? ''
if (!pycoreVersion) throw new Error('pycore: 读不到 __version__')

// ── 策展内容（包族分组逐项核实存在）──────────────────────────────────
const DSH_GROUPS = [
  { name: 'Agent 循环与任务', note: 'Agent 接口、默认驱动器与任务原语', items: ['core', 'plan', 'todo', 'goal', 'preset'] },
  { name: '会话与上下文', note: 'append-only 日志是模型上下文的唯一真源', items: ['session', 'session-query', 'compaction', 'context', 'attachment', 'deliverables', 'document'] },
  { name: '模型接入', note: '消息/流词汇与适配器接缝', items: ['llm', 'acp', 'api', 'typert'] },
  { name: '工具与执行', note: '注册表、守卫管线与执行世界', items: ['shell', 'subprocess', 'terminal', 'sandbox', 'guard', 'fs', 'lsp', 'mcp', 'ptc-runtime', 'browser-use', 'computer-use'] },
  { name: '多代理与协作', note: '子代理、后台作业与协调', items: ['subagent', 'workflow', 'interaction', 'schedule', 'jobs', 'spill'] },
  { name: '宿主与运行环境', note: '进程宿主、身份、凭证与遥测', items: ['host', 'ssh', 'workspace', 'identity', 'credentials', 'storage', 'settings', 'telemetry'] },
  { name: '客户端与扩展', note: 'Web 客户端与外挂能力', items: ['web', 'client', 'skill', 'extensions', 'feedback'] },
  { name: '启动与基建', note: 'profile/bundle 组合机制与公共件', items: ['boot', 'bundle', 'sdk', 'experimental', 'test-support', 'util'] },
]
const seen = new Set()
for (const g of DSH_GROUPS)
  for (const it of g.items) {
    if (seen.has(it)) throw new Error(`deepseek-harness 包族重复分组：${it}`)
    seen.add(it)
    if (!dshTop.includes(it)) throw new Error(`deepseek-harness 分组引用不存在的包族：${it}`)
  }
const ungrouped = dshTop.filter((d) => !seen.has(d))
if (ungrouped.length) throw new Error(`deepseek-harness 有包族未分组：${ungrouped.join(', ')}`)

const OC_EXT_PICK = ['anthropic', 'deepseek', 'discord', 'browser', 'canvas', 'diagnostics-otel', 'document-extract', 'admin-http-rpc']
const OC_SKILL_PICK = ['apple-notes', 'github', 'coding-agent', 'gh-issues']
for (const e of OC_EXT_PICK) if (!ocExt.includes(e)) throw new Error(`openclaw 策展 extension 不存在：${e}`)
for (const s of OC_SKILL_PICK) if (!ocSkills.includes(s)) throw new Error(`openclaw 策展 skill 不存在：${s}`)

const BOOK_COMMIT = execSync(`git -C "${join(HR, 'Book/AI-Agents-in-Depth')}" rev-parse --short HEAD`).toString().trim()

const CURATION = [
  {
    id: 'deepseek-harness',
    name: 'DeepSeek Harness',
    oneLiner: '以 Cordis 插件框架构成的生产级 Agent Harness：一切皆插件，配置即组合，事件即扩展点。',
    kind: '生产级框架',
    lang: 'TypeScript',
    repoPath: 'Reference/deepseek-harness',
    stats: [
      { label: '包族', value: String(dshTop.length) },
      { label: '软件包', value: String(dshPkgs) },
      { label: '子系统文档', value: '60+' },
      { label: '事件域', value: '3' },
    ],
    concepts: [
      { title: 'Profile 与 Bundle 分层组合', body: 'profile 列出叠加的 bundle，bundle 是 Cordis 配置行的分发格式；启动时按「bundle 序 → profile patch → home patch → --patch」的顺序应用于空 entry 列表，任何一行都可被上层替换。dsh --profile web --dump-config 打印的树，每一行都能 patch。' },
      { title: '模型可见即已记录', body: '一切进入模型请求的内容必须能从 session 日志重建，运行时不变量强制断言这一点；因此「新增一种模型可见输入」的唯一正解是新增 SessionEvent 类型并从日志渲染。' },
      { title: '能力接缝（capability seams）', body: '服务定义、服务提供者、消费者三位一体才构成接缝；文件系统与子进程提供者共享一个执行世界——把二者指向远程沙箱，Bash、PTY、LSP 随之整体迁移，无需改任何消费者。' },
      { title: 'turn / step 事件流', body: 'step 是一次模型请求及其工具调用，turn 是零或多个 step；agent/pre-step 决定模型看到什么（可改写可拒绝），tools/* 三事件是必须调用 next() 的瀑布，agent/turn-stopping 是无 next() 的串行拦截点。' },
    ],
    groups: DSH_GROUPS,
    links: [
      { kind: 'walkthrough', slug: 'w1-react-loop', label: '最小 ReAct 循环 vs 默认 agent-loop 驱动器' },
      { kind: 'walkthrough', slug: 'w3-system-hint', label: 'agent.inject() 与状态栏注入对照' },
      { kind: 'walkthrough', slug: 'w5-flux', label: 'session/event 广播 vs Flux 事件运行时' },
      { kind: 'chapter', ch: 5, label: '工具注册与 schema 装配' },
      { kind: 'chapter', ch: 7, label: 'tools/* 事件拦截与轨迹验证' },
    ],
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    oneLiner: `以 Gateway 为中枢的个人 AI 助理运行时：${ocExt.length} 个扩展、${ocSkills.length} 项技能，消息渠道即插件。`,
    kind: '个人助理运行时',
    lang: 'TypeScript',
    repoPath: 'Reference/openclaw/openclaw-main（快照）· Book/AI-Agents-in-Depth/opensource-repos/openclaw（浅同步 git）',
    stats: [
      { label: '扩展', value: String(ocExt.length) },
      { label: '技能', value: String(ocSkills.length) },
      { label: '核心包', value: String(ocPkgs.length) },
      { label: '快照版本', value: ocVersion },
    ],
    concepts: [
      { title: 'Gateway 中枢', body: '长驻网关进程统一接入 Discord、Telegram 等消息渠道，会话、调度与插件编排都收敛在网关侧；packages/ 下 gateway-protocol、agent-core、llm-runtime 定义了协议与推理的边界。' },
      { title: '扩展即能力', body: `extensions/ 共 ${ocExt.length} 个目录：模型供应商（anthropic、deepseek）、消息渠道（discord）、工具（browser、canvas）、诊断（diagnostics-otel）、管理面（admin-http-rpc）——载入即注册，卸载即回滚。` },
      { title: '技能渐进披露', body: 'skills/ 以 SKILL.md 声明触发条件与指令，正文按需载入：是书稿第 2 章「渐进式披露」原则最完整的产品化样本。' },
      { title: '快照与浅同步', body: '本仓以浅 fetch 保持跟进（git fetch --depth=1 origin main && git reset --hard origin/main），Reference/ 下另存一份解包快照便于直接通读源码。' },
    ],
    modules: [
      { name: 'extensions/anthropic · deepseek', note: '模型供应商适配' },
      { name: 'extensions/discord', note: '消息渠道接入' },
      { name: 'extensions/browser · canvas', note: '浏览器与画布工具' },
      { name: 'extensions/diagnostics-otel', note: '可观测性诊断' },
      { name: 'skills/apple-notes · github · coding-agent · gh-issues', note: '领域技能（SKILL.md 渐进披露）' },
      { name: 'packages/gateway-protocol · agent-core', note: '网关协议与代理核心' },
    ],
    links: [
      { kind: 'chapter', ch: 2, label: 'SKILL.md 渐进披露' },
      { kind: 'walkthrough', slug: 'w3-system-hint', label: '会话状态注入的另一种形态' },
      { kind: 'chapter', ch: 10, label: '多渠道消息与并行任务结算' },
    ],
  },
  {
    id: 'hermes-agent',
    name: 'Hermes Agent',
    oneLiner: `单机自演进 Agent 的完整实例：gateway、agent 与 ${hermesStateN} 个状态机模块，第 9 章自我修改实验的宿主。`,
    kind: '自演进实例',
    lang: 'Python + TypeScript',
    repoPath: 'Book/AI-Agents-in-Depth/opensource-repos/hermes-agent',
    stats: [
      { label: '状态模块', value: `${hermesStateN}+` },
      { label: '核心目录', value: '5' },
      { label: '评测', value: 'evals/' },
      { label: '版本', value: hermesCommit ?? '—' },
    ],
    concepts: [
      { title: '状态层即心脏', body: `根目录 ${hermesStateN} 个 hermes_state_*.py 把会话状态拆成 WAL、锁、血缘、压缩、rewind 等细粒度模块——把「状态一致性」当作一等公民来工程化，是全书最密集的真实状态管理样本。` },
      { title: 'gateway + agent 分层', body: 'gateway 管进程与会话生命周期，agent/ 管推理循环，toolsets.py 与 tools/ 管工具装配；每层都可单独替换实验。' },
      { title: '评测内建', body: 'evals/ 与 trajectory_compressor.py 分别对应书稿「验证器」与「轨迹压缩」两章的可运行对应物——验证不是外挂测试，而是 Agent 自己的器官。' },
      { title: '自演进宿主', body: '书稿第 9 章提案—验证—灰度—回滚流程以此仓为宿主演练（chapter9/hermes-self-evolution 与下游消融实验测试同仓共存）。' },
    ],
    modules: [
      { name: 'hermes_state_*.py', note: `${hermesStateN} 个状态模块：WAL、锁、血缘、压缩、rewind` },
      { name: 'gateway/ · agent/', note: '进程生命周期与推理循环' },
      { name: 'toolsets.py · tools/', note: '工具装配与实现' },
      { name: 'evals/ · trajectory_compressor.py', note: '评测与轨迹压缩' },
      { name: 'skills/ · plugins/', note: '技能与插件' },
    ],
    links: [
      { kind: 'chapter', ch: 9, label: '自我修改实验宿主' },
      { kind: 'walkthrough', slug: 'w7-self-modify', label: '提案—验证—灰度—回滚' },
      { kind: 'walkthrough', slug: 'w6-verifier', label: 'evals vs 三层轨迹验证器' },
      { kind: 'walkthrough', slug: 'w2-compression', label: 'trajectory_compressor.py 与压缩策略' },
      { kind: 'chapter', ch: 7, label: '验证器设计' },
    ],
  },
  {
    id: 'pycore',
    name: 'PyCore',
    oneLiner: '模块化异步优先的 Python 后端骨架：插件注册表、状态机服务层、FastAPI 集成——书稿实验代码的公共地基。',
    kind: '教学骨架',
    lang: 'Python',
    repoPath: 'Reference/pycore',
    stats: [
      { label: 'Python 文件', value: String(pycoreN) },
      { label: '模块', value: String(pycoreMods.length) },
      { label: '版本', value: pycoreVersion },
    ],
    concepts: [
      { title: '六层分层', body: 'core（配置/日志/异常/Result schema）→ plugins（注册表插件系统）→ services（带状态机的服务层）→ execution（flow 执行与上下文）→ api（FastAPI 集成）→ integrations（LLM 等外部服务）。' },
      { title: '最小可读', body: '每个概念一个文件、每个文件百行上下——读机制先读这里，再进生产级仓库，认知坡度最缓。' },
      { title: '实验底座', body: '书稿各章实验代码的运行时骨架与这里的 services/flow 抽象同构：service 承载状态机，flow 承载流程编排。' },
    ],
    modules: [
      { name: 'core/', note: '配置、日志、异常、Result schema' },
      { name: 'plugins/', note: '注册表插件系统' },
      { name: 'services/', note: '状态机服务层（agent.py 在此）' },
      { name: 'execution/', note: 'flow 执行与上下文管理' },
      { name: 'api/', note: 'FastAPI 路由与中间件' },
      { name: 'integrations/', note: '外部服务集成（LLM 等）' },
    ],
    links: [
      { kind: 'chapter', ch: 1, label: 'Agent 最小骨架' },
      { kind: 'walkthrough', slug: 'w1-react-loop', label: 'run 循环与服务层对照' },
      { kind: 'walkthrough', slug: 'w5-flux', label: 'execution/flow vs 事件运行时' },
    ],
  },
]

mkdirSync(join(ROOT, 'src/content/reference'), { recursive: true })
writeFileSync(
  join(ROOT, 'src/content/reference/index.json'),
  JSON.stringify({ projects: CURATION, sourceCommit: BOOK_COMMIT }),
)
console.log(
  `✓ 参考项目：4 个 · dsh ${dshTop.length} 包族/${dshPkgs} 包 · openclaw ${ocExt.length} extensions/${ocSkills.length} skills · ` +
  `hermes ${hermesStateN} 状态模块 · pycore ${pycoreN} py · 源 commit ${BOOK_COMMIT}`,
)

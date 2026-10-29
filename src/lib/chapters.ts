export interface ChapterMeta {
  slug: string          // data-chapter 挂载值
  n: number | null      // 章号（null = 引言/后记）
  title: string
  tagline: string
  experiments: number
}

export const CHAPTERS: ChapterMeta[] = [
  { slug: 'intro', n: null, title: '引言', tagline: '实践在前，命名在后', experiments: 0 },
  { slug: '1', n: 1, title: 'AI Agent 入门', tagline: 'Agent = LLM + 上下文 + 工具；Harness 工程才是竞争力', experiments: 3 },
  { slug: '2', n: 2, title: '上下文工程', tagline: '上下文决定能力上限：KV Cache、提示工程、Skills、压缩', experiments: 10 },
  { slug: '3', n: 3, title: '用户记忆和知识库', tagline: '跨会话记住用户、接入外部知识', experiments: 12 },
  { slug: '4', n: 4, title: '工具', tagline: '工具是 Agent 的双手：MCP 与五类工具', experiments: 5 },
  { slug: '5', n: 5, title: 'Coding Agent 与通用 Agent', tagline: '代码是「能创造新工具的工具」', experiments: 13 },
  { slug: '6', n: 6, title: '交互：观察与动作空间的扩展', tagline: '异步、语音、Computer Use 与机器人', experiments: 13 },
  { slug: '7', n: 7, title: 'Agent 的评估', tagline: '把表现变成可比较信号', experiments: 13 },
  { slug: '8', n: 8, title: '模型后训练', tagline: 'SFT 记忆、RL 泛化；数据与环境比算法更重要', experiments: 19 },
  { slug: '9', n: 9, title: 'Agent 的持续进化', tagline: '从运行轨迹获得学习信号，更新知识、指令、程序与参数', experiments: 9 },
  { slug: '10', n: 10, title: '多 Agent 协作', tagline: '群体智能高于个体', experiments: 6 },
  { slug: 'outro', n: null, title: '后记', tagline: '两朵乌云，与模型和 Agent 的共同演进', experiments: 0 },
]

export const TOTAL_EXPERIMENTS = CHAPTERS.reduce((s, c) => s + c.experiments, 0)

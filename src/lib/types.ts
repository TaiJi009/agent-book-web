/** 抽取器产物的数据模型（PLAN.md §4） */

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'skip' }
  | { t: 'strong' | 'em' | 'del'; c: Inline[] }
  | { t: 'code'; v: string }
  | { t: 'math'; v: string; display: boolean; html: string | null }
  | { t: 'a'; href: string; ext: boolean; c: Inline[] }
  | { t: 'img'; src: string; alt: string }
  | { t: 'br' }
  | { t: 'fnref'; id: string }

export type Block =
  | { kind: 'heading'; depth: number; text: string; id: string }
  | { kind: 'p'; c: Inline[] }
  | { kind: 'quote'; c: Block[] }
  | { kind: 'callout'; variant: 'hint'; label: string; body: Block[] }
  | { kind: 'experiment'; id: string; title: string; stars: number; body: Block[] }
  | { kind: 'code'; lang: string; html: string }
  | { kind: 'math'; display: boolean; v: string; html: string | null }
  | { kind: 'table'; align: (string | null)[]; header: Inline[][]; rows: Inline[][][] }
  | { kind: 'list'; ordered: boolean; items: Block[][] }
  | { kind: 'figure'; src: string; alt: string }
  | { kind: 'hr' }

export interface TocItem { id: string; depth: number; text: string }
export interface Footnote { id: string; c: Inline[] }

export interface ChapterDoc {
  slug: string
  sourceFile: string
  sourceCommit: string
  title: string
  blocks: Block[]
  toc: TocItem[]
  experiments: { id: string; title: string; stars: number }[]
  questions: Block[]
  footnotes: Footnote[]
  /** zh 文档：汉字数；en 文档：词数（wordCount）。二者互斥存在 */
  cjkChars?: number
  wordCount?: number
  minutes: number
}

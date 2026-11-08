/** 客户端 bigram 检索（索引由 build-search-index.mjs 构建期生成，按语言各一份） */

export interface SearchDoc {
  id: string
  type: 'section' | 'experiment' | 'term' | 'quiz'
  title: string
  chapter: string
  anchor: string | null
  text: string
}
interface SearchIndexFile { version: number; docs: SearchDoc[]; lists: [string, number[]][] }

type Cache = Promise<{ docs: SearchDoc[]; map: Map<string, number[]> }>
const cache: Record<'zh' | 'en', Cache | null> = { zh: null, en: null }

function load(locale: 'zh' | 'en'): Cache {
  if (!cache[locale]) {
    const src = locale === 'en'
      ? import('../content/en/search-index.json')
      : import('../content/search-index.json')
    cache[locale] = src.then((m) => {
      const idx = m.default as unknown as SearchIndexFile
      return { docs: idx.docs, map: new Map(idx.lists) }
    })
  }
  return cache[locale]
}

/** 闲时预载当前语言索引：首次 ⌘K 不必等索引 chunk（SiteLayout 在 requestIdleCallback 调用） */
export function preloadSearchIndex(locale: 'zh' | 'en' = 'zh') {
  void load(locale)
}

/** 查询文本 → bigram 集合（与构建期同规则：中文按字 bigram，拉丁按词） */
function queryBigrams(q: string): Set<string> {
  const set = new Set<string>()
  const t = q.toLowerCase().trim()
  for (const w of t.match(/[a-z0-9]+/g) || []) set.add(w)
  for (const run of t.match(/[\u4e00-\u9fff]+/g) || []) {
    if (run.length === 1) { set.add(run); continue }
    for (let i = 0; i < run.length - 1; i++) set.add(run.slice(i, i + 2))
  }
  return set
}

export interface Hit extends SearchDoc { score: number }

export async function search(query: string, locale: 'zh' | 'en' = 'zh', limit = 12): Promise<Hit[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const { docs, map } = await load(locale)
  const qg = queryBigrams(q)
  if (qg.size === 0) return []

  const scores = new Map<number, number>()
  for (const g of qg) {
    const list = map.get(g)
    if (!list) continue
    for (const di of list) scores.set(di, (scores.get(di) ?? 0) + 1)
  }
  // 覆盖率 = 命中 bigram 数 / 查询 bigram 数；bigram 相交即有意义
  const hits: Hit[] = []
  for (const [di, s] of scores) {
    const coverage = s / qg.size
    if (coverage < 0.45) continue
    const d = docs[di]
    hits.push({ ...d, score: coverage })
  }
  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
  return hits.slice(0, limit)
}

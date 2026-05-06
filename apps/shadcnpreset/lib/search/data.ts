import {
  listViewItemFromPresetConfig,
  toListViewItem,
  type ListViewItem,
} from "@/lib/list-view"
import { resolvePresetFromCode } from "@/lib/preset"
import { buildSearchCorpus } from "@/lib/search/corpus"
import { getSemanticRelevanceScores } from "@/lib/search/semantic"
import {
  applyShellBrightnessIntent,
  rankPresetsByEmbeddingSimilarity,
} from "@/lib/search/semantic-rank"
import { SEARCH_PAGE_SIZE, type SearchMode } from "@/lib/search/route"

export type SearchPageData = {
  mode: SearchMode
  query: string
  items: ListViewItem[]
}

async function getRankedSmartResults(query: string, neededCount: number) {
  const corpus = await buildSearchCorpus()
  const rawScores = await getSemanticRelevanceScores(corpus, query)
  const scores = applyShellBrightnessIntent(query, rawScores, corpus)
  return rankPresetsByEmbeddingSimilarity(corpus, scores, neededCount)
}

async function getSearchItemsWindow(
  mode: SearchMode,
  query: string,
  neededCount: number
): Promise<ListViewItem[]> {
  if (mode === "code") {
    const resolved = resolvePresetFromCode(query)
    return resolved
      ? [listViewItemFromPresetConfig(resolved.code, resolved)]
      : []
  }

  const results = await getRankedSmartResults(query, neededCount)
  return results.map(toListViewItem)
}

export async function getSearchPageData(
  mode: SearchMode,
  query: string,
  /** Legacy pagination arg; search is single-page only — ignored. */
  _requestedPage?: number
): Promise<SearchPageData> {
  void _requestedPage
  const allItems = await getSearchItemsWindow(mode, query, SEARCH_PAGE_SIZE)
  return {
    mode,
    query,
    items: allItems.slice(0, SEARCH_PAGE_SIZE),
  }
}

import { toPresetItems } from "@/lib/community-snapshot"
import { getCommunityPresetCodesForDisplay } from "@/lib/community-presets"
import {
  PRESET_TOTAL_COMBINATIONS,
  getPresetPage,
  type PresetPageItem,
} from "@/lib/preset-catalog"

type PresetFeedPage = {
  items: PresetPageItem[]
  safePage: number
  totalPages: number
}

export async function getHomepageFeed(limit = 100): Promise<PresetPageItem[]> {
  const safeLimit = Math.max(1, limit)
  const lovedItems = await getLovedItems()
  const homepageItems: PresetPageItem[] = []

  for (let index = 0; index < Math.min(lovedItems.length, safeLimit); index++) {
    homepageItems.push({
      ...lovedItems[index],
      index,
    })
  }

  if (homepageItems.length < safeLimit) {
    const excludedCodes = new Set(lovedItems.map((item) => item.code))
    const defaultItems = collectDefaultItems(
      excludedCodes,
      0,
      safeLimit - homepageItems.length
    )

    for (let index = 0; index < defaultItems.length; index++) {
      homepageItems.push({
        ...defaultItems[index],
        index: homepageItems.length,
      })
    }
  }

  return homepageItems
}

/** Snapshot-ranked presets for community pages. No catalog backfill. */
export async function getVotedPresetsFeed(limit = 100): Promise<PresetPageItem[]> {
  const safeLimit = Math.min(100, Math.max(0, limit))
  const lovedItems = await getLovedItems()
  const items: PresetPageItem[] = []

  for (let index = 0; index < Math.min(lovedItems.length, safeLimit); index++) {
    items.push({
      ...lovedItems[index],
      index,
    })
  }

  return items
}

async function getLovedItems() {
  const codes = await getCommunityPresetCodesForDisplay(2000)
  return toPresetItems(codes, 2000)
}

function collectDefaultItems(
  excludedCodes: Set<string>,
  offset: number,
  limit: number
) {
  if (limit <= 0) return []

  const collected: PresetPageItem[] = []
  const chunkSize = 250
  const maxPages = Math.max(1, Math.ceil(PRESET_TOTAL_COMBINATIONS / chunkSize))
  let skipped = 0

  for (let page = 1; page <= maxPages; page++) {
    const chunk = getPresetPage(page, chunkSize)
    if (!chunk.length) break

    for (const item of chunk) {
      if (excludedCodes.has(item.code)) continue
      if (skipped < offset) {
        skipped++
        continue
      }

      collected.push(item)
      if (collected.length >= limit) return collected
    }
  }

  return collected
}

export async function getPresetFeedPage(
  page: number,
  pageSize: number
): Promise<PresetFeedPage> {
  const safePageSize = Math.min(100, Math.max(1, pageSize))
  const totalPages = Math.max(
    1,
    Math.ceil(PRESET_TOTAL_COMBINATIONS / safePageSize)
  )
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * safePageSize
  const end = Math.min(start + safePageSize, PRESET_TOTAL_COMBINATIONS)

  const lovedItems = await getLovedItems()
  const lovedCount = lovedItems.length
  const feedItems: PresetPageItem[] = []

  if (start < lovedCount) {
    const lovedSliceStart = start
    const lovedSliceEnd = Math.min(end, lovedCount)
    const lovedSlice = lovedItems.slice(lovedSliceStart, lovedSliceEnd)
    for (let index = 0; index < lovedSlice.length; index++) {
      feedItems.push({
        ...lovedSlice[index],
        index: lovedSliceStart + index,
      })
    }
  }

  if (feedItems.length < end - start) {
    const defaultOffset = Math.max(0, start - lovedCount)
    const defaultNeeded = end - start - feedItems.length
    const excludedCodes = new Set(lovedItems.map((item) => item.code))
    const defaultItems = collectDefaultItems(
      excludedCodes,
      defaultOffset,
      defaultNeeded
    )

    const defaultIndexBase = Math.max(start, lovedCount)
    for (let index = 0; index < defaultItems.length; index++) {
      feedItems.push({
        ...defaultItems[index],
        index: defaultIndexBase + index,
      })
    }
  }

  return {
    items: feedItems,
    safePage,
    totalPages,
  }
}

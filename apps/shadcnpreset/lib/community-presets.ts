import {
  getCommunityCodesSnapshotFirst,
  getDeterministicCommunityFallbackCodes,
} from "@/lib/community-snapshot"
import { cacheLife } from "next/cache"

type CommunityPresetVoteRow = {
  preset_code: string
}

const COMMUNITY_DEFAULT_LIMIT = 2000

function shouldBypassSnapshotLocally() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.LOCAL_DISABLE_COMMUNITY_SNAPSHOT === "1"
  )
}

export async function getCommunityPresetCodes(limit = COMMUNITY_DEFAULT_LIMIT) {
  const safeLimit = Math.max(1, limit)
  const { query } = await import("@/lib/db")
  const result = await query<CommunityPresetVoteRow>(
    `
    SELECT preset_code
    FROM preset_votes
    GROUP BY preset_code
    ORDER BY COUNT(*) DESC, preset_code ASC
    LIMIT $1
    `,
    [safeLimit]
  )

  return result.rows.map((row) => row.preset_code)
}

async function getCommunityPresetCodesDbFirst(limit: number) {
  const safeLimit = Math.max(1, limit)
  try {
    const votedCodes = await getCommunityPresetCodes(safeLimit)
    if (votedCodes.length > 0) {
      return votedCodes
    }
  } catch {
    // Local opt-out mode should still degrade gracefully when DB is unavailable.
  }

  return getDeterministicCommunityFallbackCodes(safeLimit)
}

export async function getCommunityPresetCodesForDisplay(
  limit = COMMUNITY_DEFAULT_LIMIT
) {
  if (shouldBypassSnapshotLocally()) {
    return getCommunityPresetCodesDbFirst(limit)
  }

  return getCommunityCodesSnapshotFirst(limit)
}

export async function getCommunityPresetCodesForSitemap(
  limit = COMMUNITY_DEFAULT_LIMIT
) {
  return getCommunityPresetCodesForDisplay(limit)
}

async function getCachedCommunityPresetCodes() {
  "use cache"
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 })

  return getCommunityPresetCodesForDisplay(COMMUNITY_DEFAULT_LIMIT)
}

/** True when this preset has at least one vote (`preset_votes`, canonical or raw URL code). */
export async function isCommunityPresetCode(
  canonicalPresetCode: string,
  rawUrlCode?: string
): Promise<boolean> {
  const knownCodes = await getCachedCommunityPresetCodes()
  if (!knownCodes.length) {
    const fallbackCodes = getDeterministicCommunityFallbackCodes(500)
    return fallbackCodes.includes(canonicalPresetCode)
  }

  const codeSet = new Set(knownCodes)
  if (codeSet.has(canonicalPresetCode)) return true
  if (rawUrlCode && rawUrlCode !== canonicalPresetCode && codeSet.has(rawUrlCode)) {
    return true
  }

  return false
}

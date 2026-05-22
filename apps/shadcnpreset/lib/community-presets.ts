import { query } from "@/lib/db"
import { resolvePresetFromCode } from "@/lib/preset"
import { cacheLife } from "next/cache"

type CommunityPresetVoteRow = {
  preset_code: string
}

export async function getCommunityPresetCodes() {
  const result = await query<CommunityPresetVoteRow>(
    `
    SELECT preset_code
    FROM preset_votes
    GROUP BY preset_code
    ORDER BY COUNT(*) DESC, preset_code ASC
    `
  )

  const codes: string[] = []

  for (const row of result.rows) {
    const preset = resolvePresetFromCode(row.preset_code)
    if (!preset) continue
    codes.push(preset.code)
  }

  return codes
}

async function getCachedCommunityPresetCodes() {
  "use cache"
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 })

  if (!process.env.DATABASE_URL) {
    return [] as string[]
  }

  try {
    return await getCommunityPresetCodes()
  } catch {
    return [] as string[]
  }
}

/** True when this preset has at least one vote (`preset_votes`, canonical or raw URL code). */
export async function isCommunityPresetCode(
  canonicalPresetCode: string,
  rawUrlCode?: string
): Promise<boolean> {
  const knownCodes = await getCachedCommunityPresetCodes()
  if (!knownCodes.length) return false

  const codeSet = new Set(knownCodes)
  if (codeSet.has(canonicalPresetCode)) return true
  if (rawUrlCode && rawUrlCode !== canonicalPresetCode && codeSet.has(rawUrlCode)) {
    return true
  }

  return false
}

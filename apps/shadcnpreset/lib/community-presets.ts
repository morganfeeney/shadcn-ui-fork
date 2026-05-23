import { query } from "@/lib/db"
import { resolvePresetFromCode } from "@/lib/preset"

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

/** True when this preset has at least one vote (`preset_votes`, canonical or raw URL code). */
export async function isCommunityPresetCode(
  canonicalPresetCode: string,
  rawUrlCode?: string
): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    return false
  }
  try {
    const codes =
      rawUrlCode && rawUrlCode !== canonicalPresetCode
        ? [canonicalPresetCode, rawUrlCode]
        : [canonicalPresetCode]
    const result = await query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM preset_votes WHERE preset_code IN (${codes.map((_, i) => `$${i + 1}`).join(", ")}) LIMIT 1
      ) AS "exists"`,
      codes
    )
    return Boolean(result.rows[0]?.exists)
  } catch {
    return false
  }
}

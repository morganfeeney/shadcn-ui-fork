import { get, put } from "@vercel/blob"
import { z } from "zod"

import { resolvePresetFromCode } from "@/lib/preset"
import { getPresetPage, type PresetPageItem } from "@/lib/preset-catalog"

const DEFAULT_SNAPSHOT_LIMIT = 2000
const FALLBACK_PAGE_SIZE = 100
const SNAPSHOT_BLOB_PATH =
  process.env.COMMUNITY_SNAPSHOT_BLOB_PATH ??
  "community/community-presets-snapshot.json"
const SNAPSHOT_BLOB_ACCESS: "public" | "private" =
  process.env.COMMUNITY_SNAPSHOT_BLOB_ACCESS === "public"
    ? "public"
    : "private"

const snapshotSchema = z.object({
  generatedAt: z.string(),
  source: z.string(),
  codes: z.array(z.string()),
})

type CommunitySnapshot = z.infer<typeof snapshotSchema>

function getSafeLimit(limit: number, max = DEFAULT_SNAPSHOT_LIMIT) {
  return Math.min(max, Math.max(1, limit))
}

function normalizePresetCodes(codes: string[], limit: number) {
  const safeLimit = getSafeLimit(limit)
  const normalized: string[] = []
  const seen = new Set<string>()

  for (const code of codes) {
    const preset = resolvePresetFromCode(code)
    if (!preset) continue
    if (seen.has(preset.code)) continue

    seen.add(preset.code)
    normalized.push(preset.code)

    if (normalized.length >= safeLimit) {
      break
    }
  }

  return normalized
}

export function getDeterministicCommunityFallbackCodes(limit: number) {
  const safeLimit = getSafeLimit(limit)
  const codes: string[] = []

  for (let page = 1; codes.length < safeLimit; page += 1) {
    const pageItems = getPresetPage(page, FALLBACK_PAGE_SIZE)
    if (!pageItems.length) break

    for (const item of pageItems) {
      codes.push(item.code)
      if (codes.length >= safeLimit) {
        break
      }
    }
  }

  return codes
}

export function toPresetItems(codes: string[], limit: number): PresetPageItem[] {
  const normalized = normalizePresetCodes(codes, limit)
  const items: PresetPageItem[] = []

  for (const code of normalized) {
    const preset = resolvePresetFromCode(code)
    if (!preset) continue
    items.push({
      index: items.length,
      code: preset.code,
      config: preset,
    })
  }

  return items
}

export function getDeterministicCommunityFallbackItems(limit: number) {
  return toPresetItems(getDeterministicCommunityFallbackCodes(limit), limit)
}

async function readSnapshotPayload(): Promise<CommunitySnapshot | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null
  }

  try {
    const result = await get(SNAPSHOT_BLOB_PATH, {
      access: SNAPSHOT_BLOB_ACCESS,
      useCache: false,
    })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return null
    }

    const rawText = await new Response(result.stream).text()
    const parsed = snapshotSchema.safeParse(JSON.parse(rawText))
    if (!parsed.success) return null
    return parsed.data
  } catch {
    return null
  }
}

export async function getCommunitySnapshotCodes(limit = DEFAULT_SNAPSHOT_LIMIT) {
  const safeLimit = getSafeLimit(limit)
  const payload = await readSnapshotPayload()
  if (!payload) return null

  const normalized = normalizePresetCodes(payload.codes, safeLimit)
  return normalized.length ? normalized : null
}

export async function getCommunityCodesSnapshotFirst(
  limit = DEFAULT_SNAPSHOT_LIMIT
) {
  const safeLimit = getSafeLimit(limit)
  const snapshotCodes = await getCommunitySnapshotCodes(safeLimit)
  if (snapshotCodes?.length) {
    return snapshotCodes
  }
  return getDeterministicCommunityFallbackCodes(safeLimit)
}

export async function writeCommunitySnapshot(
  codes: string[],
  source: "neon-cron" | "manual-refresh" = "neon-cron",
  limit = DEFAULT_SNAPSHOT_LIMIT
) {
  const normalized = normalizePresetCodes(codes, limit)
  const snapshot: CommunitySnapshot = {
    generatedAt: new Date().toISOString(),
    source,
    codes: normalized,
  }

  await put(SNAPSHOT_BLOB_PATH, JSON.stringify(snapshot, null, 2), {
    access: SNAPSHOT_BLOB_ACCESS,
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
  })

  return snapshot
}

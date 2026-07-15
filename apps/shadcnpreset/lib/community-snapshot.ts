import fs from "node:fs"
import path from "node:path"

import { cacheLife } from "next/cache"
import { z } from "zod"

import { resolvePresetFromCode } from "@/lib/preset"
import { getPresetPage, type PresetPageItem } from "@/lib/preset-catalog"

const DEFAULT_SNAPSHOT_LIMIT = 2000
const FALLBACK_PAGE_SIZE = 100
const SNAPSHOT_DATA_FILENAME = "community-presets-snapshot.json"
const SNAPSHOT_ROW_ID = "default"
const SNAPSHOT_MEMORY_CACHE_TTL_MS = 60_000

const snapshotSchema = z.object({
  generatedAt: z.string(),
  source: z.string(),
  codes: z.array(z.string()),
})

type CommunitySnapshot = z.infer<typeof snapshotSchema>

let inMemorySnapshotCache:
  | {
      value: CommunitySnapshot
      expiresAt: number
    }
  | null = null

function getSafeLimit(limit: number, max = DEFAULT_SNAPSHOT_LIMIT) {
  return Math.min(max, Math.max(1, limit))
}

function shouldSkipDbSnapshotRead() {
  return process.env.NEXT_PHASE === "phase-production-build"
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

function readInMemorySnapshotCache() {
  if (!inMemorySnapshotCache) {
    return null
  }

  if (inMemorySnapshotCache.expiresAt < Date.now()) {
    inMemorySnapshotCache = null
    return null
  }

  return inMemorySnapshotCache.value
}

function writeInMemorySnapshotCache(snapshot: CommunitySnapshot) {
  inMemorySnapshotCache = {
    value: snapshot,
    expiresAt: Date.now() + SNAPSHOT_MEMORY_CACHE_TTL_MS,
  }
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

function loadSnapshotFromDataFile(): CommunitySnapshot | null {
  try {
    const filePath = path.join(process.cwd(), "data", SNAPSHOT_DATA_FILENAME)
    const raw = fs.readFileSync(filePath, "utf8")
    const parsed = snapshotSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return null
    return parsed.data
  } catch {
    return null
  }
}

async function ensureSnapshotTable() {
  const { query } = await import("@/lib/db")
  await query(`
    CREATE TABLE IF NOT EXISTS community_snapshot (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}

async function readSnapshotFromDb(): Promise<CommunitySnapshot | null> {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    const { query } = await import("@/lib/db")
    const result = await query<{ payload: CommunitySnapshot }>(
      `
      SELECT payload
      FROM community_snapshot
      WHERE id = $1
      LIMIT 1
      `,
      [SNAPSHOT_ROW_ID]
    )
    const row = result.rows[0]
    if (!row) return null

    const parsed = snapshotSchema.safeParse(row.payload)
    if (!parsed.success) return null
    return parsed.data
  } catch {
    return null
  }
}

async function getCachedDbSnapshot() {
  "use cache"
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 })

  return readSnapshotFromDb()
}

async function readSnapshotPayload(): Promise<CommunitySnapshot | null> {
  if (shouldSkipDbSnapshotRead()) {
    return loadSnapshotFromDataFile()
  }

  const fromMemory = readInMemorySnapshotCache()
  if (fromMemory?.codes.length) {
    return fromMemory
  }

  const fromDb = await getCachedDbSnapshot()
  if (fromDb?.codes.length) {
    writeInMemorySnapshotCache(fromDb)
    return fromDb
  }

  const fromDataFile = loadSnapshotFromDataFile()
  if (fromDataFile?.codes.length) {
    writeInMemorySnapshotCache(fromDataFile)
  }

  return fromDataFile
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

  await ensureSnapshotTable()
  const { query } = await import("@/lib/db")
  await query(
    `
    INSERT INTO community_snapshot (id, payload, updated_at)
    VALUES ($1, $2::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE
    SET payload = EXCLUDED.payload, updated_at = NOW()
    `,
    [SNAPSHOT_ROW_ID, JSON.stringify(snapshot)]
  )

  writeInMemorySnapshotCache(snapshot)

  return snapshot
}

export function writeCommunitySnapshotToDataFile(
  snapshot: CommunitySnapshot,
  filePath = path.join(process.cwd(), "data", SNAPSHOT_DATA_FILENAME)
) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8")
}

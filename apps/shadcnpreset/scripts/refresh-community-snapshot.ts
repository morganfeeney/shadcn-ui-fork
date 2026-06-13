import {
  writeCommunitySnapshot,
  writeCommunitySnapshotToDataFile,
} from "@/lib/community-snapshot"
import { getCommunityPresetCodes } from "@/lib/community-presets"

async function main() {
  const requestedLimit = Number.parseInt(process.argv[2] ?? "2000", 10)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(5000, Math.max(1, requestedLimit))
    : 2000

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required")
  }

  const codes = await getCommunityPresetCodes(limit)
  const snapshot = await writeCommunitySnapshot(codes, "manual-refresh", limit)
  writeCommunitySnapshotToDataFile(snapshot)

  console.log(
    JSON.stringify({
      ok: true,
      source: snapshot.source,
      generatedAt: snapshot.generatedAt,
      count: snapshot.codes.length,
    })
  )
}

main().catch((error) => {
  console.error("Failed to refresh community snapshot", error)
  process.exit(1)
})

import {
  createCommunitySnapshot,
  writeCommunitySnapshotToDataFile,
} from "@/lib/community-snapshot"
import { getCommunityPresetCodes } from "@/lib/community-presets"

function getCliArgs() {
  return process.argv.slice(2).filter((value) => value !== "--")
}

async function main() {
  const [limitArg, sourceArg] = getCliArgs()
  const requestedLimit = Number.parseInt(limitArg ?? "2000", 10)
  const requestedSource = sourceArg
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(5000, Math.max(1, requestedLimit))
    : 2000
  const source =
    requestedSource === "github-cron" || requestedSource === "manual-refresh"
      ? requestedSource
      : "manual-refresh"

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required")
  }

  const codes = await getCommunityPresetCodes(limit)
  const snapshot = createCommunitySnapshot(codes, source, limit)
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

import { NextResponse } from "next/server"

import { getCommunityPresetCodes } from "@/lib/community-presets"
import { writeCommunitySnapshot } from "@/lib/community-snapshot"

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return false
  }

  const authorization = request.headers.get("authorization")
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null
  return bearerToken === cronSecret
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is required for snapshot refresh" },
      { status: 500 }
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is required for snapshot refresh" },
      { status: 500 }
    )
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is required for snapshot refresh" },
      { status: 500 }
    )
  }

  try {
    const requestedLimit = Number.parseInt(
      new URL(request.url).searchParams.get("limit") ?? "",
      10
    )
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(5000, Math.max(1, requestedLimit))
      : 2000

    const codes = await getCommunityPresetCodes(limit)
    const source = request.headers.get("x-vercel-cron") === "1" ? "neon-cron" : "manual-refresh"
    const snapshot = await writeCommunitySnapshot(codes, source, limit)

    return NextResponse.json({
      ok: true,
      source: snapshot.source,
      generatedAt: snapshot.generatedAt,
      count: snapshot.codes.length,
    })
  } catch (error) {
    console.error("Failed to refresh community snapshot", error)
    return NextResponse.json(
      { error: "Failed to refresh community snapshot" },
      { status: 500 }
    )
  }
}

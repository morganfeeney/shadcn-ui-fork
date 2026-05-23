import { NextResponse } from "next/server"

import { query } from "@/lib/db"
import { resolvePresetFromCode } from "@/lib/preset"

type LeaderboardRow = {
  preset_code: string
  votes: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedLimit = Number.parseInt(searchParams.get("limit") ?? "8", 10)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(50, Math.max(1, requestedLimit))
    : 8

  const result = await query<LeaderboardRow>(
    `
      SELECT preset_code, COUNT(*)::int as votes
      FROM preset_votes
      GROUP BY preset_code
      ORDER BY votes DESC, preset_code ASC
      LIMIT $1
      `,
    [limit]
  )
  const rows = result.rows

  const items = rows.map((row, index) => {
    const preset = resolvePresetFromCode(row.preset_code)
    const label = preset
      ? `${preset.style} / ${preset.theme}`
      : row.preset_code

    return {
      rank: index + 1,
      code: row.preset_code,
      label,
      href: `/preset/${row.preset_code}`,
      votes: row.votes,
    }
  })

  return NextResponse.json({ items })
}

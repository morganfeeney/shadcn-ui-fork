import { NextResponse } from "next/server"

import { getSessionUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { isCanonicalPresetCode } from "shadcn/preset"

type VoteRow = {
  preset_code: string
  votes: number
}

type UserVoteRow = {
  preset_code: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawCodes = searchParams.get("codes") ?? ""
  const parsedCodes = rawCodes
    .split(",")
    .map((code) => code.trim())
    .filter((code): code is string => Boolean(code))
    .filter((code) => isCanonicalPresetCode(code))

  const codes = [...new Set(parsedCodes)].slice(0, 120)

  if (!codes.length) {
    return NextResponse.json({
      votesByCode: {} as Record<string, number>,
      hasVotedByCode: {} as Record<string, boolean>,
      authenticated: false,
    })
  }

  const result = await query<VoteRow>(
    `
    SELECT preset_code, COUNT(*)::int as votes
    FROM preset_votes
    WHERE preset_code = ANY($1::text[])
    GROUP BY preset_code
    `,
    [codes]
  )

  const votesByCode: Record<string, number> = {}
  for (const code of codes) {
    votesByCode[code] = 0
  }
  for (const row of result.rows) {
    votesByCode[row.preset_code] = row.votes
  }

  const user = await getSessionUser()
  const hasVotedByCode: Record<string, boolean> = {}
  for (const code of codes) {
    hasVotedByCode[code] = false
  }

  if (user) {
    const userVotesResult = await query<UserVoteRow>(
      `
      SELECT preset_code
      FROM preset_votes
      WHERE user_id = $1
        AND preset_code = ANY($2::text[])
      `,
      [user.id, codes]
    )

    for (const row of userVotesResult.rows) {
      hasVotedByCode[row.preset_code] = true
    }
  }

  return NextResponse.json({
    votesByCode,
    hasVotedByCode,
    authenticated: Boolean(user),
  })
}

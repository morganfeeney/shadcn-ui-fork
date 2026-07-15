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

const ANON_VOTE_CACHE_TTL_MS = 30_000
const ANON_VOTE_CACHE_CONTROL = "public, s-maxage=30, stale-while-revalidate=120"

type CachedAnonymousVotes = {
  expiresAt: number
  votesByCode: Record<string, number>
}

const anonymousVotesCache = new Map<string, CachedAnonymousVotes>()

function createFalseVoteMap(codes: string[]) {
  const hasVotedByCode: Record<string, boolean> = {}
  for (const code of codes) {
    hasVotedByCode[code] = false
  }
  return hasVotedByCode
}

function buildVotesByCode(rows: VoteRow[], codes: string[]) {
  const votesByCode: Record<string, number> = {}
  for (const code of codes) {
    votesByCode[code] = 0
  }
  for (const row of rows) {
    votesByCode[row.preset_code] = row.votes
  }
  return votesByCode
}

function getVotesCacheKey(codes: string[]) {
  return codes.join(",")
}

function readAnonymousVotesCache(codes: string[]) {
  const entry = anonymousVotesCache.get(getVotesCacheKey(codes))
  if (!entry) {
    return null
  }

  if (entry.expiresAt < Date.now()) {
    anonymousVotesCache.delete(getVotesCacheKey(codes))
    return null
  }

  return { ...entry.votesByCode }
}

function writeAnonymousVotesCache(codes: string[], votesByCode: Record<string, number>) {
  anonymousVotesCache.set(getVotesCacheKey(codes), {
    expiresAt: Date.now() + ANON_VOTE_CACHE_TTL_MS,
    votesByCode: { ...votesByCode },
  })
}

function requestLooksAuthenticated(request: Request) {
  const authorization = request.headers.get("authorization")
  if (authorization?.trim()) {
    return true
  }

  const cookie = request.headers.get("cookie")
  if (!cookie) {
    return false
  }

  return cookie.includes("better-auth")
}

async function loadVotesByCode(codes: string[]) {
  const result = await query<VoteRow>(
    `
    SELECT preset_code, COUNT(*)::int as votes
    FROM preset_votes
    WHERE preset_code = ANY($1::text[])
    GROUP BY preset_code
    `,
    [codes]
  )

  return buildVotesByCode(result.rows, codes)
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

  const likelyAuthenticated = requestLooksAuthenticated(request)
  const cachedVotes = readAnonymousVotesCache(codes)
  if (!likelyAuthenticated && cachedVotes) {
    return NextResponse.json(
      {
        votesByCode: cachedVotes,
        hasVotedByCode: createFalseVoteMap(codes),
        authenticated: false,
      },
      {
        headers: {
          "Cache-Control": ANON_VOTE_CACHE_CONTROL,
        },
      }
    )
  }

  const votesByCode = cachedVotes ?? (await loadVotesByCode(codes))

  if (!likelyAuthenticated) {
    writeAnonymousVotesCache(codes, votesByCode)
    return NextResponse.json(
      {
        votesByCode,
        hasVotedByCode: createFalseVoteMap(codes),
        authenticated: false,
      },
      {
        headers: {
          "Cache-Control": ANON_VOTE_CACHE_CONTROL,
        },
      }
    )
  }

  const user = await getSessionUser()
  const hasVotedByCode = createFalseVoteMap(codes)
  if (!user) {
    writeAnonymousVotesCache(codes, votesByCode)
    return NextResponse.json({
      votesByCode,
      hasVotedByCode,
      authenticated: false,
    })
  }

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

  return NextResponse.json({
    votesByCode,
    hasVotedByCode,
    authenticated: Boolean(user),
  })
}

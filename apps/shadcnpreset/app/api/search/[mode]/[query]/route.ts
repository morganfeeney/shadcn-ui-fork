import { NextResponse } from "next/server"

import { getSearchPageData } from "@/lib/search/data"
import { isSearchMode } from "@/lib/search/route"

/** Search must never be statically cached; stale JSON looks like “search is broken”. */

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ mode: string; query: string }>
  }
) {
  const { mode, query: rawQuery } = await context.params

  if (!isSearchMode(mode)) {
    return NextResponse.json({ error: "Invalid search mode" }, { status: 400 })
  }

  let query = rawQuery.trim()
  try {
    query = decodeURIComponent(query.replace(/\+/g, "%20"))
  } catch {
    /* keep trimmed raw segment */
  }
  query = query.trim()
  if (!query) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 })
  }

  const payload = await getSearchPageData(mode, query)

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "private, no-store, must-revalidate",
    },
  })
}

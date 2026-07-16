import { NextResponse } from "next/server"

export async function GET(request: Request) {
  void request
  return NextResponse.json(
    {
      error: "Community snapshot refresh moved to offline automation",
      run: "pnpm --filter shadcnpreset refresh:community-snapshot -- 2000 manual-refresh",
      docs: "apps/shadcnpreset/COMMUNITY_SNAPSHOT.md",
    },
    { status: 410 }
  )
}

import { NextResponse } from "next/server"

import { isCommunityPresetCode } from "@/lib/community-presets"
import { resolvePresetFromCode } from "@/lib/preset"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const preset = resolvePresetFromCode(code)
  if (!preset) {
    return NextResponse.json(
      { dynamicOg: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    )
  }

  const dynamicOg = await isCommunityPresetCode(preset.code, code)
  return NextResponse.json(
    { dynamicOg },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  )
}

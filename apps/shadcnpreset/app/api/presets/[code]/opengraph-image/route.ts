import { notFound } from "next/navigation"

import generatePresetOgImage from "@/app/(preset)/preset/[code]/opengraph-image"

type RouteContext = {
  params: Promise<{ code: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { code } = await params
  if (!code) {
    notFound()
  }

  return generatePresetOgImage({
    params: Promise.resolve({ code }),
  })
}

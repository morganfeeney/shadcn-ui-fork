import { siteConfig } from "@/lib/config"
import {
  buildUrlSetXml,
  getPresetSitemapChunkCount,
  getPresetSitemapEntriesForChunk,
} from "@/lib/sitemap"

export const revalidate = 86_400

type PresetSitemapRouteProps = {
  params: Promise<{
    chunk: string
  }>
}

function notFoundResponse() {
  return new Response("Not found", { status: 404 })
}

export async function GET(_request: Request, { params }: PresetSitemapRouteProps) {
  const { chunk } = await params
  const chunkSansXml = chunk.replace(/\.xml$/i, "")
  const chunkNumber = Number.parseInt(chunkSansXml, 10)

  if (Number.isNaN(chunkNumber) || chunkNumber < 0) {
    return notFoundResponse()
  }

  if (chunkNumber >= getPresetSitemapChunkCount()) {
    return notFoundResponse()
  }

  const entries = getPresetSitemapEntriesForChunk({
    chunk: chunkNumber,
    baseUrl: siteConfig.url,
  })

  return new Response(buildUrlSetXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}

import { siteConfig } from "@/lib/config"
import {
  buildSitemapIndexXml,
  getPresetSitemapChunkCount,
} from "@/lib/sitemap"

export const revalidate = 86_400

export function GET() {
  const nowIso = new Date().toISOString()
  const presetChunkCount = getPresetSitemapChunkCount()

  const entries = [
    {
      loc: `${siteConfig.url}/sitemaps/static.xml`,
      lastmod: nowIso,
    },
    {
      loc: `${siteConfig.url}/sitemaps/community-presets.xml`,
      lastmod: nowIso,
    },
    ...Array.from({ length: presetChunkCount }, (_, chunk) => ({
      loc: `${siteConfig.url}/sitemaps/presets/${chunk}.xml`,
      lastmod: nowIso,
    })),
  ]

  return new Response(buildSitemapIndexXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}

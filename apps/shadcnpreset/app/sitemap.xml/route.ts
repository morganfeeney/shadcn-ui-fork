import { siteConfig } from "@/lib/config"
import { buildSitemapIndexXml } from "@/lib/sitemap"

export function GET() {
  const nowIso = new Date().toISOString()

  const entries = [
    {
      loc: `${siteConfig.url}/sitemaps/static.xml`,
      lastmod: nowIso,
    },
    {
      loc: `${siteConfig.url}/sitemaps/community-presets.xml`,
      lastmod: nowIso,
    },
  ]

  return new Response(buildSitemapIndexXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}

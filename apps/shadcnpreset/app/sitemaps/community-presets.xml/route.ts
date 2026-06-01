import { getCommunityPresetCodesForSitemap } from "@/lib/community-presets"
import { siteConfig } from "@/lib/config"
import { buildUrlSetXml } from "@/lib/sitemap"

export async function GET() {
  const nowIso = new Date().toISOString()

  try {
    const codes = await getCommunityPresetCodesForSitemap()
    const entries = codes.map((code) => ({
      loc: `${siteConfig.url}/preset/${code}`,
      lastmod: nowIso,
    }))

    return new Response(buildUrlSetXml(entries), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch (error) {
    console.error("Failed to build community presets sitemap", error)

    return new Response(buildUrlSetXml([]), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=86400",
      },
    })
  }
}

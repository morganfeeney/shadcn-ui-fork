import { siteConfig } from "@/lib/config"
import { buildUrlSetXml } from "@/lib/sitemap"

const STATIC_PATHS = [
  "/",
  "/community",
  "/high-contrast-presets",
  "/changelog",
  "/assistant",
  "/my-presets",
  "/tools",
  "/tools/preset-theme-generator",
  "/tools/color-contrast-checker",
] as const

export function GET() {
  const nowIso = new Date().toISOString()

  const entries = STATIC_PATHS.map((path) => ({
    loc: `${siteConfig.url}${path}`,
    lastmod: nowIso,
  }))

  return new Response(buildUrlSetXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}

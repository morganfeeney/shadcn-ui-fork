import type { ResolvedPreset } from "@/lib/preset"
import { presetMetaDescription } from "@/lib/data/metadata/preset-meta"

export type PresetSocialMetaPayload = {
  documentTitle: string
  description: string
  pageUrl: string
  ogTitle: string
  ogImageUrl: string
}

/**
 * Pure values written by {@link syncPresetPageSocialMeta} — testable without a DOM.
 * @param useDynamicOg — when true, use the expensive `/opengraph-image` route; otherwise `/og-card.png`.
 */
export function buildPresetSocialMetaPayload(
  resolved: ResolvedPreset,
  origin: string,
  siteName: string,
  useDynamicOg: boolean
): PresetSocialMetaPayload {
  const title = `shadcn preset: ${resolved.code}`
  const description = presetMetaDescription(resolved)
  const path = `/preset/${encodeURIComponent(resolved.code)}`
  const pageUrl = `${origin}${path}`
  const ogImageUrl = useDynamicOg
    ? `${pageUrl}/opengraph-image?v=${encodeURIComponent(resolved.code)}`
    : `${origin}/og-card.png`
  const branded = `${title} | ${siteName}`

  return {
    documentTitle: branded,
    description,
    pageUrl,
    ogTitle: branded,
    ogImageUrl,
  }
}

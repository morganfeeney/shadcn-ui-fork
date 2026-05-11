import { describe, expect, it } from "vitest"

import { buildPresetSocialMetaPayload } from "@/lib/build-preset-social-meta"
import { resolvePresetFromCode } from "@/lib/preset"

describe("buildPresetSocialMetaPayload", () => {
  const origin = "http://localhost:4010"
  const siteName = "shadcnpreset"

  it("builds URLs and cache-busted og:image for a valid preset", () => {
    const resolved = resolvePresetFromCode("bw4UuDRY")
    expect(resolved).not.toBeNull()

    const payload = buildPresetSocialMetaPayload(
      resolved!,
      origin,
      siteName,
      true
    )

    expect(payload.pageUrl).toBe(`${origin}/preset/bw4UuDRY`)
    expect(payload.ogImageUrl).toBe(
      `${origin}/preset/bw4UuDRY/opengraph-image?v=bw4UuDRY`
    )
    expect(payload.documentTitle).toContain("bw4UuDRY")
    expect(payload.documentTitle).toContain(siteName)
    expect(payload.ogTitle).toBe(payload.documentTitle)
    expect(payload.description.length).toBeGreaterThan(40)
  })

  it("uses static og-card when useDynamicOg is false", () => {
    const resolved = resolvePresetFromCode("bw4UuDRY")
    expect(resolved).not.toBeNull()

    const payload = buildPresetSocialMetaPayload(
      resolved!,
      origin,
      siteName,
      false
    )

    expect(payload.ogImageUrl).toBe(`${origin}/og-card.png`)
  })
})

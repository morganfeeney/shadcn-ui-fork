import { describe, expect, it } from "vitest"

import {
  buildFocalpointUrl,
  buildUnsplashImageUrl,
  clamp,
  findAspectPresetByRatio,
  getSliderSingleValue,
} from "@/lib/focalpoint-crop"

describe("focalpoint crop helpers", () => {
  it("clamps values to min and max bounds", () => {
    expect(clamp(-1, 0, 100)).toBe(0)
    expect(clamp(101, 0, 100)).toBe(100)
    expect(clamp(40, 0, 100)).toBe(40)
  })

  it("builds unsplash focalpoint URLs with expected params", () => {
    const result = buildFocalpointUrl(
      "https://images.unsplash.com/photo-12345",
      0.7231,
      0.6211,
      1.94,
      1200,
      900
    )
    const url = new URL(result)

    expect(url.hostname).toBe("images.unsplash.com")
    expect(url.searchParams.get("fit")).toBe("crop")
    expect(url.searchParams.get("crop")).toBe("focalpoint")
    expect(url.searchParams.get("w")).toBe("1200")
    expect(url.searchParams.get("h")).toBe("900")
    expect(url.searchParams.get("fp-x")).toBe("0.723")
    expect(url.searchParams.get("fp-y")).toBe("0.621")
    expect(url.searchParams.get("fp-z")).toBe("1.94")
    expect(url.searchParams.get("q")).toBe("80")
  })

  it("returns an empty string for invalid image urls", () => {
    expect(buildFocalpointUrl("not a valid url", 0.5, 0.5, 1.5, 1200, 900)).toBe("")
  })

  it("builds a canonical unsplash image url from photo id", () => {
    expect(buildUnsplashImageUrl("1691435828932-911a7801adfb")).toBe(
      "https://images.unsplash.com/photo-1691435828932-911a7801adfb"
    )
  })

  it("normalizes photo-prefixed ids and unsplash urls", () => {
    expect(buildUnsplashImageUrl("photo-abc123")).toBe(
      "https://images.unsplash.com/photo-abc123"
    )
    expect(
      buildUnsplashImageUrl(
        "https://images.unsplash.com/photo-abc123?auto=format&q=80"
      )
    ).toBe("https://images.unsplash.com/photo-abc123")
  })

  it("returns empty string for missing or invalid id input", () => {
    expect(buildUnsplashImageUrl("")).toBe("")
    expect(buildUnsplashImageUrl("not a url with spaces")).toBe("")
  })

  it("matches known preset ids by ratio", () => {
    expect(findAspectPresetByRatio(1200, 1200)?.id).toBe("1:1")
    expect(findAspectPresetByRatio(1600, 900)?.id).toBe("16:9")
    expect(findAspectPresetByRatio(900, 1600)?.id).toBe("9:16")
  })

  it("uses tolerance when matching ratios", () => {
    expect(findAspectPresetByRatio(1600.9, 900)?.id).toBe("16:9")
    expect(findAspectPresetByRatio(1177, 1000)).toBeNull()
  })

  it("normalizes slider value payloads", () => {
    expect(getSliderSingleValue(42, 50)).toBe(42)
    expect(getSliderSingleValue([24], 50)).toBe(24)
    expect(getSliderSingleValue([], 50)).toBe(50)
  })
})

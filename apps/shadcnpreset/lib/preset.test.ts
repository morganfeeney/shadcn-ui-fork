import { describe, expect, it } from "vitest"

import {
  effectiveHeadingFont,
  getPresetPreviewUrl,
  resolvePresetFromCode,
} from "@/lib/preset"

describe("resolvePresetFromCode", () => {
  it("normalizes the crashing preset code", () => {
    const resolved = resolvePresetFromCode("b5aFVCFRxi")

    expect(resolved).not.toBeNull()
    expect(resolved?.code).toBe("b5aFVCFRxi")
    expect(resolved?.baseColor).toBe("neutral")
    expect(resolved?.theme).toBe("green")
    expect(resolved?.effectiveChartColor).toBe("neutral")
    expect(resolved?.menuAccent).toBe("subtle")
  })
})

describe("effectiveHeadingFont", () => {
  it("uses body when heading is inherit", () => {
    expect(effectiveHeadingFont("inter", "inherit")).toBe("inter")
  })

  it("keeps a concrete heading font", () => {
    expect(effectiveHeadingFont("inter", "playfair-display")).toBe(
      "playfair-display"
    )
  })
})

describe("getPresetPreviewUrl", () => {
  it("uses the normalized canonical preset code for preview URLs", () => {
    const url = getPresetPreviewUrl("b5aFVCFRxi")

    expect(url).not.toBeNull()
    expect(url).toContain("/preview/radix/preview")
    expect(url).toContain("preset=b5aFUJkSzC")
  })

  it("points the dashboard view at the local preset-preview embed route", () => {
    const url = getPresetPreviewUrl("b5aFVCFRxi", "dashboard")

    expect(url).not.toBeNull()
    expect(url).toContain("/preset-preview/dashboard")
    expect(url).toContain("preset=b5aFUJkSzC")
  })

  it("points the login-02 view at the local preset-preview embed route", () => {
    const url = getPresetPreviewUrl("b5aFVCFRxi", "login-02")

    expect(url).not.toBeNull()
    expect(url).toContain("/preset-preview/login-02")
    expect(url).toContain("preset=b5aFUJkSzC")
  })

  it("points the login-04 view at the local preset-preview embed route", () => {
    const url = getPresetPreviewUrl("b5aFVCFRxi", "login-04")

    expect(url).not.toBeNull()
    expect(url).toContain("/preset-preview/login-04")
    expect(url).toContain("preset=b5aFUJkSzC")
  })
})

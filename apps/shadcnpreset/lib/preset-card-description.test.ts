import { describe, expect, it } from "vitest"

import {
  formatPresetCardDescription,
  formatPresetTypographyLine,
} from "@/lib/preset-card-description"

describe("formatPresetTypographyLine", () => {
  it("uses the body font when heading inherits", () => {
    expect(formatPresetTypographyLine("inherit", "geist")).toBe("geist font")
  })

  it("includes both fonts when heading differs", () => {
    expect(formatPresetTypographyLine("playfair", "geist")).toBe(
      "playfair & geist fonts"
    )
  })
})

describe("formatPresetCardDescription", () => {
  const baseConfig = {
    style: "modern",
    baseColor: "zinc",
    theme: "neutral",
    chartColor: null,
    iconLibrary: "lucide",
    font: "geist",
    fontHeading: "inherit",
  }

  it("falls back chart color to theme", () => {
    expect(formatPresetCardDescription(baseConfig)).toBe(
      "modern style, zinc base, neutral theme, neutral charts, lucide, geist font"
    )
  })

  it("always includes style and respects explicit chart + typography", () => {
    expect(
      formatPresetCardDescription({
        ...baseConfig,
        chartColor: "slate",
        fontHeading: "playfair",
      })
    ).toBe(
      "modern style, zinc base, neutral theme, slate charts, lucide, playfair & geist fonts"
    )
  })
})

import { describe, expect, it } from "vitest"

import { presetMetaDescription } from "@/lib/data/metadata/preset-meta"
import { resolvePresetFromCode } from "@/lib/preset"

describe("presetMetaDescription", () => {
  it("includes key fields from a resolved preset", () => {
    const resolved = resolvePresetFromCode("bw4UuDRY")
    expect(resolved).not.toBeNull()
    const text = presetMetaDescription(resolved!)
    expect(text).toContain("bw4UuDRY")
    expect(text).toContain(resolved!.style)
    expect(text).toContain(resolved!.baseColor)
    expect(text).toContain(resolved!.theme)
  })
})

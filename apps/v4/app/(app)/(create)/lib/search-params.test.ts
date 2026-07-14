import { describe, expect, it } from "vitest"

import { DEFAULT_CONFIG } from "@/registry/config"

import {
  buildPresetUrlUpdate,
  type DesignSystemSearchParams,
} from "./search-params"

const baseParams = (
  overrides: Partial<DesignSystemSearchParams> = {}
): DesignSystemSearchParams => ({
  ...DEFAULT_CONFIG,
  preset: "b0",
  item: "preview-02",
  size: 100,
  custom: false,
  baseCustomColor: "",
  themeCustomColor: "",
  chartCustomColor: "",
  embed: false,
  ...overrides,
})

describe("buildPresetUrlUpdate", () => {
  it("encodes design system params into preset and clears individual keys", () => {
    const update = buildPresetUrlUpdate(baseParams())

    expect(update.preset).toBeTypeOf("string")
    expect(update.style).toBeNull()
    expect(update.theme).toBeNull()
    expect(update.baseColor).toBeNull()
  })

  it("preserves template when syncing preset from ?template=start", () => {
    const update = buildPresetUrlUpdate(baseParams({ template: "start" }))
    expect(update.template).toBe("start")
    expect(update.preset).toBeTypeOf("string")
  })

  it("applies non-design-system updates from resolvedUpdates", () => {
    const update = buildPresetUrlUpdate(baseParams(), { template: "vite" })
    expect(update.template).toBe("vite")
  })
})

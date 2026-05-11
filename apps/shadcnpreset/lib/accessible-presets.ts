import fs from "node:fs"
import path from "node:path"

import { HIGH_CONTRAST_PRESET_CODES } from "@/lib/accessible-preset-codes"
import type { PresetPageItem } from "@/lib/preset-catalog"
import { resolvePresetFromCode } from "@/lib/preset"

const DATA_FILENAME = "high-contrast-presets.json"

type HighContrastDatasetFile = {
  codes?: string[]
}

/**
 * Cap how many codes are used (first N after load). Set `HIGH_CONTRAST_PRESET_LIMIT` in Vercel.
 * `/high-contrast-presets` is `force-static` — redeploy after changing this so the build picks it up.
 */
function applyHighContrastPresetLimit(
  codes: readonly string[]
): readonly string[] {
  const raw = process.env.HIGH_CONTRAST_PRESET_LIMIT?.trim()
  if (!raw) {
    return codes
  }
  const limit = Number.parseInt(raw, 10)
  if (!Number.isFinite(limit) || limit <= 0) {
    return codes
  }
  return codes.slice(0, limit)
}

function loadCodesFromDataFile(): string[] | null {
  try {
    const filePath = path.join(process.cwd(), "data", DATA_FILENAME)
    const raw = fs.readFileSync(filePath, "utf8")
    const parsed = JSON.parse(raw) as HighContrastDatasetFile
    if (!Array.isArray(parsed.codes) || parsed.codes.length === 0) {
      return null
    }
    return parsed.codes.filter((c) => typeof c === "string" && c.length > 0)
  } catch {
    return null
  }
}

/** Codes for the high-contrast list: optional generated dataset, else static fallback. */
export function getHighContrastPresetCodes(): readonly string[] {
  const codes = loadCodesFromDataFile() ?? HIGH_CONTRAST_PRESET_CODES
  return applyHighContrastPresetLimit(codes)
}

/** Resolved preset rows for the static high-contrast list (invalid codes are skipped). */
export function getHighContrastPresetFeed(): PresetPageItem[] {
  const codes = getHighContrastPresetCodes()
  const items: PresetPageItem[] = []
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i]!
    const preset = resolvePresetFromCode(code)
    if (!preset) continue
    items.push({
      index: items.length,
      code: preset.code,
      config: preset,
    })
  }
  return items
}

import {
  V1_CHART_COLOR_MAP,
  decodePreset,
  encodePreset,
  isPresetCode,
  type PresetConfig,
} from "shadcn/preset"
import {
  getPresetPreviewView,
  PRESET_PREVIEW_VIEWS,
  type PresetPreviewPageName,
} from "@/lib/preset-preview"
import { DEFAULT_CONFIG, getBaseColor, getThemesForBaseColor } from "@/registry/config"
import { getFontDefinition } from "@/lib/font-definitions"

export type ResolvedPreset = PresetConfig & {
  code: string
  isLegacyCode: boolean
  effectiveChartColor: PresetConfig["theme"]
  effectiveRadius: PresetConfig["radius"]
}

/**
 * Heading font token for styling: when the preset says `inherit`, use the body font.
 */
export function effectiveHeadingFont(
  bodyFont: string,
  headingFont: string
): string {
  return headingFont === "inherit" ? bodyFont : headingFont
}

function isTranslucentMenuColor(menuColor: ResolvedPreset["menuColor"]) {
  return (
    menuColor === "default-translucent" || menuColor === "inverted-translucent"
  )
}

function normalizeResolvedPreset(resolved: ResolvedPreset): ResolvedPreset {
  const baseColor = (
    getBaseColor(resolved.baseColor) ? resolved.baseColor : DEFAULT_CONFIG.baseColor
  ) as PresetConfig["baseColor"]

  const availableThemes = getThemesForBaseColor(baseColor)
  const availableThemeNames = new Set<PresetConfig["theme"]>(
    availableThemes.map((theme) => theme.name as PresetConfig["theme"])
  )
  const fallbackTheme: PresetConfig["theme"] =
    (availableThemes[0]?.name as PresetConfig["theme"] | undefined) ?? baseColor

  return {
    ...resolved,
    baseColor,
    theme: availableThemeNames.has(resolved.theme) ? resolved.theme : fallbackTheme,
    effectiveChartColor: availableThemeNames.has(resolved.effectiveChartColor)
      ? resolved.effectiveChartColor
      : fallbackTheme,
    menuAccent:
      resolved.menuAccent === "bold" && isTranslucentMenuColor(resolved.menuColor)
        ? "subtle"
        : resolved.menuAccent,
  }
}

export function resolvePresetFromCode(code: string): ResolvedPreset | null {
  if (!isPresetCode(code)) {
    return null
  }

  const decoded = decodePreset(code)
  if (!decoded) {
    return null
  }

  if (encodePreset(decoded) !== code) {
    return null
  }

  const effectiveChartColor =
    decoded.chartColor ??
    (V1_CHART_COLOR_MAP[decoded.theme] as PresetConfig["theme"] | undefined) ??
    decoded.theme
  const effectiveRadius =
    decoded.style === "lyra"
      ? "none"
      : (decoded.radius as PresetConfig["radius"])

  return normalizeResolvedPreset({
    ...decoded,
    code,
    isLegacyCode: code.startsWith("a"),
    effectiveChartColor,
    effectiveRadius,
  })
}

/**
 * Preview iframe URL: v4 block previews, or same-origin shadcn example embeds.
 */
export function getPresetPreviewUrl(
  code: string,
  pageName: PresetPreviewPageName = "preview"
): string | null {
  const resolved = resolvePresetFromCode(code)
  if (!resolved) return null
  const canonicalCode = encodePreset(resolved)
  const view = getPresetPreviewView(pageName)
  if (!view) return null

  if (view.target.kind === "local") {
    // Same-origin path only — avoids iframe loading a different host than the tab
    // (siteConfig.url can be apex while the user is on www, or vice versa), which
    // triggers Chrome security / cross-origin prompts for local demo embeds.
    const path = `/preset-preview/${view.target.example}`
    const params = new URLSearchParams({ preset: canonicalCode })
    return `${path}?${params.toString()}`
  }

  const v4BaseUrl = process.env.NEXT_PUBLIC_V4_URL ?? "http://localhost:4000"
  const previewUrl = new URL(`/preview/radix/${view.target.pageName}`, v4BaseUrl)
  previewUrl.searchParams.set("preset", canonicalCode)
  return previewUrl.toString()
}

export function getFontFamily(font: string): string {
  return getFontDefinition(font)?.family ?? '"Geist", system-ui, sans-serif'
}

/**
 * Returns the human-readable display name for a preset font value
 * (e.g. `"dm-sans"` → `"DM Sans"`). Falls back to a title-cased version of the
 * slug for any unknown values so we never render raw kebab-case to users.
 */
export function getFontDisplayName(font: string): string {
  if (font === "inherit") return "Inherit"
  const definition = getFontDefinition(font)
  if (definition) return definition.title
  return font
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export { PRESET_PREVIEW_VIEWS, type PresetPreviewPageName }

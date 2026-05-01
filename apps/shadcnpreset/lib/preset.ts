import {
  V1_CHART_COLOR_MAP,
  decodePreset,
  encodePreset,
  isPresetCode,
  type PresetConfig,
} from "shadcn/preset"
import { siteConfig } from "@/lib/config"
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

/** Matches v4 `PreviewSwitcher`: `/preview/radix/preview` vs `/preview/radix/preview-02`, plus local dashboard embed. */
export type PresetPreviewPageName = "preview" | "preview-02" | "dashboard"

export const PRESET_PREVIEW_VIEWS: ReadonlyArray<{
  page: PresetPreviewPageName
  label: string
}> = [
  { page: "preview", label: "View 1" },
  { page: "preview-02", label: "View 2" },
  { page: "dashboard", label: "Dashboard" },
] as const

/**
 * Preview iframe URL: v4 block previews, or same-origin dashboard demo with preset CSS vars.
 */
export function getPresetPreviewUrl(
  code: string,
  pageName: PresetPreviewPageName = "preview"
): string | null {
  const resolved = resolvePresetFromCode(code)
  if (!resolved) return null
  const canonicalCode = encodePreset(resolved)

  if (pageName === "dashboard") {
    const url = new URL("/preset-preview/dashboard", siteConfig.url)
    url.searchParams.set("preset", canonicalCode)
    url.searchParams.set("iconLibrary", resolved.iconLibrary)
    return url.toString()
  }

  const v4BaseUrl = process.env.NEXT_PUBLIC_V4_URL ?? "http://localhost:4000"
  const previewUrl = new URL(`/preview/radix/${pageName}`, v4BaseUrl)
  previewUrl.searchParams.set("preset", canonicalCode)
  previewUrl.searchParams.set("iconLibrary", resolved.iconLibrary)
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

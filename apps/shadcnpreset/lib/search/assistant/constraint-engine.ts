import {
  PRESET_BASE_COLORS,
  PRESET_ICON_LIBRARIES,
  PRESET_SERIF_FONTS,
  PRESET_STYLES,
  PRESET_THEMES,
  type PresetConfig,
} from "shadcn/preset"

import { formatPresetCardDescription } from "@/lib/preset-card-description"

const SERIF_FONTS = new Set<PresetConfig["font"]>(PRESET_SERIF_FONTS)
const BASE_COLOR_SET = new Set<PresetConfig["baseColor"]>(PRESET_BASE_COLORS)
const THEME_SET = new Set<PresetConfig["theme"]>(PRESET_THEMES)

type FontFamilyConstraint = "serif" | "sans"
export type TypographyConstraints = {
  headingFamily?: FontFamilyConstraint
  bodyFamily?: FontFamilyConstraint
}

export type PaletteConstraints = {
  wantsMonochrome: boolean
}

export type RequestedFacetChanges = {
  style: boolean
  baseColor: boolean
  theme: boolean
  chartColor: boolean
  iconLibrary: boolean
  radius: boolean
  menuColor: boolean
  menuAccent: boolean
  typographyHeading: boolean
  typographyBody: boolean
}

export type ExplicitFacetConstraints = {
  style?: PresetConfig["style"]
  baseColor?: PresetConfig["baseColor"]
  theme?: PresetConfig["theme"]
  menuTone?: "light" | "dark"
  chartColor?: PresetConfig["chartColor"]
}
export type StyleDirective = {
  mode: "all" | "atLeastOne" | "onlyOne"
  style: PresetConfig["style"]
}

const COLOR_WORDS = [...new Set(PRESET_THEMES)] as PresetConfig["theme"][]
const COLOR_WORDS_REGEX = new RegExp(`\\b(${COLOR_WORDS.join("|")})\\b`)
const ICON_WORDS_REGEX = new RegExp(
  `\\b(icon|icons|${PRESET_ICON_LIBRARIES.join("|")})\\b`
)
const STYLE_WORDS_REGEX = new RegExp(
  `\\b(${PRESET_STYLES.join("|")})\\b`
)

export function extractTypographyConstraints(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): TypographyConstraints {
  const constraints: TypographyConstraints = {}
  for (const msg of messages) {
    if (msg.role !== "user") continue
    const t = msg.content.toLowerCase()

    if (
      /(serif)\s+headings?/.test(t) ||
      /headings?\s+(should|must|to)?\s*be\s+serif/.test(t)
    ) {
      constraints.headingFamily = "serif"
    }
    if (
      /\bsans\s+headings?\b/.test(t) ||
      /(sans[-\s]?serif)\s+headings?/.test(t) ||
      /headings?\s+(should|must|to)?\s*be\s+(sans[-\s]?serif)/.test(t)
    ) {
      constraints.headingFamily = "sans"
    }

    if (
      /(serif)\s+body/.test(t) ||
      /body\s+(should|must|to)?\s*be\s+serif/.test(t)
    ) {
      constraints.bodyFamily = "serif"
    }
    if (
      /\bsans\s+body\b/.test(t) ||
      /(sans[-\s]?serif)\s+body/.test(t) ||
      /body\s+(should|must|to)?\s*be\s+(sans[-\s]?serif)/.test(t)
    ) {
      constraints.bodyFamily = "sans"
    }
  }

  return constraints
}

export function extractPaletteConstraints(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): PaletteConstraints {
  let wantsMonochrome = false

  for (const msg of messages) {
    if (msg.role !== "user") continue
    const t = msg.content.toLowerCase()

    const asksMonochrome =
      /\bmonochrome\b/.test(t) ||
      /\bmonochromatic\b/.test(t) ||
      /\bgrayscale\b/.test(t) ||
      /\bblack and white\b/.test(t) ||
      /\bgrey[-\s]?scale\b/.test(t)

    const asksSpecificColorAccent =
      COLOR_WORDS_REGEX.test(t) &&
      /\b(accent|accents|chart|charts|theme|palette)\b/.test(t)

    if (asksMonochrome) {
      wantsMonochrome = true
    } else if (asksSpecificColorAccent) {
      wantsMonochrome = false
    }
  }

  return { wantsMonochrome }
}

export function detectRequestedFacetChanges(
  lastUserText: string
): RequestedFacetChanges {
  const t = lastUserText.toLowerCase()
  const mentionsColorWord =
    COLOR_WORDS_REGEX.test(t) ||
    /\b(grey|monochrome|monochromatic|grayscale|black and white)\b/.test(t)
  const mentionsChart = /\b(chart|charts)\b/.test(t)
  const mentionsTheme = /\b(theme|palette|accent|accents|colour|color|colors|colours)\b/.test(
    t
  )
  const mentionsStyle =
    STYLE_WORDS_REGEX.test(t) || /\bstyle\b/.test(t) || /\blayout\b/.test(t)
  const mentionsHeadingTypography =
    /\b(heading|headings)\b/.test(t) &&
    /\b(font|fonts|serif|sans)\b/.test(t)
  const mentionsBodyTypography =
    /\bbody\b/.test(t) && /\b(font|fonts|serif|sans)\b/.test(t)
  const mentionsGenericTypography =
    /\b(font|fonts)\b/.test(t) &&
    !mentionsHeadingTypography &&
    !mentionsBodyTypography
  const mentionsIcons = ICON_WORDS_REGEX.test(t)
  const mentionsRadius = /\b(radius|rounded|sharp|corners?)\b/.test(t)
  const mentionsMenu = /\b(menu|sidebar|chrome)\b/.test(t)
  const mentionsMenuAccent = mentionsMenu && /\baccent\b/.test(t)

  return {
    style: mentionsStyle,
    baseColor: mentionsTheme && mentionsColorWord && !mentionsChart,
    theme: mentionsTheme && mentionsColorWord,
    chartColor: mentionsChart || (mentionsTheme && /\bchart\b/.test(t)),
    iconLibrary: mentionsIcons,
    radius: mentionsRadius,
    menuColor: mentionsMenu,
    menuAccent: mentionsMenuAccent,
    typographyHeading: mentionsHeadingTypography || mentionsGenericTypography,
    typographyBody: mentionsBodyTypography || mentionsGenericTypography,
  }
}

export function extractExplicitFacetConstraints(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): ExplicitFacetConstraints {
  const out: ExplicitFacetConstraints = {}
  const styleNames: PresetConfig["style"][] = [...PRESET_STYLES]
  const themeByWord: Record<string, PresetConfig["theme"]> = Object.fromEntries(
    PRESET_THEMES.map((t) => [t, t])
  ) as Record<string, PresetConfig["theme"]>
  themeByWord.grey = "gray"

  const baseColorByWord: Record<string, PresetConfig["baseColor"]> =
    Object.fromEntries(PRESET_BASE_COLORS.map((t) => [t, t])) as Record<
      string,
      PresetConfig["baseColor"]
    >
  baseColorByWord.grey = "gray"

  const chartColorByWord: Record<string, PresetConfig["chartColor"]> =
    Object.fromEntries(PRESET_THEMES.map((t) => [t, t])) as Record<
      string,
      PresetConfig["chartColor"]
    >
  chartColorByWord.grey = "gray"

  const chartColors = Object.keys(chartColorByWord)
  const colorWordRegex = /\b([a-z-]+)\b/g

  function extractLastColorWord(
    t: string
  ): { theme?: PresetConfig["theme"]; baseColor?: PresetConfig["baseColor"] } {
    let lastTheme: PresetConfig["theme"] | undefined
    let lastBaseColor: PresetConfig["baseColor"] | undefined
    for (const match of t.matchAll(colorWordRegex)) {
      const word = match[1]!
      if (themeByWord[word]) lastTheme = themeByWord[word]
      if (baseColorByWord[word]) lastBaseColor = baseColorByWord[word]
    }
    return { theme: lastTheme, baseColor: lastBaseColor }
  }

  function extractChartColorFromText(t: string): PresetConfig["chartColor"] | undefined {
    // Prefer color directly attached to "chart(s)", e.g. "amber charts".
    for (const c of chartColors) {
      const before = new RegExp(`\\b${c}\\s+(chart|charts)\\b`)
      if (before.test(t)) return chartColorByWord[c]
    }
    // Also support "charts in amber" / "charts with amber".
    for (const c of chartColors) {
      const after = new RegExp(`\\b(chart|charts)\\b[^.\\n]{0,24}\\b${c}\\b`)
      if (after.test(t)) return chartColorByWord[c]
    }
    return undefined
  }

  for (const msg of messages) {
    if (msg.role !== "user") continue
    const t = msg.content.toLowerCase()

    for (const style of styleNames) {
      if (new RegExp(`\\b${style}\\b`).test(t)) out.style = style
    }

    if (
      /\b(dark|inverted)\b/.test(t) &&
      /\b(menu|sidebar|chrome)\b/.test(t)
    ) {
      out.menuTone = "dark"
    } else if (
      /\b(light|default)\b/.test(t) &&
      /\b(menu|sidebar|chrome)\b/.test(t)
    ) {
      out.menuTone = "light"
    }

    if (/\b(chart|charts)\b/.test(t)) {
      const scoped = extractChartColorFromText(t)
      if (scoped) {
        out.chartColor = scoped
      } else {
        // Fallback: if no scoped phrase, use last color mention.
        for (const [word, color] of Object.entries(chartColorByWord)) {
          if (new RegExp(`\\b${word}\\b`).test(t)) out.chartColor = color
        }
      }
    }

    const hasThemeToken = /\btheme\b/.test(t)
    const hasBaseToken = /\bbase\b/.test(t)
    const hasChartsToken = /\b(chart|charts)\b/.test(t)
    const lastColor = extractLastColorWord(t)

    if (hasThemeToken && lastColor.theme) {
      out.theme = lastColor.theme
    }
    if (hasBaseToken && lastColor.baseColor) {
      out.baseColor = lastColor.baseColor
    }

    if (hasThemeToken && hasBaseToken && hasChartsToken) {
      if (lastColor.theme) out.theme = lastColor.theme
      if (lastColor.baseColor) out.baseColor = lastColor.baseColor
      if (lastColor.theme) out.chartColor = lastColor.theme
    }
  }

  return out
}

export function extractStyleDirective(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): StyleDirective | null {
  let latest: StyleDirective | null = null
  for (const msg of messages) {
    if (msg.role !== "user") continue
    const t = msg.content.toLowerCase()
    const matchedStyle = PRESET_STYLES.find((s) =>
      new RegExp(`\\b${s}\\b`).test(t)
    )
    if (!matchedStyle) continue

    const onlyOneStyle = new RegExp(`\\bonly\\s+one\\s+${matchedStyle}\\b`).test(
      t
    )
    const oneStyle = new RegExp(`\\bone\\s+${matchedStyle}\\b`).test(t)
    const oneInStyle = new RegExp(`\\bone\\s+in\\s+${matchedStyle}\\b`).test(t)
    const makeOneStyle = new RegExp(`\\bmake\\s+one\\s+${matchedStyle}\\b`).test(
      t
    )

    if (/\bonly one\b/.test(t) || /\bjust one\b/.test(t)) {
      latest = { mode: "onlyOne", style: matchedStyle }
      continue
    }
    if (onlyOneStyle) {
      latest = { mode: "onlyOne", style: matchedStyle }
      continue
    }
    if (
      /\bat least one\b/.test(t) ||
      /\bone in\b/.test(t) ||
      /\bincluding one\b/.test(t) ||
      oneStyle ||
      oneInStyle ||
      makeOneStyle
    ) {
      latest = { mode: "atLeastOne", style: matchedStyle }
      continue
    }
    if (
      /\ball\b/.test(t) ||
      /\beach\b/.test(t) ||
      /\bevery\b/.test(t) ||
      /\bmake (them|all)\b/.test(t)
    ) {
      latest = { mode: "all", style: matchedStyle }
      continue
    }
  }
  return latest
}

export function applyStyleDirective(
  config: PresetConfig,
  index: number,
  previous: PresetConfig | undefined,
  directive: StyleDirective | null
): PresetConfig {
  if (!directive) return config

  if (directive.mode === "all") {
    return { ...config, style: directive.style }
  }

  if (directive.mode === "atLeastOne") {
    if (index === 0) return { ...config, style: directive.style }
    return config
  }

  // onlyOne
  if (index === 0) return { ...config, style: directive.style }

  if (config.style !== directive.style) return config
  if (previous && previous.style !== directive.style) {
    return { ...config, style: previous.style }
  }
  const fallback = PRESET_STYLES.find((s) => s !== directive.style) ?? config.style
  return { ...config, style: fallback }
}

export function applyTypographyConstraints(
  config: PresetConfig,
  constraints: TypographyConstraints
): PresetConfig {
  const next = { ...config }

  if (constraints.headingFamily === "serif") {
    const hasSerifHeading =
      next.fontHeading !== "inherit" && SERIF_FONTS.has(next.fontHeading)
    if (!hasSerifHeading) next.fontHeading = "lora"
  } else if (constraints.headingFamily === "sans") {
    if (next.fontHeading === "inherit" || SERIF_FONTS.has(next.fontHeading)) {
      next.fontHeading = "inter"
    }
  }

  if (constraints.bodyFamily === "serif") {
    if (!SERIF_FONTS.has(next.font)) next.font = "lora"
  } else if (constraints.bodyFamily === "sans") {
    if (SERIF_FONTS.has(next.font)) next.font = "inter"
  }

  return next
}

export function applyPaletteConstraints(
  config: PresetConfig,
  constraints: PaletteConstraints
): PresetConfig {
  if (!constraints.wantsMonochrome) return config

  const monochromeColor: PresetConfig["theme"] = BASE_COLOR_SET.has(
    config.theme as PresetConfig["baseColor"]
  )
    ? config.theme
    : THEME_SET.has(config.baseColor as PresetConfig["theme"])
      ? (config.baseColor as PresetConfig["theme"])
      : "neutral"

  return {
    ...config,
    baseColor: monochromeColor as PresetConfig["baseColor"],
    theme: monochromeColor,
    chartColor: monochromeColor,
  }
}

export function applyExplicitFacetConstraints(
  config: PresetConfig,
  constraints: ExplicitFacetConstraints
): PresetConfig {
  const next = { ...config }
  if (constraints.style) next.style = constraints.style
  if (constraints.baseColor) next.baseColor = constraints.baseColor
  if (constraints.theme) next.theme = constraints.theme
  if (constraints.chartColor) next.chartColor = constraints.chartColor
  if (constraints.menuTone === "dark") {
    next.menuColor = next.menuColor.includes("translucent")
      ? "inverted-translucent"
      : "inverted"
  } else if (constraints.menuTone === "light") {
    next.menuColor = next.menuColor.includes("translucent")
      ? "default-translucent"
      : "default"
  }
  return next
}

export function applyStagePreservation(
  config: PresetConfig,
  previous: PresetConfig | undefined,
  changes: RequestedFacetChanges
): PresetConfig {
  if (!previous) return config
  return {
    style: changes.style ? config.style : previous.style,
    baseColor: changes.baseColor ? config.baseColor : previous.baseColor,
    theme: changes.theme ? config.theme : previous.theme,
    chartColor: changes.chartColor ? config.chartColor : previous.chartColor,
    iconLibrary: changes.iconLibrary ? config.iconLibrary : previous.iconLibrary,
    font: changes.typographyBody ? config.font : previous.font,
    fontHeading: changes.typographyHeading
      ? config.fontHeading
      : previous.fontHeading,
    radius: changes.radius ? config.radius : previous.radius,
    menuColor: changes.menuColor ? config.menuColor : previous.menuColor,
    menuAccent: changes.menuAccent ? config.menuAccent : previous.menuAccent,
  }
}

export function buildPresetCardDescription(c: PresetConfig): string {
  return formatPresetCardDescription(c)
}

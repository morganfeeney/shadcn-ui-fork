import { parse, wcagContrast } from "culori"

import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"

const AA_NORMAL = 4.5
const AA_LARGE = 3
const AAA_NORMAL = 7

/** Threshold used for AA "normal" text in reports and UI copy. */
export const PRESET_CONTRAST_AA_NORMAL_RATIO = AA_NORMAL

/** WCAG 2.x AAA enhanced contrast for normal text. */
export const PRESET_CONTRAST_AAA_NORMAL_RATIO = AAA_NORMAL

/** Theme object keys for foreground / background colors (no `--` prefix). */
export const PRESET_THEME_CONTRAST_PAIRS: readonly {
  foreground: string
  background: string
}[] = [
  { foreground: "foreground", background: "background" },
  { foreground: "card-foreground", background: "card" },
  { foreground: "popover-foreground", background: "popover" },
  { foreground: "primary-foreground", background: "primary" },
  { foreground: "secondary-foreground", background: "secondary" },
  { foreground: "muted-foreground", background: "muted" },
  { foreground: "accent-foreground", background: "accent" },
  { foreground: "sidebar-foreground", background: "sidebar" },
  {
    foreground: "sidebar-primary-foreground",
    background: "sidebar-primary",
  },
  {
    foreground: "sidebar-accent-foreground",
    background: "sidebar-accent",
  },
] as const

function contrastPairId(foreground: string, background: string) {
  return `${foreground}-on-${background}`
}

export type ThemeMode = "light" | "dark"

export type PresetContrastPairResult = {
  id: string
  foregroundKey: string
  backgroundKey: string
  foregroundRaw: string
  backgroundRaw: string
  ratio: number | null
  passAaNormal: boolean | null
  passAaLarge: boolean | null
  passAaaNormal: boolean | null
  note?: string
}

export type PresetColorContrastModeReport = {
  mode: ThemeMode
  pairs: PresetContrastPairResult[]
  passCount: number
  failCount: number
  unresolvedCount: number
}

export type PresetColorContrastReport = {
  code: string
  /** Subtitle for preset preview cards (style, colors, icons, typography). */
  overviewDescription: string
  light: PresetColorContrastModeReport
  dark: PresetColorContrastModeReport
}

/** Share of evaluated semantic pairs that meet AA normal text (4.5:1). */
export type OverallContrastScore = {
  percent: number | null
  evaluatedCount: number
  passCount: number
  failCount: number
  unresolvedCount: number
}

export function getOverallContrastScore(
  mode: PresetColorContrastModeReport
): OverallContrastScore {
  const evaluated = mode.passCount + mode.failCount
  const percent =
    evaluated === 0
      ? null
      : Math.round((mode.passCount / evaluated) * 100)

  return {
    percent,
    evaluatedCount: evaluated,
    passCount: mode.passCount,
    failCount: mode.failCount,
    unresolvedCount: mode.unresolvedCount,
  }
}

/** Share of evaluated pairs that meet AAA normal text (7:1). Unresolved pairs excluded. */
export function getOverallAaaScore(
  mode: PresetColorContrastModeReport
): OverallContrastScore {
  let passAaa = 0
  let failAaa = 0
  for (const p of mode.pairs) {
    if (p.ratio === null) continue
    if (p.passAaaNormal) {
      passAaa++
    } else {
      failAaa++
    }
  }
  const evaluated = passAaa + failAaa
  const percent =
    evaluated === 0 ? null : Math.round((passAaa / evaluated) * 100)

  return {
    percent,
    evaluatedCount: evaluated,
    passCount: passAaa,
    failCount: failAaa,
    unresolvedCount: mode.unresolvedCount,
  }
}

function evaluatePair(
  vars: Record<string, string>,
  def: (typeof PRESET_THEME_CONTRAST_PAIRS)[number]
): PresetContrastPairResult {
  const pairId = contrastPairId(def.foreground, def.background)
  const fgRaw = vars[def.foreground]
  const bgRaw = vars[def.background]

  if (!fgRaw || !bgRaw) {
    return {
      id: pairId,
      foregroundKey: def.foreground,
      backgroundKey: def.background,
      foregroundRaw: fgRaw ?? "(missing)",
      backgroundRaw: bgRaw ?? "(missing)",
      ratio: null,
      passAaNormal: null,
      passAaLarge: null,
      passAaaNormal: null,
      note: `Missing ${def.foreground} or ${def.background} in theme.`,
    }
  }

  const fg = parse(fgRaw)
  const bg = parse(bgRaw)

  if (!fg || !bg) {
    return {
      id: pairId,
      foregroundKey: def.foreground,
      backgroundKey: def.background,
      foregroundRaw: fgRaw,
      backgroundRaw: bgRaw,
      ratio: null,
      passAaNormal: null,
      passAaLarge: null,
      passAaaNormal: null,
      note:
        "Could not parse color (e.g. unresolved var() or color-mix). Use the browser inspector for these.",
    }
  }

  const ratio = wcagContrast(fg, bg)

  return {
    id: pairId,
    foregroundKey: def.foreground,
    backgroundKey: def.background,
    foregroundRaw: fgRaw,
    backgroundRaw: bgRaw,
    ratio,
    passAaNormal: ratio >= AA_NORMAL,
    passAaLarge: ratio >= AA_LARGE,
    passAaaNormal: ratio >= AAA_NORMAL,
  }
}

function summarize(
  mode: ThemeMode,
  pairs: PresetContrastPairResult[]
): PresetColorContrastModeReport {
  let passCount = 0
  let failCount = 0
  let unresolvedCount = 0

  for (const p of pairs) {
    if (p.ratio === null) {
      unresolvedCount++
    } else if (p.passAaNormal) {
      passCount++
    } else {
      failCount++
    }
  }

  return { mode, pairs, passCount, failCount, unresolvedCount }
}

export function buildColorContrastReportForVars(
  lightVars: Record<string, string>,
  darkVars: Record<string, string>
): Pick<PresetColorContrastReport, "light" | "dark"> {
  const lightPairs = PRESET_THEME_CONTRAST_PAIRS.map((d) =>
    evaluatePair(lightVars, d)
  )
  const darkPairs = PRESET_THEME_CONTRAST_PAIRS.map((d) =>
    evaluatePair(darkVars, d)
  )

  return {
    light: summarize("light", lightPairs),
    dark: summarize("dark", darkPairs),
  }
}

export function getPresetColorContrastReport(
  code: string
): PresetColorContrastReport | null {
  const bundle = getPresetThemeCssBundle(code)
  if (!bundle) return null

  const { light, dark } = buildColorContrastReportForVars(
    bundle.lightVars,
    bundle.darkVars
  )
  const r = bundle.resolved
  const overviewDescription = formatPresetCardDescription({
    ...r,
    chartColor: r.effectiveChartColor,
  })

  return {
    code: bundle.resolved.code,
    overviewDescription,
    light,
    dark,
  }
}

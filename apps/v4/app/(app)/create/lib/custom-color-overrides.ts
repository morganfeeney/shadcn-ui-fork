import {
  formatOklch,
  parseOklch,
  type ParsedOklch,
} from "@/app/(app)/create/lib/oklch"

type ThemeCssVarsInput = {
  theme?: Record<string, string> | undefined
  light?: Record<string, string>
  dark?: Record<string, string>
}

type ThemeCssVars = {
  theme: Record<string, string> | undefined
  light: Record<string, string>
  dark: Record<string, string>
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function createTone(base: ParsedOklch, lightness: number, chromaScale = 1) {
  return formatOklch({
    l: clamp(lightness, 0, 1),
    c: clamp(base.c * chromaScale, 0, 0.4),
    h: base.h,
  })
}

function buildChartScale(color: ParsedOklch, mode: "light" | "dark") {
  const lightnessStops =
    mode === "light"
      ? [0.86, 0.72, 0.58, 0.48, 0.4]
      : [0.78, 0.66, 0.56, 0.46, 0.38]
  const chromaScale = [1, 0.94, 0.88, 0.8, 0.72]

  return lightnessStops.map((lightness, index) =>
    formatOklch({
      l: clamp(lightness, 0, 1),
      c: clamp(color.c * chromaScale[index], 0, 0.4),
      h: color.h,
    })
  )
}

export function applyCustomColorOverrides(
  cssVars: ThemeCssVarsInput,
  {
    baseCustomColor,
    themeCustomColor,
    chartCustomColor,
    includePrimaryFromBase,
    includeChartFromBase,
  }: {
    baseCustomColor?: string | null
    themeCustomColor?: string | null
    chartCustomColor?: string | null
    includePrimaryFromBase?: boolean
    includeChartFromBase?: boolean
  }
): ThemeCssVars {
  const next: ThemeCssVars = {
    theme: { ...(cssVars.theme ?? {}) },
    light: { ...(cssVars.light ?? {}) },
    dark: { ...(cssVars.dark ?? {}) },
  }

  const parsedBase = parseOklch(baseCustomColor)
  if (parsedBase) {
    const neutralBase: ParsedOklch = {
      l: parsedBase.l,
      c: clamp(parsedBase.c * 0.16, 0, 0.03),
      h: parsedBase.h,
    }

    next.light = {
      ...(next.light ?? {}),
      background: createTone(neutralBase, 0.992, 0.2),
      foreground: createTone(neutralBase, 0.185, 0.45),
      card: createTone(neutralBase, 0.992, 0.2),
      "card-foreground": createTone(neutralBase, 0.185, 0.45),
      popover: createTone(neutralBase, 0.992, 0.2),
      "popover-foreground": createTone(neutralBase, 0.185, 0.45),
      secondary: createTone(neutralBase, 0.958, 0.5),
      "secondary-foreground": createTone(neutralBase, 0.23, 0.5),
      muted: createTone(neutralBase, 0.958, 0.5),
      "muted-foreground": createTone(neutralBase, 0.54, 0.7),
      accent: createTone(neutralBase, 0.958, 0.5),
      "accent-foreground": createTone(neutralBase, 0.23, 0.5),
      border: createTone(neutralBase, 0.9, 0.55),
      input: createTone(neutralBase, 0.9, 0.55),
      ring: createTone(neutralBase, 0.705, 0.9),
      sidebar: createTone(neutralBase, 0.985, 0.25),
      "sidebar-foreground": createTone(neutralBase, 0.185, 0.45),
      "sidebar-accent": createTone(neutralBase, 0.958, 0.5),
      "sidebar-accent-foreground": createTone(neutralBase, 0.23, 0.5),
      "sidebar-border": createTone(neutralBase, 0.9, 0.55),
      "sidebar-ring": createTone(neutralBase, 0.705, 0.9),
    }

    next.dark = {
      ...(next.dark ?? {}),
      background: createTone(neutralBase, 0.145, 0.45),
      foreground: createTone(neutralBase, 0.985, 0.2),
      card: createTone(neutralBase, 0.205, 0.5),
      "card-foreground": createTone(neutralBase, 0.985, 0.2),
      popover: createTone(neutralBase, 0.205, 0.5),
      "popover-foreground": createTone(neutralBase, 0.985, 0.2),
      secondary: createTone(neutralBase, 0.285, 0.55),
      "secondary-foreground": createTone(neutralBase, 0.985, 0.2),
      muted: createTone(neutralBase, 0.285, 0.55),
      "muted-foreground": createTone(neutralBase, 0.72, 0.8),
      accent: createTone(neutralBase, 0.285, 0.55),
      "accent-foreground": createTone(neutralBase, 0.985, 0.2),
      border: `oklch(${clamp(0.95, 0, 1).toFixed(3)} ${(neutralBase.c * 0.1).toFixed(3)} ${neutralBase.h.toFixed(2)} / 10%)`,
      input: `oklch(${clamp(0.95, 0, 1).toFixed(3)} ${(neutralBase.c * 0.1).toFixed(3)} ${neutralBase.h.toFixed(2)} / 15%)`,
      ring: createTone(neutralBase, 0.56, 0.8),
      sidebar: createTone(neutralBase, 0.205, 0.5),
      "sidebar-foreground": createTone(neutralBase, 0.985, 0.2),
      "sidebar-accent": createTone(neutralBase, 0.285, 0.55),
      "sidebar-accent-foreground": createTone(neutralBase, 0.985, 0.2),
      "sidebar-border": `oklch(${clamp(0.95, 0, 1).toFixed(3)} ${(neutralBase.c * 0.1).toFixed(3)} ${neutralBase.h.toFixed(2)} / 10%)`,
      "sidebar-ring": createTone(neutralBase, 0.56, 0.8),
    }
  }

  const parsedTheme = parseOklch(themeCustomColor)
  const resolvedThemeSource =
    parsedTheme ??
    (includePrimaryFromBase && parsedBase
      ? {
          ...parsedBase,
          c: clamp(parsedBase.c, 0.03, 0.24),
        }
      : null)

  if (resolvedThemeSource) {
    const themeColor = formatOklch(resolvedThemeSource)
    const foreground =
      resolvedThemeSource.l > 0.62 ? "oklch(0.205 0 0)" : "oklch(0.985 0 0)"

    next.light = {
      ...(next.light ?? {}),
      primary: themeColor,
      "primary-foreground": foreground,
      "sidebar-primary": themeColor,
      "sidebar-primary-foreground": foreground,
    }

    next.dark = {
      ...(next.dark ?? {}),
      primary: themeColor,
      "primary-foreground": foreground,
      "sidebar-primary": themeColor,
      "sidebar-primary-foreground": foreground,
    }
  }

  const parsedChart = parseOklch(chartCustomColor)
  const resolvedChartSource =
    parsedChart ??
    (includeChartFromBase && parsedBase
      ? {
          ...parsedBase,
          c: clamp(parsedBase.c, 0.03, 0.22),
        }
      : null)

  if (resolvedChartSource) {
    const lightScale = buildChartScale(resolvedChartSource, "light")
    const darkScale = buildChartScale(resolvedChartSource, "dark")

    next.light = {
      ...(next.light ?? {}),
      "chart-1": lightScale[0],
      "chart-2": lightScale[1],
      "chart-3": lightScale[2],
      "chart-4": lightScale[3],
      "chart-5": lightScale[4],
    }

    next.dark = {
      ...(next.dark ?? {}),
      "chart-1": darkScale[0],
      "chart-2": darkScale[1],
      "chart-3": darkScale[2],
      "chart-4": darkScale[3],
      "chart-5": darkScale[4],
    }
  }

  return next
}

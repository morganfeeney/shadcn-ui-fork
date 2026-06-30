import { parse, wcagContrast } from "culori"

export type ThemeToken =
  | "background"
  | "foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "border"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"

export type SwatchCell = {
  label: string
  backgroundToken: ThemeToken
  textToken: ThemeToken
  autoChartText?: boolean
}

export const SWATCH_ROWS: readonly (readonly SwatchCell[])[] = [
  [
    {
      label: "Background",
      backgroundToken: "background",
      textToken: "foreground",
    },
    {
      label: "Border",
      backgroundToken: "border",
      textToken: "foreground",
    },
  ],
  [
    {
      label: "Foreground",
      backgroundToken: "foreground",
      textToken: "background",
    },
    {
      label: "Chart 1",
      backgroundToken: "chart-1",
      textToken: "foreground",
      autoChartText: true,
    },
  ],
  [
    {
      label: "Primary",
      backgroundToken: "primary",
      textToken: "primary-foreground",
    },
    {
      label: "Chart 2",
      backgroundToken: "chart-2",
      textToken: "foreground",
      autoChartText: true,
    },
  ],
  [
    {
      label: "Secondary",
      backgroundToken: "secondary",
      textToken: "secondary-foreground",
    },
    {
      label: "Chart 3",
      backgroundToken: "chart-3",
      textToken: "foreground",
      autoChartText: true,
    },
  ],
  [
    { label: "Muted", backgroundToken: "muted", textToken: "muted-foreground" },
    {
      label: "Chart 4",
      backgroundToken: "chart-4",
      textToken: "foreground",
      autoChartText: true,
    },
  ],
  [
    {
      label: "Accent",
      backgroundToken: "accent",
      textToken: "accent-foreground",
    },
    {
      label: "Chart 5",
      backgroundToken: "chart-5",
      textToken: "foreground",
      autoChartText: true,
    },
  ],
] as const

function pickReadableTextToken(
  vars: Record<string, string>,
  backgroundToken: ThemeToken
): ThemeToken {
  const bgRaw = vars[backgroundToken]
  const foregroundRaw = vars.foreground
  const backgroundRaw = vars.background
  if (!bgRaw || !foregroundRaw || !backgroundRaw) {
    return "foreground"
  }

  const bg = parse(bgRaw)
  const fg = parse(foregroundRaw)
  const baseBg = parse(backgroundRaw)
  if (!bg || !fg || !baseBg) {
    return "foreground"
  }

  const contrastWithForeground = wcagContrast(fg, bg)
  const contrastWithBackground = wcagContrast(baseBg, bg)
  return contrastWithBackground > contrastWithForeground
    ? "background"
    : "foreground"
}

export function resolveSwatchRowsForMode(vars: Record<string, string>) {
  return SWATCH_ROWS.map((row) =>
    row.map((cell) =>
      cell.autoChartText
        ? {
            ...cell,
            textToken: pickReadableTextToken(vars, cell.backgroundToken),
          }
        : { ...cell, textToken: cell.textToken }
    )
  )
}

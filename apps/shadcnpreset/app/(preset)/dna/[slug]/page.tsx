import { notFound } from "next/navigation"
import { parse, wcagContrast } from "culori"

import {
  effectiveHeadingFont,
  getFontDisplayName,
  resolvePresetFromCode,
} from "@/lib/preset"
import { getPresetGoogleFontStylesheetHrefs } from "@/lib/preset-google-fonts"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"

type ThemeToken =
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

type SwatchCell = {
  label: string
  backgroundToken: ThemeToken
  textToken: ThemeToken
  autoChartText?: boolean
}

const SWATCH_ROWS: readonly (readonly SwatchCell[])[] = [
  [
    { label: "Background", backgroundToken: "background", textToken: "foreground" },
    { label: "Border", backgroundToken: "border", textToken: "foreground" },
  ],
  [
    { label: "Foreground", backgroundToken: "foreground", textToken: "background" },
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
    { label: "Accent", backgroundToken: "accent", textToken: "accent-foreground" },
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

function resolveSwatchRowsForMode(vars: Record<string, string>) {
  return SWATCH_ROWS.map((row) =>
    row.map((cell) =>
      cell.autoChartText
        ? {
            ...cell,
            textToken: pickReadableTextToken(vars, cell.backgroundToken),
          }
        : cell
    )
  )
}

type DnaPageProps = {
  params: Promise<{ slug: string }>
}

export default async function DnaPage({ params }: DnaPageProps) {
  const { slug } = await params
  const code = slug.trim()
  const resolved = resolvePresetFromCode(code)
  const bundle = getPresetThemeCssBundle(code)

  if (!resolved || !bundle) {
    notFound()
  }

  const headingFont = effectiveHeadingFont(resolved.font, resolved.fontHeading)
  const fontHrefs = getPresetGoogleFontStylesheetHrefs([resolved.font, headingFont])
  const title = `Preset: ${resolved.code}`
  const lightSwatchRows = resolveSwatchRowsForMode(bundle.lightVars)
  const darkSwatchRows = resolveSwatchRowsForMode(bundle.darkVars)

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {fontHrefs.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <style dangerouslySetInnerHTML={{ __html: bundle.combinedCss }} />

      <main className="mx-auto w-full max-w-7xl space-y-8 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            style {resolved.style} / base {resolved.baseColor} / theme{" "}
            {resolved.theme} / chart {resolved.effectiveChartColor}
          </p>
          <p className="text-sm text-muted-foreground">
            body {getFontDisplayName(resolved.font)} / heading{" "}
            {getFontDisplayName(headingFont)}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-medium">Swatches</h2>
          <div className="grid gap-3 dark:hidden">
            {lightSwatchRows.map((row, rowIndex) => (
              <div key={`light-row-${rowIndex}`} className="grid gap-3 md:grid-cols-2">
                {row.map((swatch) => (
                  <div
                    key={`light-${swatch.label}`}
                    className="min-h-24 rounded-md border p-6 text-2xl font-medium"
                    style={{
                      backgroundColor: `var(--${swatch.backgroundToken})`,
                      color: `var(--${swatch.textToken})`,
                    }}
                  >
                    {swatch.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="hidden gap-3 dark:grid">
            {darkSwatchRows.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="grid gap-3 md:grid-cols-2">
                {row.map((swatch) => (
                  <div
                    key={`dark-${swatch.label}`}
                    className="min-h-24 rounded-md border p-6 text-2xl font-medium"
                    style={{
                      backgroundColor: `var(--${swatch.backgroundToken})`,
                      color: `var(--${swatch.textToken})`,
                    }}
                  >
                    {swatch.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-lg border p-6 md:grid-cols-2">
          <div className="space-y-3" style={{ fontFamily: "var(--font-sans)" }}>
            <p className="text-xs uppercase text-muted-foreground">Body font</p>
            <p className="text-3xl font-semibold">{getFontDisplayName(resolved.font)}</p>
            <p className="text-base">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
            </p>
            <p className="text-sm text-muted-foreground">
              !?@&£$¥%(){}[]:;,.+-=/\*&quot;&apos;
            </p>
          </div>

          <div className="space-y-3" style={{ fontFamily: "var(--font-heading)" }}>
            <p className="text-xs uppercase text-muted-foreground">Heading font</p>
            <p className="text-5xl font-semibold">
              {getFontDisplayName(headingFont)}
            </p>
            <h3 className="text-4xl font-semibold">Preset Typography</h3>
            <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
          </div>
        </section>
      </main>
    </>
  )
}

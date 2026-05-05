"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/poc/ui/card"

import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
} from "@/components/ui/card"

import { PresetFontLoader } from "@/components/preset-font-loader"
import { PresetThemeSurface } from "@/components/preset-theme-surface"
import { effectiveHeadingFont, resolvePresetFromCode } from "@/lib/preset"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"
import { ObservabilityCard } from "@/components/preset-swatch/components/cards/observability-card"
import { PreviewAnalyticsCard } from "@/components/preset-swatch/components/cards/preview-analytics-card"
import {
  PreviewIconGrid,
  PreviewIconGridLg,
} from "@/components/preset-swatch/components/cards/icon-preview-grid"
import {
  StyleOverview,
  StyleOverviewMinimal,
} from "@/components/preset-swatch/components/cards/style-overview"
import { TypographySpecimenCard } from "@/components/preset-swatch/components/cards/typography-specimen"
import { cn } from "@/lib/utils"
import { TypographySpecimen } from "@/components/preset-swatch/components/typography-specimen"
import { FeedbackForm } from "@/components/preset-swatch/components/cards/feedback-form"
import { SavingsProgress } from "@/components/preset-swatch/components/cards/savings-progress"
import { ClaimableBalance } from "@/components/preset-swatch/components/cards/claimable-balance"
import { PieChartCard } from "@/components/preset-swatch/components/cards/pie-chart-card"
import { UIElements } from "@/components/preset-swatch/components/cards/ui-elements"

type PresetCard1StyleOverviewProps = {
  initialCode: string
  className?: string
}

/**
 * Like `PresetCard1`, with a v4-style stack: `TypographySpecimenCard`, {@link StyleOverview}
 * (title + token grid), {@link PreviewIconGrid}, {@link PreviewAnalyticsCard}, and {@link ObservabilityCard}. Still decodes
 * a preset, applies `buildRegistryTheme`, and composes v4-style preview blocks (no iframe).
 *
 * Spacing uses `@container` so gaps track the **preview surface width** (e.g. the fixed
 * layout width under `transform: scale`), not the viewport.
 */
export function PresetCard1StyleOverview({
  initialCode,
  className,
}: PresetCard1StyleOverviewProps) {
  const { resolvedTheme } = useTheme()

  const resolved = React.useMemo(
    () => resolvePresetFromCode(initialCode),
    [initialCode]
  )
  const mode = resolvedTheme === "dark" ? "dark" : "light"

  const theme = React.useMemo(() => {
    if (!resolved) {
      return null
    }
    return buildRegistryTheme({
      ...DEFAULT_CONFIG,
      baseColor: resolved.baseColor,
      theme: resolved.theme,
      chartColor: resolved.effectiveChartColor,
      menuAccent: resolved.menuAccent,
      menuColor: resolved.menuColor,
      radius: resolved.effectiveRadius,
    })
  }, [resolved])

  const fontValues = React.useMemo(() => {
    if (!resolved) {
      return [] as string[]
    }
    return [
      resolved.font,
      effectiveHeadingFont(resolved.font, resolved.fontHeading),
    ]
  }, [resolved])

  if (!resolved || !theme) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardHeader>
          <CardTitle className="text-base">Invalid preset</CardTitle>
          <CardDescription>Could not decode this code.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className={cn("@container", className)}>
      <PresetFontLoader fontValues={fontValues} />
      <PresetThemeSurface
        registryTheme={theme}
        surfaceMode={mode}
        bodyFont={resolved.font}
        headingFont={resolved.fontHeading}
        styleName={resolved.style}
      >
        <ShadcnCard className="bg-muted pt-0 [--gap:--spacing(3)] @md:[--gap:--spacing(4)] @3xl:[--gap:--spacing(6)] dark:bg-background style-lyra:@md:[--gap:--spacing(2)] style-mira:@md:[--gap:--spacing(2)]">
          <ShadcnCardContent className="grid grid-cols-[1fr_2fr] items-start gap-(--gap) bg-muted p-(--gap)">
            <div className="flex flex-col gap-(--gap)">
              <StyleOverviewMinimal />
              <PreviewIconGridLg iconLibrary={resolved.iconLibrary} />
              <TypographySpecimenCard
                font={resolved.font}
                fontHeading={resolved.fontHeading}
              />
            </div>
            <div className="flex flex-col gap-(--gap)">
              <div className="grid grid-cols-2 items-start gap-(--gap)">
                <div className="grid gap-(--gap)">
                  <div className="grid grid-cols-2 content-start gap-(--gap)">
                    <TypographySpecimen type="body" font={resolved.font} />
                    <TypographySpecimen
                      type="heading"
                      font={effectiveHeadingFont(
                        resolved.font,
                        resolved.fontHeading
                      )}
                    />
                  </div>
                  <ObservabilityCard iconLibrary={resolved.iconLibrary} />
                  <FeedbackForm />
                </div>

                <div className="grid gap-(--gap)">
                  <UIElements />

                  <PieChartCard />
                </div>
              </div>
            </div>
          </ShadcnCardContent>
        </ShadcnCard>
      </PresetThemeSurface>
    </div>
  )
}

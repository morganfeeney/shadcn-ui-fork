"use client"

import * as React from "react"
import type { PresetConfig } from "shadcn/preset"

import { Card, CardContent } from "@/components/poc/ui/card"
import { getFontDisplayName } from "@/lib/preset"
import { STYLES } from "@/registry/styles"
import { StyleOverviewTokenGrid } from "@/components/preset-swatch/components/cards/style-overview-tokens"

function toTitleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export type StyleOverviewProps = Pick<
  PresetConfig,
  "style" | "font" | "fontHeading"
>

/**
 * Port of v4 `registry/bases/radix/blocks/preview/cards/style-overview.tsx`, using
 * preset props instead of `useDesignSystemSearchParams`. Composes {@link StyleOverviewTokenGrid}
 * in the same card. Pair with {@link PreviewIconGrid} in the parent for the full column.
 */
export function StyleOverview({
  style,
  font,
  fontHeading,
}: StyleOverviewProps) {
  const currentStyle = React.useMemo(
    () => STYLES.find((s) => s.name === style),
    [style]
  )

  const styleTitle = currentStyle?.title ?? toTitleCase(style)

  const bodyDisplayName = getFontDisplayName(font)
  const headingDisplayName =
    fontHeading === "inherit" ? undefined : getFontDisplayName(fontHeading)

  const nameAfterDash =
    headingDisplayName && headingDisplayName !== bodyDisplayName
      ? headingDisplayName
      : bodyDisplayName

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 style-lyra:gap-4 style-mira:gap-4">
        <div className="flex flex-col gap-1">
          <div className="cn-font-heading text-2xl font-medium style-lyra:text-lg style-mira:text-lg style-sera:text-lg style-sera:font-semibold style-sera:tracking-wide style-sera:uppercase">
            {styleTitle} - {nameAfterDash}
          </div>
          <div className="line-clamp-2 text-base text-muted-foreground style-lyra:text-sm style-mira:text-sm style-sera:text-sm style-sera:leading-relaxed">
            Designers love packing quirky glyphs into test phrases. This is a
            preview of the typography styles.
          </div>
        </div>
        <StyleOverviewTokenGrid />
      </CardContent>
    </Card>
  )
}

export function StyleOverviewMinimal() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6 style-lyra:gap-4 style-mira:gap-4">
        <StyleOverviewTokenGrid />
      </CardContent>
    </Card>
  )
}

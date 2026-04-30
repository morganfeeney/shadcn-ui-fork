"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/poc/ui/card"

import { getFontDisplayName } from "@/lib/preset"

export type TypographySpecimenCardProps = {
  /** Body / UI font token (e.g. from decoded preset). */
  font: string
  /** Heading font token or `"inherit"`. */
  fontHeading: string
}

/**
 * Port of v4 `registry/bases/radix/blocks/preview/cards/typography-specimen.tsx`,
 * with `font` / `fontHeading` passed in instead of create URL search params.
 */
export function TypographySpecimenCard({
  font,
  fontHeading,
}: TypographySpecimenCardProps) {
  const bodyLabel = getFontDisplayName(font)

  const headingLabel = React.useMemo(() => {
    if (fontHeading === "inherit") {
      return "Inherit"
    }
    const headingName = getFontDisplayName(fontHeading)
    return headingName !== bodyLabel ? headingName : "Inherit"
  }, [bodyLabel, fontHeading])

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="text-xs font-medium text-muted-foreground uppercase">
          {headingLabel} - {bodyLabel}
        </div>
        <p className="cn-font-heading text-2xl font-medium style-sera:text-lg style-sera:font-semibold style-sera:tracking-wider style-sera:uppercase">
          Designing with rhythm and hierarchy.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A strong body style keeps long-form content readable and balances the
          visual weight of headings.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thoughtful spacing and cadence help paragraphs scan quickly without
          feeling dense.
        </p>
      </CardContent>
    </Card>
  )
}

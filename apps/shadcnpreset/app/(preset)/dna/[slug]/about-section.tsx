"use client"

import type { ResolvedPreset } from "@/lib/preset"
import { getFontDisplayName } from "@/lib/preset"

type DnaAboutSectionProps = {
  resolved: ResolvedPreset
  headingFont: string
}

function toTitle(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 text-base">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="leading-tight text-foreground">{value}</dd>
    </div>
  )
}

export function DnaAboutSection({
  resolved,
  headingFont,
}: DnaAboutSectionProps) {
  return (
    <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
      <Detail label="Style" value={toTitle(resolved.style)} />
      <Detail label="Heading font" value={getFontDisplayName(headingFont)} />
      <Detail label="Base" value={toTitle(resolved.baseColor)} />
      <Detail label="Icons" value={toTitle(resolved.iconLibrary)} />
      <Detail label="Theme" value={toTitle(resolved.theme)} />
      <Detail label="Radius" value={toTitle(resolved.effectiveRadius)} />
      <Detail
        label="Chart color"
        value={toTitle(resolved.effectiveChartColor)}
      />
      <Detail label="Menu color" value={toTitle(resolved.menuColor)} />
      <Detail label="Body font" value={getFontDisplayName(resolved.font)} />
      <Detail label="Menu accent" value={toTitle(resolved.menuAccent)} />
    </dl>
  )
}

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
    <div className="grid gap-1 text-sm tracking-tight">
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
    <dl className="grid items-start gap-x-4 gap-y-8 md:grid-cols-12">
      <div className="grid gap-x-6 gap-y-8 sm:col-span-2">
        <Detail label="Style" value={toTitle(resolved.style)} />
      </div>
      <div className="grid gap-x-6 gap-y-8 sm:col-span-2">
        <Detail label="Base" value={toTitle(resolved.baseColor)} />
        <Detail label="Theme" value={toTitle(resolved.theme)} />
        <Detail
          label="Chart color"
          value={toTitle(resolved.effectiveChartColor)}
        />
      </div>
      <div className="grid gap-x-6 gap-y-8 sm:col-span-2">
        <Detail label="Heading font" value={getFontDisplayName(headingFont)} />
        <Detail label="Body font" value={getFontDisplayName(resolved.font)} />
      </div>
      <div className="grid gap-x-6 gap-y-8 sm:col-span-2">
        <Detail label="Icons" value={toTitle(resolved.iconLibrary)} />
        <Detail label="Radius" value={toTitle(resolved.effectiveRadius)} />
      </div>
      <div className="grid gap-x-6 gap-y-8 sm:col-span-2">
        <Detail label="Menu color" value={toTitle(resolved.menuColor)} />
        <Detail label="Menu accent" value={toTitle(resolved.menuAccent)} />
      </div>
    </dl>
  )
}

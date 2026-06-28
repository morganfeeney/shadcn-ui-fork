"use client"

import type { ResolvedPreset } from "@/lib/preset"
import { getFontDisplayName } from "@/lib/preset"
import { PropsWithChildren } from "react"

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
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="leading-tight text-foreground">{value}</dd>
    </>
  )
}

function DetailColumn({ children }: PropsWithChildren) {
  return (
    <div className="grid content-start text-sm tracking-tight sm:col-span-2 [&>dd]:mt-1 [&>dd+dt]:mt-6">
      {children}
    </div>
  )
}

export function DnaAboutSection({
  resolved,
  headingFont,
}: DnaAboutSectionProps) {
  return (
    <dl className="grid items-start gap-x-4 gap-y-8 md:grid-cols-12">
      <DetailColumn>
        <Detail label="Style" value={toTitle(resolved.style)} />
      </DetailColumn>
      <DetailColumn>
        <Detail label="Base" value={toTitle(resolved.baseColor)} />
        <Detail label="Theme" value={toTitle(resolved.theme)} />
        <Detail
          label="Chart color"
          value={toTitle(resolved.effectiveChartColor)}
        />
      </DetailColumn>
      <DetailColumn>
        <Detail label="Heading font" value={getFontDisplayName(headingFont)} />
        <Detail label="Body font" value={getFontDisplayName(resolved.font)} />
      </DetailColumn>
      <DetailColumn>
        <Detail label="Icons" value={toTitle(resolved.iconLibrary)} />
        <Detail label="Radius" value={toTitle(resolved.effectiveRadius)} />
      </DetailColumn>
      <DetailColumn>
        <Detail label="Menu color" value={toTitle(resolved.menuColor)} />
        <Detail label="Menu accent" value={toTitle(resolved.menuAccent)} />
      </DetailColumn>
    </dl>
  )
}

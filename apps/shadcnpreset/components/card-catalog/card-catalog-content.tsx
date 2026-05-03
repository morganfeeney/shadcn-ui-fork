"use client"

import type { ReactNode } from "react"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"

export type CardCatalogSample = {
  code: string
  title: string
  description: string
}

function CatalogSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <h2 className="cn-font-heading text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  )
}

export function CardCatalogContent({
  samples,
}: {
  samples: CardCatalogSample[]
}) {
  return (
    <div className="grid gap-16">
      <CatalogSection
        title="Preset style overview card"
        description="Same card as the home carousel and community feed: inline style overview (no iframe), preview overlay, votes, and dialog."
      >
        <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <li>
            <PresetStyleOverviewCard
              code={samples[0].code}
              title={samples[0].title}
              description={samples[0].description}
            />
          </li>
        </ul>
      </CatalogSection>
    </div>
  )
}

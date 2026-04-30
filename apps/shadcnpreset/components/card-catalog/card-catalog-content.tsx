"use client"

import type { ReactNode } from "react"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { PresetStyleOverviewCard2 } from "@/components/preset-style-overview-card-2"
import { PresetCard1 } from "@/components/preset-swatch/components/preset-card-1"

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
        description="Community-style grid card: theme swatch, typography, icons, and observability blocks rendered inline (no iframe). Used on the community feed, assistant results, and home carousel."
      >
        <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <li>
            <PresetCard1 initialCode={samples[0].code} />
          </li>
        </ul>
      </CatalogSection>
      <CatalogSection
        title="Preset style overview card"
        description="Community-style grid card: theme swatch, typography, icons, and observability blocks rendered inline (no iframe). Used on the community feed, assistant results, and home carousel."
      >
        <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <li>
            <PresetStyleOverviewCard2
              code={samples[0].code}
              title={samples[0].title}
              description={samples[0].description}
            />
          </li>
        </ul>
      </CatalogSection>
      <CatalogSection
        title="Preset style overview card"
        description="Community-style grid card: theme swatch, typography, icons, and observability blocks rendered inline (no iframe). Used on the community feed, assistant results, and home carousel."
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

import type { Metadata } from "next"

import {
  CardCatalogContent,
  type CardCatalogSample,
} from "@/components/card-catalog/card-catalog-content"
import { getHomepageFeed } from "@/lib/preset-feed"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import type { PresetPageItem } from "@/lib/preset-catalog"
import { siteConfig } from "@/lib/config"

const CATALOG_SAMPLE_COUNT = 4

export const metadata: Metadata = {
  title: "Card catalog",
  description: "Reference layouts for preset cards and related UI patterns.",
  openGraph: {
    title: `Card catalog | ${siteConfig.name}`,
    description: "Reference layouts for preset cards and related UI patterns.",
    url: "/card-catalog",
    siteName: siteConfig.name,
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: `Card catalog | ${siteConfig.name}`,
    description: "Reference layouts for preset cards and related UI patterns.",
    images: [],
  },
}

function toCatalogSample(item: PresetPageItem): CardCatalogSample {
  return {
    code: item.code,
    title: item.code,
    description: formatPresetCardDescription(item.config),
  }
}

export default async function CardCatalogPage() {
  const feedItems = await getHomepageFeed(CATALOG_SAMPLE_COUNT * 2)
  const samples = feedItems.slice(0, CATALOG_SAMPLE_COUNT).map(toCatalogSample)

  return (
    <main className="grid gap-4">
      <CardCatalogContent samples={samples} />
    </main>
  )
}

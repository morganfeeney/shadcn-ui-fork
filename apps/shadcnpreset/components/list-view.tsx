"use client"

import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { usePresetFeed } from "@/hooks/use-preset-feed"
import { type ListViewItem, toListViewItem } from "@/lib/list-view"
import type { PresetPageItem } from "@/lib/preset-catalog"

interface ListViewProps {
  items: ListViewItem[]
  safePage?: number
  totalPages?: number
  pageSize?: number
  useLiveFeed?: boolean
  initialFeedItems?: PresetPageItem[]
}

function formatTypographyLine(fontHeading: string, font: string) {
  if (fontHeading === "inherit" || fontHeading === font) {
    return `${font} font`
  }
  return `${fontHeading} & ${font} fonts`
}

export function ListView({
  items,
  safePage = 1,
  totalPages = 1,
  pageSize = 15,
  useLiveFeed = true,
  initialFeedItems = [],
}: ListViewProps) {
  const feedQuery = usePresetFeed(
    safePage,
    pageSize,
    useLiveFeed
      ? {
          items: initialFeedItems,
          safePage,
          totalPages,
        }
      : undefined,
    useLiveFeed
  )
  const feedItems = useLiveFeed
    ? (feedQuery.data?.items ?? initialFeedItems).map(toListViewItem)
    : items

  return (
    <section>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))] gap-6">
        {feedItems.map((item) => (
          <li key={item.code}>
            <PresetStyleOverviewCard
              code={item.code}
              title={item.code}
              description={`${item.style} style, ${item.baseColor} base, ${item.theme} theme, ${item.chartColor} charts, ${item.iconLibrary}, ${formatTypographyLine(item.fontHeading, item.font)}`}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

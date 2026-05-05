"use client"

import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { Button } from "@/components/ui/button"
import { usePresetFeed } from "@/hooks/use-preset-feed"
import { trackEvent } from "@/lib/analytics-events"
import type { PresetPageItem } from "@/lib/preset-catalog"

export type ListViewItem = {
  code: string
  baseColor: string
  theme: string
  chartColor: string
  iconLibrary: string
  font: string
  fontHeading: string
}

interface ListViewProps {
  items: ListViewItem[]
  safePage?: number
  totalPages?: number
  pageSize?: number
  useLiveFeed?: boolean
  initialFeedItems?: PresetPageItem[]
  useIncrementalReveal?: boolean
  initialVisibleCount?: number
  visibleStep?: number
}

function toListViewItem(item: PresetPageItem): ListViewItem {
  return {
    code: item.code,
    baseColor: item.config.baseColor,
    theme: item.config.theme,
    chartColor: item.config.chartColor ?? item.config.theme,
    iconLibrary: item.config.iconLibrary,
    font: item.config.font,
    fontHeading: item.config.fontHeading,
  }
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
  pageSize = 24,
  useLiveFeed = true,
  initialFeedItems = [],
  useIncrementalReveal = false,
  initialVisibleCount = 12,
  visibleStep = 6,
}: ListViewProps) {
  const pathname = usePathname()
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
  const [visibleCount, setVisibleCount] = useState(
    useIncrementalReveal ? initialVisibleCount : feedItems.length
  )

  const visibleItems = useMemo(
    () => feedItems.slice(0, Math.min(feedItems.length, visibleCount)),
    [feedItems, visibleCount]
  )
  const hasMore = visibleItems.length < feedItems.length

  function loadMore() {
    trackEvent("feed_load_more", {
      page_path: pathname,
      batch_size: visibleStep,
    })
    setVisibleCount((current) =>
      Math.min(feedItems.length, current + visibleStep)
    )
  }

  return (
    <section>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(500px,1fr))] gap-6 gap-y-4">
        {visibleItems.map((item) => (
          <li key={item.code}>
            <PresetStyleOverviewCard
              code={item.code}
              title={item.code}
              description={`${item.baseColor} base, ${item.theme} theme, ${item.chartColor} charts, ${item.iconLibrary}, ${formatTypographyLine(item.fontHeading, item.font)}`}
            />
          </li>
        ))}
      </ul>
      {hasMore && useIncrementalReveal ? (
        <div className="flex justify-center py-6">
          <Button type="button" variant="outline" onClick={loadMore}>
            Load more
          </Button>
        </div>
      ) : null}
    </section>
  )
}

"use client"

import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { usePresetFeed } from "@/hooks/use-preset-feed"
import { usePresetVoteMapsForItems } from "@/hooks/use-preset-votes-batch"
import { type ListViewItem, toListViewItem } from "@/lib/list-view"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import type { PresetPageItem } from "@/lib/preset-catalog"

interface ListViewProps {
  items: ListViewItem[]
  safePage?: number
  totalPages?: number
  pageSize?: number
  useLiveFeed?: boolean
  initialFeedItems?: PresetPageItem[]
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
  const { votesByCode, hasVotedByCode } = usePresetVoteMapsForItems(feedItems)

  return (
    <section>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))] gap-6">
        {feedItems.map((item) => (
          <li key={item.code}>
            <PresetStyleOverviewCard
              code={item.code}
              title={item.code}
              description={formatPresetCardDescription(item)}
              initialVoteCount={votesByCode[item.code] ?? 0}
              initialHasVoted={hasVotedByCode[item.code] ?? false}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

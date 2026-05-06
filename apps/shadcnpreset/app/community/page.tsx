import { ListView } from "@/components/list-view"
import { toListViewItem } from "@/lib/list-view"
import { getVotedPresetsFeed } from "@/lib/preset-feed"

export const dynamic = "force-dynamic"
export const revalidate = 0

const COMMUNITY_FEED_LIMIT = 100

export default async function CommunityPage() {
  const feedItems = await getVotedPresetsFeed(COMMUNITY_FEED_LIMIT)
  const items = feedItems.map(toListViewItem)
  const feedKey = items.map((item) => item.code).join(":")

  return (
    <main className="grid gap-4 px-safe">
      <ListView
        key={feedKey}
        items={items}
        useLiveFeed={false}
        safePage={1}
        totalPages={1}
      />
    </main>
  )
}

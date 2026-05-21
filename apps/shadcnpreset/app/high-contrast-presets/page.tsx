import { Suspense } from "react"
import { cacheLife } from "next/cache"
import { AccessiblePresetsExplorer } from "@/components/accessible-presets-explorer"
import { toListViewItem } from "@/lib/list-view"
import { getHighContrastPresetFeed } from "@/lib/accessible-presets"

export default async function AccessiblePresetsPage() {
  "use cache"
  cacheLife("max")

  const feedItems = getHighContrastPresetFeed()
  const items = feedItems.map(toListViewItem)

  return (
    <main className="flex min-h-0 flex-1 flex-col px-safe">
      <Suspense
        fallback={
          <p className="px-2 py-6 text-sm text-muted-foreground md:px-4">
            Loading…
          </p>
        }
      >
        <AccessiblePresetsExplorer items={items} />
      </Suspense>
    </main>
  )
}

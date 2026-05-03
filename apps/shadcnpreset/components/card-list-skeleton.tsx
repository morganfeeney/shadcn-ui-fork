import { Card, CardFooter } from "@/components/ui/card"
import {
  HomePresetRail,
  HomePresetRailItem,
  HomePresetRailViewport,
} from "@/components/ui/home-preset-rail"
import { Skeleton } from "@/components/ui/skeleton"

function PresetCardSkeleton() {
  return (
    <Card className="gap-0 pt-0">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "700 / 600" }}
      >
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <CardFooter className="justify-between">
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-8 w-14" />
      </CardFooter>
    </Card>
  )
}

function CardSkeleton() {
  return (
    <li>
      <PresetCardSkeleton />
    </li>
  )
}

export function CardListSkeleton() {
  return (
    <main className="grid gap-4">
      <section className="space-y-4">
        <ul className="grid gap-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, index) => (
            <CardSkeleton key={`preset-skeleton-${index}`} />
          ))}
        </ul>
      </section>
    </main>
  )
}

/** Placeholder for the home preset rail — matches the mobile horizontal scroll-snap carousel only. */
export function HomePresetCarouselSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <HomePresetRail aria-busy="true" className={className}>
      <HomePresetRailViewport
        aria-label="Loading featured presets"
        className="pb-2"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <HomePresetRailItem key={`carousel-mobile-skel-${index}`}>
            <PresetCardSkeleton />
          </HomePresetRailItem>
        ))}
      </HomePresetRailViewport>
    </HomePresetRail>
  )
}

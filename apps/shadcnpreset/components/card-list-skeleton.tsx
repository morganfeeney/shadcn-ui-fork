import { Card, CardFooter } from "@/components/ui/card"
import {
  HomePresetRail,
  HomePresetRailItem,
  HomePresetRailViewport,
} from "@/components/ui/home-preset-rail"
import { Skeleton } from "@/components/ui/skeleton"

/** Preview area + footer shell aligned with `PresetStyleOverviewCard` (1400×700 virtual preview). */
function PresetCardSkeleton() {
  return (
    <Card className="relative gap-0 rounded-sm bg-background pt-0 ring-0">
      <div className="pointer-events-none relative flex flex-col">
        <div
          className="relative w-full overflow-hidden rounded-sm border"
          style={{ aspectRatio: "1400 / 700" }}
        >
          <Skeleton className="absolute inset-0 rounded-none" />
        </div>
        <CardFooter className="grid justify-items-start gap-0.5 border-0 bg-background px-2 pt-2 pb-0">
          <div className="flex w-full flex-col gap-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 max-w-[min(100%,20rem)]" />
          </div>
          {/*<Skeleton className="-ml-2.5 h-9 w-14 shrink-0 rounded-full" />*/}
        </CardFooter>
      </div>
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

/** Placeholder for the home preset rail — matches `HomePresetCarousel` / `PresetStyleOverviewCard` sizing. */
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

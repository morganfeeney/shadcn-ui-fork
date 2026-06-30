"use client"

import { useCallback, useMemo, useRef, type KeyboardEvent } from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  type Icon,
} from "@phosphor-icons/react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  HomePresetRail,
  HomePresetRailItem,
  HomePresetRailViewport,
} from "@/components/ui/home-preset-rail"
import { usePresetVoteMapsForItems } from "@/hooks/use-preset-votes-batch"
import { buildPreviewStepOrder } from "@/components/preset-preview/step"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { useHorizontalSnapRailNav } from "@/hooks/use-horizontal-snap-rail-nav"
import { useLgAndUp } from "@/hooks/use-lg-and-up"
import { cn } from "@/lib/utils"

interface HomePresetCarouselItem {
  code: string
  title: string
  description: string
}

const FEATURED_PRESETS_VIEWPORT_ID = "home-featured-presets-carousel"

export function HomeHeroButtons() {
  return (
    <div className="flex gap-2">
      <Link href="/assistant" className={buttonVariants({ size: "lg" })}>
        Ask AI <ArrowRightIcon className="size-4" weight="bold" />
      </Link>
      <Link
        href="/community"
        className={buttonVariants({ variant: "secondary", size: "lg" })}
      >
        Browse Community
      </Link>
    </div>
  )
}

export function HomePresetCarousel({
  items,
  className,
}: {
  items: HomePresetCarouselItem[]
  className?: string
}) {
  const multi = items.length > 1
  const lg = useLgAndUp()
  const showOverlayNav = multi && lg
  const viewportRef = useRef<HTMLDivElement>(null)
  const { sync, canScrollPrev, canScrollNext, scrollPrev, scrollNext } =
    useHorizontalSnapRailNav(viewportRef, showOverlayNav)

  const onViewportKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.repeat) return
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return

      const rtl =
        typeof document !== "undefined" &&
        document.documentElement.dir === "rtl"

      let towardPrevious = !rtl && e.key === "ArrowLeft"
      let towardNext = !rtl && e.key === "ArrowRight"
      if (rtl) {
        towardPrevious = e.key === "ArrowRight"
        towardNext = e.key === "ArrowLeft"
      }

      e.preventDefault()
      if (towardPrevious) scrollPrev()
      else if (towardNext) scrollNext()
    },
    [scrollPrev, scrollNext]
  )

  const previewStepOrder = useMemo(() => buildPreviewStepOrder(items), [items])
  const { votesByCode, hasVotedByCode } = usePresetVoteMapsForItems(items)

  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn("relative isolate w-full max-w-full", className)}>
      <HomePresetRail className="relative z-1">
        <HomePresetRailViewport
          ref={viewportRef}
          id={FEATURED_PRESETS_VIEWPORT_ID}
          onScroll={sync}
          aria-roledescription="carousel"
          tabIndex={multi ? 0 : undefined}
          onKeyDown={multi ? onViewportKeyDown : undefined}
          className={
            multi
              ? "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              : undefined
          }
        >
          {items.map((item) => (
            <HomePresetRailItem key={item.code}>
              <PresetStyleOverviewCard
                code={item.code}
                title={item.title}
                description={item.description}
                previewStepOrder={previewStepOrder}
                initialVoteCount={votesByCode[item.code] ?? 0}
                initialHasVoted={hasVotedByCode[item.code] ?? false}
              />
            </HomePresetRailItem>
          ))}
        </HomePresetRailViewport>
      </HomePresetRail>

      {showOverlayNav && canScrollPrev ? (
        <>
          <RailEdgeFade side="leading" />
          <CarouselRailNavButton
            label="Previous featured preset"
            viewportId={FEATURED_PRESETS_VIEWPORT_ID}
            Icon={CaretLeftIcon}
            onPress={scrollPrev}
            className="absolute top-1/2 left-4 z-50 -translate-y-1/2"
          />
        </>
      ) : null}
      {showOverlayNav && canScrollNext ? (
        <>
          <RailEdgeFade side="trailing" />
          <CarouselRailNavButton
            label="Next featured preset"
            viewportId={FEATURED_PRESETS_VIEWPORT_ID}
            Icon={CaretRightIcon}
            onPress={scrollNext}
            className="absolute top-1/2 right-4 z-50 -translate-y-1/2"
          />
        </>
      ) : null}
    </div>
  )
}

function RailEdgeFade({ side }: { side: "leading" | "trailing" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-auto absolute inset-y-0 z-40 w-[min(6.5rem,22vw)] md:w-28",
        side === "leading"
          ? "left-0 bg-linear-to-r from-background to-transparent"
          : "right-0 bg-linear-to-l from-background to-transparent"
      )}
    />
  )
}

function CarouselRailNavButton({
  label,
  viewportId,
  Icon,
  disabled = false,
  onPress,
  className,
}: {
  label: string
  viewportId: string
  Icon: Icon
  disabled?: boolean
  onPress: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      size="icon"
      aria-label={label}
      aria-controls={viewportId}
      disabled={disabled}
      className={cn(
        "transition-none active:translate-y-[calc(-50%+1px)]!",
        className
      )}
      onClick={onPress}
    >
      <Icon className="size-4" weight="bold" />
    </Button>
  )
}

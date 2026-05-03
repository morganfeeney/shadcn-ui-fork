"use client"

import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import {
  HomePresetRail,
  HomePresetRailItem,
  HomePresetRailViewport,
} from "@/components/ui/home-preset-rail"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"

import type { HomePresetCarouselItem } from "./home-preset-carousel-types"

export type { HomePresetCarouselItem } from "./home-preset-carousel-types"

export function HomeHeroButtons() {
  return (
    <div className="flex gap-2">
      <Link href="/assistant" className={buttonVariants({ size: "lg" })}>
        Ask AI <ArrowRight />
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
  if (items.length === 0) {
    return null
  }

  return (
    <HomePresetRail className={className}>
      <HomePresetRailViewport>
        {items.map((item) => (
          <HomePresetRailItem key={item.code}>
            <PresetStyleOverviewCard
              code={item.code}
              title={item.title}
              description={item.description}
            />
          </HomePresetRailItem>
        ))}
      </HomePresetRailViewport>
    </HomePresetRail>
  )
}

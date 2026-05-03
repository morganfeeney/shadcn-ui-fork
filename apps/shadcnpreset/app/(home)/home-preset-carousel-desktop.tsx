"use client"

/**
 * 3D perspective carousel with infinite scroll snap.
 * Not used on the homepage by default — import `HomePresetCarouselDesktop` when you want this variant.
 */

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"

import { cn } from "@/lib/utils"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"

const CARD_WIDTH = 420
const SIDE_OFFSET = 168
const MAX_VISIBLE_DISTANCE = 3
const LOOP_MULTIPLIER = 7

function toWrappedIndex(index: number, total: number) {
  if (total === 0) return 0
  return ((index % total) + total) % total
}

function getWrappedDistance(index: number, activeIndex: number, total: number) {
  if (total <= 1) return 0
  const raw = index - activeIndex
  const half = total / 2
  if (raw > half) return raw - total
  if (raw < -half) return raw + total
  return raw
}

function getCardStyle(distanceFromActive: number): CSSProperties {
  const absDistance = Math.abs(distanceFromActive)
  const direction =
    distanceFromActive === 0 ? 0 : distanceFromActive > 0 ? 1 : -1
  const limitedDistance = Math.min(absDistance, 4)
  const translateX = direction * limitedDistance * SIDE_OFFSET
  const rotateY = direction * Math.min(absDistance * 10, 28)
  const scale = absDistance === 0 ? 1 : Math.max(0.78, 1 - absDistance * 0.07)
  const opacity = Math.max(0.18, 1 - absDistance * 0.22)

  return {
    width: CARD_WIDTH,
    top: "50%",
    left: "50%",
    zIndex: 100 - absDistance,
    opacity,
    transform: `translate3d(calc(-50% + ${translateX}px), -50%, ${-limitedDistance * 60}px) rotateY(${rotateY}deg) scale(${scale})`,
  }
}

interface HomePresetCarouselItem {
  code: string
  title: string
  description: string
}

export function HomePresetCarouselDesktop({
  items,
  className,
}: {
  items: HomePresetCarouselItem[]
  className?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const [activeVirtualIndex, setActiveVirtualIndex] = useState(() =>
    items.length > 0
      ? Math.floor(LOOP_MULTIPLIER / 2) * items.length +
        Math.floor(items.length / 2)
      : 0
  )
  const totalSlots = items.length * LOOP_MULTIPLIER
  const centerBlockStart = Math.floor(LOOP_MULTIPLIER / 2) * items.length
  const activeIndex = toWrappedIndex(activeVirtualIndex, items.length)
  const snapSlots = useMemo(
    () => Array.from({ length: totalSlots }, (_, slotIndex) => slotIndex),
    [totalSlots]
  )

  const spacerStyle = useMemo(
    () => ({ minWidth: `calc(50% - ${CARD_WIDTH / 2}px)` }),
    []
  )

  function handleScroll() {
    const node = scrollRef.current
    if (!node || items.length === 0) return
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      const nextVirtualIndex = Math.round(node.scrollLeft / CARD_WIDTH)
      const recenteredVirtualIndex =
        nextVirtualIndex < items.length ||
        nextVirtualIndex >= totalSlots - items.length
          ? centerBlockStart + toWrappedIndex(nextVirtualIndex, items.length)
          : nextVirtualIndex
      if (recenteredVirtualIndex !== nextVirtualIndex) {
        node.scrollLeft = recenteredVirtualIndex * CARD_WIDTH
      }
      setActiveVirtualIndex((current) =>
        current === recenteredVirtualIndex ? current : recenteredVirtualIndex
      )
      rafRef.current = null
    })
  }

  function scrollToIndex(nextVirtualIndex: number) {
    const node = scrollRef.current
    if (!node || items.length === 0) return
    const safeIndex = Math.max(0, Math.min(totalSlots - 1, nextVirtualIndex))
    node.scrollTo({
      left: safeIndex * CARD_WIDTH,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    const node = scrollRef.current
    if (!node || items.length === 0) return
    const startingIndex =
      Math.floor(LOOP_MULTIPLIER / 2) * items.length +
      Math.floor(items.length / 2)
    node.scrollLeft = startingIndex * CARD_WIDTH
  }, [items.length])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn("w-full max-w-full", className)}>
      <div
        className="relative mx-auto flex min-h-130 max-w-full items-center justify-center overflow-hidden lg:min-h-145"
        style={{ perspective: "1050px" }}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="carousel-scroll scrollbar-none absolute inset-0 z-[35] flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="shrink-0" style={spacerStyle} />
          {snapSlots.map((slotIndex) => (
            <div
              key={`snap-${slotIndex}`}
              className="h-full shrink-0 snap-center"
              aria-hidden="true"
              style={{ width: CARD_WIDTH }}
            />
          ))}
          <div className="shrink-0" style={spacerStyle} />
        </div>

        {items.map((item, index) => {
          const distance = getWrappedDistance(index, activeIndex, items.length)
          if (Math.abs(distance) > MAX_VISIBLE_DISTANCE) {
            return null
          }
          const isActive = distance === 0
          return (
            <div
              key={item.code}
              data-card-index={index}
              aria-hidden={!isActive}
              className={cn(
                "carousel-card absolute transition-[transform,opacity] duration-250 ease-out will-change-transform",
                isActive ? "z-50" : "z-40 cursor-pointer"
              )}
              style={getCardStyle(distance)}
            >
              <div
                className={cn(
                  "h-full",
                  isActive ? "pointer-events-auto" : "pointer-events-none"
                )}
              >
                <PresetStyleOverviewCard
                  code={item.code}
                  title={item.title}
                  description={item.description}
                />
              </div>
            </div>
          )
        })}

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute left-2 z-[60] size-9 rounded-full"
          aria-label="Previous preset"
          onClick={() => scrollToIndex(activeVirtualIndex - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-2 z-[60] size-9 rounded-full"
          aria-label="Next preset"
          onClick={() => scrollToIndex(activeVirtualIndex + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

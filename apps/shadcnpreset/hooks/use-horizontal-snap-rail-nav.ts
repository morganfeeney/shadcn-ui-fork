"use client"

import { useCallback, useLayoutEffect, useState, type RefObject } from "react"

const FIRST_ITEM_SELECTOR = '[data-slot="home-preset-rail-item"]'
/** Ignore sub-pixel jitter at scroll rest */
const EDGE_SLACK_PX = 2
/** Step when first card is not measurable yet */
const FALLBACK_SCROLL_STEP_PX = 400

function scrollStepPx(viewport: HTMLElement) {
  const card = viewport.querySelector(FIRST_ITEM_SELECTOR) as HTMLElement | null
  const { gap, columnGap } = getComputedStyle(viewport)
  const gapPx = Number.parseFloat(gap || columnGap || "16") || 16
  return card ? card.offsetWidth + gapPx : FALLBACK_SCROLL_STEP_PX
}

function overflowGates(vp: HTMLElement) {
  const { scrollLeft, scrollWidth, clientWidth } = vp
  const maxLeft = scrollWidth - clientWidth
  return {
    prev: scrollLeft > EDGE_SLACK_PX,
    next: scrollLeft < maxLeft - EDGE_SLACK_PX,
  }
}

/** Prev/next scroll helpers for a horizontal snap rail (`viewportRef` is owned by the caller). */
export function useHorizontalSnapRailNav(
  viewportRef: RefObject<HTMLDivElement | null>,
  enabled: boolean
) {
  const [gates, setGates] = useState({ prev: false, next: false })

  const sync = useCallback(() => {
    if (!enabled) return
    const el = viewportRef.current
    if (!el) return
    const step = overflowGates(el)
    setGates((prev) =>
      prev.prev === step.prev && prev.next === step.next ? prev : step
    )
  }, [viewportRef, enabled])

  const scrollPrev = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    el.scrollBy({
      left: -scrollStepPx(el),
      behavior: "smooth",
    })
  }, [viewportRef])

  const scrollNext = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    el.scrollBy({
      left: scrollStepPx(el),
      behavior: "smooth",
    })
  }, [viewportRef])

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el || !enabled) return

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled, sync, viewportRef])

  return {
    sync,
    canScrollPrev: gates.prev,
    canScrollNext: gates.next,
    scrollPrev,
    scrollNext,
  } as const
}

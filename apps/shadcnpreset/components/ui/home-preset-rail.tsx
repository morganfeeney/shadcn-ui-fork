import * as React from "react"

import { cn } from "@/lib/utils"

function HomePresetRail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="home-preset-rail"
      className={cn("w-full max-w-full", className)}
      {...props}
    />
  )
}

function HomePresetRailViewport({
  className,
  ref,
  "aria-label": ariaLabel = "Featured presets",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      role="list"
      data-slot="home-preset-rail-viewport"
      aria-label={ariaLabel}
      className={cn(
        "flex snap-x snap-mandatory scrollbar-none gap-2 overflow-x-auto overscroll-x-contain lg:gap-4",
        "scrollbar-none [&::-webkit-scrollbar]:hidden",
        className
      )}
      {...props}
    />
  )
}

function HomePresetRailItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="listitem"
      data-slot="home-preset-rail-item"
      className={cn(
        "w-[85vw] max-w-[60vw] shrink-0 snap-center md:max-w-70 lg:max-w-120",
        className
      )}
      {...props}
    />
  )
}

export { HomePresetRail, HomePresetRailItem, HomePresetRailViewport }

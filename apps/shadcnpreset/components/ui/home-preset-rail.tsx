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
  "aria-label": ariaLabel = "Featured presets",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="home-preset-rail-viewport"
      aria-label={ariaLabel}
      className={cn(
        "scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
        "w-[85vw] max-w-88 shrink-0 snap-center sm:max-w-120",
        className
      )}
      {...props}
    />
  )
}

export { HomePresetRail, HomePresetRailItem, HomePresetRailViewport }

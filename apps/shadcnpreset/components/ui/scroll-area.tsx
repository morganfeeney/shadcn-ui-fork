"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Lightweight scroll container (native overflow). Use for horizontal rails etc.
 * Optional `ScrollBar` is a no-op for API compatibility with shadcn blocks.
 */
function ScrollArea({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="scroll-area"
      className={cn(
        "relative overflow-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]",
        className
      )}
      {...props}
    />
  )
}

function ScrollBar({
  className,
  orientation: _orientation,
}: {
  className?: string
  orientation?: "horizontal" | "vertical"
}) {
  void className
  return null
}

export { ScrollArea, ScrollBar }

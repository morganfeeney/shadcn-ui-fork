"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "cn-separator shrink-0 bg-border data-horizontal:cn-separator-horizontal data-vertical:cn-separator-vertical",
        className
      )}
      {...props}
    />
  )
}

export { Separator }

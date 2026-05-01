"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("cn-label flex items-center gap-2", className)}
      {...props}
    />
  )
}

export { Label }

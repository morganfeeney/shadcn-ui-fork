import * as React from "react"

import { cn } from "@/lib/utils"

function ToolCard({ className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="tool-card"
      className={cn("grid gap-5 bg-muted p-6", className)}
      {...props}
    />
  )
}

function ToolCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tool-card-header"
      className={cn("grid gap-2 self-start", className)}
      {...props}
    />
  )
}

function ToolCardTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="tool-card-title"
      className={cn("text-lg font-display text-foreground", className)}
      {...props}
    />
  )
}

function ToolCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="tool-card-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToolCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tool-card-footer"
      className={cn("self-end justify-self-start", className)}
      {...props}
    />
  )
}

export {
  ToolCard,
  ToolCardDescription,
  ToolCardFooter,
  ToolCardHeader,
  ToolCardTitle,
}

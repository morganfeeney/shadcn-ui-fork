import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as React from "react"

import { cn } from "@/lib/utils"

type ToolCardProps = useRender.ComponentProps<"div"> &
  React.ComponentProps<"div">

function ToolCard({ className, render, ...props }: ToolCardProps) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "group/tool-card grid gap-5 bg-muted p-6 transition-colors outline-none",
          render &&
            "cursor-pointer focus-visible:ring-3 focus-visible:ring-ring hover:[&_[data-slot=tool-card-title]]:underline",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "tool-card",
    },
  })
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
      className={cn(
        "text-lg font-display text-foreground underline-offset-4",
        className
      )}
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
export type { ToolCardProps }

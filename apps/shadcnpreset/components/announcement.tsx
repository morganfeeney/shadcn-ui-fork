import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function AnnouncementTitle({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs leading-none font-semibold",
        className
      )}
    >
      {children}
    </span>
  )
}

export function Announcement({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  if (!children) {
    return (
      <Badge
        render={
          <Link href="/changelog">
            New Custom Color Pickers
            <ArrowRightIcon
              weight="bold"
              className="size-3.5 shrink-0"
              aria-hidden
            />
          </Link>
        }
        variant="secondary"
        className="bg-muted"
      />
    )
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-auto min-h-8 w-fit rounded-xl px-3 py-1.5 text-xs leading-snug font-medium whitespace-normal",
        className
      )}
    >
      {children}
    </Badge>
  )
}

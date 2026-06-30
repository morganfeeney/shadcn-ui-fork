"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

type RouteScopedProps = {
  scope: string
  children: React.ReactNode
}

/**
 * Remounts its subtree whenever pathname changes so local UI state
 * does not leak across history entries.
 */
export function RouteScoped({ scope, children }: RouteScopedProps) {
  const pathname = usePathname()

  return <React.Fragment key={`${pathname}:${scope}`}>{children}</React.Fragment>
}

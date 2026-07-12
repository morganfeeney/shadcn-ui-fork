import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { Icons } from "@/components/icons"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton"

export function GitHubLink() {
  return (
    <Button asChild size="sm" variant="ghost" className="h-8 shadow-none">
      <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
        <Icons.gitHub />
        <React.Suspense fallback={<Skeleton className="h-4 w-[42px]" />}>
          <StarsCount />
        </React.Suspense>
      </Link>
    </Button>
  )
}

async function getFormattedStarCount() {
  try {
    const data = await fetch("https://api.github.com/repos/shadcn-ui/ui", {
      next: { revalidate: 86400 },
    })

    if (!data.ok) {
      return null
    }

    const json = await data.json()
    const count = json.stargazers_count

    if (typeof count !== "number") {
      return null
    }

    return count >= 1000
      ? `${Math.round(count / 1000)}k`
      : count.toLocaleString()
  } catch {
    return null
  }
}

export async function StarsCount() {
  const formattedCount = await getFormattedStarCount()

  if (!formattedCount) {
    return null
  }

  return (
    <span className="w-fit text-xs text-muted-foreground tabular-nums">
      {formattedCount}
    </span>
  )
}

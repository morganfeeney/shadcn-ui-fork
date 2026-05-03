"use client"

import type { ReactNode } from "react"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Announcement } from "@/components/announcement"
import { siteConfig } from "@/lib/config"

type HomeHeroProps = {
  /** Search field; wrap `PresetForm` in `<Suspense>` in a Server Component parent. */
  children?: ReactNode
}

export function HomeHero({ children }: HomeHeroProps) {
  return (
    <PageHeader>
      <Announcement />
      <PageHeaderHeading className="max-w-4xl">
        {siteConfig.title}
      </PageHeaderHeading>
      <PageHeaderDescription className="text-muted-foreground">
        {siteConfig.description}
      </PageHeaderDescription>
      {children ? (
        <div className="flex w-full max-w-2xl justify-center">{children}</div>
      ) : null}
    </PageHeader>
  )
}

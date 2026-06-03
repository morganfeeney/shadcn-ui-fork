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
      <PageHeaderHeading className="max-w-[15ch] text-balance lg:-mt-1">
        {siteConfig.title}
      </PageHeaderHeading>
      <PageHeaderDescription className="max-w-[60ch] text-balance lg:-mt-1">
        {siteConfig.description}
      </PageHeaderDescription>
      {children ? (
        <div className="mt-1 flex w-full max-w-2xl justify-center">
          {children}
        </div>
      ) : null}
    </PageHeader>
  )
}

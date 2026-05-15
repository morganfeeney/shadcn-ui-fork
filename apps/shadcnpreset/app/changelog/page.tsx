import type { Metadata } from "next"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Timeline2 } from "@/components/zippystarter/timeline2"
import { siteConfig } from "@/lib/config"
import { mdxDocumentationComponents } from "@/mdx-components"
import { MDXContent } from "@content-collections/mdx/react"
import { allChangelogs } from "content-collections"
import { format, parseISO } from "date-fns"

const CHANGELOG_PATH = "/changelog"
const CHANGELOG_TITLE = "Changelog"
const CHANGELOG_DESCRIPTION =
  "Product updates, new presets, and tooling changes for shadcnpreset."

export const metadata: Metadata = {
  title: CHANGELOG_TITLE,
  description: CHANGELOG_DESCRIPTION,
  openGraph: {
    title: `${CHANGELOG_TITLE} | ${siteConfig.name}`,
    description: CHANGELOG_DESCRIPTION,
    url: `${siteConfig.url}${CHANGELOG_PATH}`,
    siteName: siteConfig.name,
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: `${CHANGELOG_TITLE} | ${siteConfig.name}`,
    description: CHANGELOG_DESCRIPTION,
    images: [],
  },
}

const sortedEntries = [...allChangelogs]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .map((c) => ({
    id: c._meta.path,
    date: format(parseISO(String(c.date)), "dd MMM yyyy"),
    title: c.title,
    description: (
      <div className="grid gap-4">
        {c.description ? (
          <p className="text-muted-foreground">{c.description}</p>
        ) : null}
        <div className="[&>p:first-of-type]:mt-0 [&>ul:first-child]:mt-0">
          <MDXContent code={c.body} components={mdxDocumentationComponents} />
        </div>
      </div>
    ),
  }))

export default function ChangelogPage() {
  return (
    <div className="grid content-start items-start">
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">
          {CHANGELOG_TITLE}
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          {CHANGELOG_DESCRIPTION}
        </PageHeaderDescription>
      </PageHeader>
      <main>
        <div className="m-auto max-w-4xl">
          <Timeline2 items={sortedEntries} />
        </div>
      </main>
    </div>
  )
}

import type { Metadata } from "next"

import { ToolsList } from "@/components/tools-list"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { siteConfig } from "@/lib/config"
import { TOOLS, TOOLS_PAGE } from "@/app/tools/tools"
import { DefaultLayout } from "@/components/default-layout"

export const metadata: Metadata = {
  title: TOOLS_PAGE.title,
  description: TOOLS_PAGE.description,
  openGraph: {
    title: `${TOOLS_PAGE.title} | ${siteConfig.name}`,
    description: TOOLS_PAGE.description,
    url: TOOLS_PAGE.href,
    siteName: siteConfig.name,
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: `${TOOLS_PAGE.title} | ${siteConfig.name}`,
    description: TOOLS_PAGE.description,
    images: [],
  },
}

export default function ToolsPage() {
  return (
    <DefaultLayout>
      <div className="grid content-start items-start">
        <PageHeader>
          <PageHeaderHeading className="max-w-4xl">
            {TOOLS_PAGE.title}
          </PageHeaderHeading>
          <PageHeaderDescription className="text-muted-foreground">
            {TOOLS_PAGE.description}
          </PageHeaderDescription>
        </PageHeader>
        <main className="grid gap-4">
          <ToolsList
            tools={TOOLS.map((tool) => ({
              href: tool.href,
              title: tool.title,
              description: tool.cardDescription,
            }))}
          />
        </main>
      </div>
    </DefaultLayout>
  )
}

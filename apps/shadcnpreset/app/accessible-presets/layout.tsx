import type { Metadata } from "next"
import Link from "next/link"
import { PropsWithChildren } from "react"
import { WideLayout } from "@/components/wide-layout"
import { siteConfig } from "@/lib/config"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

const pageDescription =
  "Browse shadcn/ui theme presets that pass WCAG 2.x AA contrast on evaluated token pairs in both light and dark mode—filtered and paginated like Community."

export const metadata: Metadata = {
  title: "High-contrast presets",
  description: pageDescription,
  alternates: {
    canonical: "/accessible-presets",
  },
  openGraph: {
    title: `High-contrast presets | ${siteConfig.name}`,
    description: pageDescription,
    url: "/accessible-presets",
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage, alt: `High-contrast presets | ${siteConfig.name}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `High-contrast presets | ${siteConfig.name}`,
    description: pageDescription,
    images: [siteConfig.ogImage],
  },
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <WideLayout>
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">
          High-contrast presets
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          Presets where light and dark both score 100% on the{" "}
          <Link
            href="/tools/color-contrast-checker"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            token contrast checker
          </Link>{" "}
          (WCAG 2.x AA normal text for all evaluated pairs). Same card layout as
          Community.
        </PageHeaderDescription>
      </PageHeader>
      <div className="grid min-h-0 flex-1 flex-col [--accessible-sidebar-top:7rem] md:[--accessible-sidebar-top:8rem]">
        {children}
      </div>
    </WideLayout>
  )
}

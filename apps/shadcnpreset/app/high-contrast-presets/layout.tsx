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
  "Browse shadcn/ui theme presets that pass WCAG 2.x AA contrast in both light and dark mode."

export const metadata: Metadata = {
  title: "High-contrast presets",
  description: pageDescription,
  openGraph: {
    title: `High-contrast presets | ${siteConfig.name}`,
    description: pageDescription,
    url: "/high-contrast-presets",
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        alt: `High-contrast presets | ${siteConfig.name}`,
      },
    ],
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
          Presets that score 100% for{" "}
          <Link
            href="/tools/color-contrast-checker"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            color contrast
          </Link>{" "}
          (WCAG 2.x AA normal text).
        </PageHeaderDescription>
      </PageHeader>
      <div className="grid min-h-0 flex-1 flex-col [--accessible-sidebar-top:7rem] md:[--accessible-sidebar-top:8rem]">
        {children}
      </div>
    </WideLayout>
  )
}

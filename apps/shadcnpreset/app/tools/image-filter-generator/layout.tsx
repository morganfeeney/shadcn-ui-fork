import type { Metadata } from "next"
import type { PropsWithChildren } from "react"

import { siteConfig } from "@/lib/config"
import { FIGMA_FILTER_CSS_TOOL } from "@/app/tools/tools"
import { DefaultLayout } from "@/components/default-layout"

export const metadata: Metadata = {
  title: FIGMA_FILTER_CSS_TOOL.title,
  description: FIGMA_FILTER_CSS_TOOL.description,
  openGraph: {
    title: `${FIGMA_FILTER_CSS_TOOL.title} | ${siteConfig.name}`,
    description: FIGMA_FILTER_CSS_TOOL.description,
    url: FIGMA_FILTER_CSS_TOOL.href,
    siteName: siteConfig.name,
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: `${FIGMA_FILTER_CSS_TOOL.title} | ${siteConfig.name}`,
    description: FIGMA_FILTER_CSS_TOOL.description,
    images: [],
  },
}

export default function FigmaImageFilterToCssLayout({
  children,
}: PropsWithChildren) {
  return <DefaultLayout>{children}</DefaultLayout>
}

import type { Metadata } from "next"
import type { PropsWithChildren } from "react"

import { siteConfig } from "@/lib/config"
import { PRESET_COLOR_CONTRAST_TOOL } from "@/app/tools/tools"

export const metadata: Metadata = {
  title: PRESET_COLOR_CONTRAST_TOOL.title,
  description: PRESET_COLOR_CONTRAST_TOOL.description,
  alternates: {
    canonical: PRESET_COLOR_CONTRAST_TOOL.href,
  },
  openGraph: {
    title: `${PRESET_COLOR_CONTRAST_TOOL.title} | ${siteConfig.name}`,
    description: PRESET_COLOR_CONTRAST_TOOL.description,
    url: PRESET_COLOR_CONTRAST_TOOL.href,
    siteName: siteConfig.name,
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: `${PRESET_COLOR_CONTRAST_TOOL.title} | ${siteConfig.name}`,
    description: PRESET_COLOR_CONTRAST_TOOL.description,
    images: [],
  },
}

export default function ColorContrastToolLayout({ children }: PropsWithChildren) {
  return children
}

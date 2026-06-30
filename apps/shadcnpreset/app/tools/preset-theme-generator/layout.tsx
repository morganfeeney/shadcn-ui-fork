import type { Metadata } from "next"
import { PropsWithChildren } from "react"

import { DefaultLayout } from "@/components/default-layout"
import { siteConfig } from "@/lib/config"
import { PRESET_THEME_GENERATOR_TOOL } from "@/app/tools/tools"

export const metadata: Metadata = {
  title: PRESET_THEME_GENERATOR_TOOL.title,
  description: PRESET_THEME_GENERATOR_TOOL.description,
  openGraph: {
    title: `${PRESET_THEME_GENERATOR_TOOL.title} | ${siteConfig.name}`,
    description: PRESET_THEME_GENERATOR_TOOL.description,
    url: PRESET_THEME_GENERATOR_TOOL.href,
    siteName: siteConfig.name,
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: `${PRESET_THEME_GENERATOR_TOOL.title} | ${siteConfig.name}`,
    description: PRESET_THEME_GENERATOR_TOOL.description,
    images: [],
  },
}

export default function PresetThemeGeneratorLayout({
  children,
}: PropsWithChildren) {
  return <DefaultLayout>{children}</DefaultLayout>
}

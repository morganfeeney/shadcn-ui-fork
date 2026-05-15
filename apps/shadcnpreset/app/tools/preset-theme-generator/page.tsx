import type { Metadata } from "next"
import { encodePreset } from "shadcn/preset"

import { PageHeader } from "@/components/page-header"
import { PresetThemeGeneratorHeader } from "@/components/preset-theme-generator-header"
import { PresetThemeExtractor } from "@/components/preset-theme-extractor"
import { siteConfig } from "@/lib/config"
import { PRESET_THEME_GENERATOR_TOOL } from "@/app/tools/tools"

type PresetThemeGeneratorPageProps = {
  searchParams: Promise<{
    code?: string
  }>
}

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

export default async function PresetThemeGeneratorPage({
  searchParams,
}: PresetThemeGeneratorPageProps) {
  const { code } = await searchParams
  const defaultCode = code?.trim() || encodePreset({})

  return (
    <>
      <PageHeader>
        <PresetThemeGeneratorHeader defaultCode={defaultCode} />
      </PageHeader>
      <main className="grid gap-4">
        <PresetThemeExtractor code={defaultCode} />
      </main>
    </>
  )
}

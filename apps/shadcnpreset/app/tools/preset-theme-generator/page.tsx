import { encodePreset } from "shadcn/preset"

import { PageHeader } from "@/components/page-header"
import { PresetThemeGeneratorHeader } from "@/components/preset-theme-generator-header"
import { PresetThemeExtractor } from "@/components/preset-theme-extractor"

type PresetThemeGeneratorPageProps = {
  searchParams: Promise<{
    code?: string
  }>
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

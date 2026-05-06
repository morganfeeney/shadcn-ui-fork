import { encodePreset } from "shadcn/preset"

import { PageHeader } from "@/components/page-header"
import {
  PresetColorContrastHeader,
  PresetColorContrastResults,
} from "@/components/preset-color-contrast-checker"
import { getPresetColorContrastReport } from "@/lib/preset-color-contrast-report"

type PageProps = {
  searchParams: Promise<{
    code?: string
  }>
}

export default async function PresetColorContrastPage({
  searchParams,
}: PageProps) {
  const { code } = await searchParams
  const defaultCode = code?.trim() || encodePreset({})
  const report = getPresetColorContrastReport(defaultCode)

  return (
    <>
      <PageHeader>
        <PresetColorContrastHeader defaultCode={defaultCode} />
      </PageHeader>
      <main className="grid gap-4">
        <PresetColorContrastResults report={report} />
      </main>
    </>
  )
}

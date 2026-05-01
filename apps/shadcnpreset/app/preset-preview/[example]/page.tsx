import { notFound } from "next/navigation"

import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import { isLocalPresetPreviewExample } from "@/lib/preset-preview"

import { PresetPreviewExampleShell } from "./preview-example-shell"

export default async function PresetPreviewExamplePage({
  params,
  searchParams,
}: {
  params: Promise<{ example: string }>
  searchParams: Promise<{ preset?: string }>
}) {
  const [{ example }, { preset: raw }] = await Promise.all([params, searchParams])
  if (!isLocalPresetPreviewExample(example)) {
    notFound()
  }

  const trimmed = raw?.trim() ?? ""
  const bundle = getPresetThemeCssBundle(trimmed)
  if (!bundle) {
    notFound()
  }

  const { combinedCss } = bundle
  const { code, style, baseColor } = bundle.resolved

  return (
    <PresetPreviewExampleShell
      example={example}
      presetCode={code}
      combinedCss={combinedCss}
      styleClass={`style-${style}`}
      baseColorClass={`base-color-${baseColor}`}
    />
  )
}

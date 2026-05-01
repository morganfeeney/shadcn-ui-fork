import { notFound } from "next/navigation"

import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import { isLocalPresetPreviewExample } from "@/lib/preset-preview"
import { cn } from "@/lib/utils"

import { PresetPreviewExampleShell } from "./preview-example-shell"

const PRESET_PREVIEW_THEME_STYLE_ID = "preset-preview-example-theme"

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
  const styleClass = `style-${style}`
  const baseColorClass = `base-color-${baseColor}`

  return (
    <div
      className={cn(
        "preset-preview-root min-h-svh",
        styleClass,
        baseColorClass
      )}
    >
      <style
        id={PRESET_PREVIEW_THEME_STYLE_ID}
        dangerouslySetInnerHTML={{ __html: combinedCss }}
      />
      <PresetPreviewExampleShell
        example={example}
        presetCode={code}
        bodyStyleClass={styleClass}
        bodyBaseColorClass={baseColorClass}
      />
    </div>
  )
}

import { notFound } from "next/navigation"

import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import { getPresetGoogleFontStylesheetHrefs } from "@/lib/preset-google-fonts"
import { isLocalPresetPreviewExample } from "@/lib/preset-preview"
import { effectiveHeadingFont } from "@/lib/preset"
import { cn } from "@/lib/utils"

import { PresetPreviewExampleShell } from "./preview-example-shell"

const PRESET_PREVIEW_THEME_STYLE_ID = "preset-preview-example-theme"

export default async function PresetPreviewExamplePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preset?: string }>
}) {
  const [{ slug }, { preset: raw }] = await Promise.all([params, searchParams])
  if (!isLocalPresetPreviewExample(slug)) {
    notFound()
  }

  const trimmed = raw?.trim() ?? ""
  const bundle = getPresetThemeCssBundle(trimmed)
  if (!bundle) {
    notFound()
  }

  const { combinedCss } = bundle
  const { code, style, baseColor, font, fontHeading } = bundle.resolved
  const styleClass = `style-${style}`
  const baseColorClass = `base-color-${baseColor}`
  const presetPreviewFontValues = [
    font,
    effectiveHeadingFont(font, fontHeading),
  ]
  const presetGoogleFontHrefs =
    getPresetGoogleFontStylesheetHrefs(presetPreviewFontValues)
  const fontReadyGateKey = presetGoogleFontHrefs.join("|")

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {presetGoogleFontHrefs.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
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
          slug={slug}
          presetCode={code}
          fontReadyGateKey={fontReadyGateKey}
          bodyStyleClass={styleClass}
          bodyBaseColorClass={baseColorClass}
        />
      </div>
    </>
  )
}

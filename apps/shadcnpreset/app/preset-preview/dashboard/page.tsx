import { notFound } from "next/navigation"

import { resolvePresetFromCode } from "@/lib/preset"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"

import { PresetPreviewDashboardShell } from "./dashboard-shell"

export default async function PresetPreviewDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>
}) {
  const { preset: raw } = await searchParams
  const trimmed = raw?.trim() ?? ""
  if (!resolvePresetFromCode(trimmed)) {
    notFound()
  }

  const bundle = getPresetThemeCssBundle(trimmed)
  if (!bundle) {
    notFound()
  }

  const { combinedCss } = bundle
  const { style, baseColor } = bundle.resolved

  return (
    <PresetPreviewDashboardShell
      combinedCss={combinedCss}
      styleClass={`style-${style}`}
      baseColorClass={`base-color-${baseColor}`}
    />
  )
}

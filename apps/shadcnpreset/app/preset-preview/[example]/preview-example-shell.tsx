"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import DashboardDemo from "@/components/shadcn-examples/dashboard"
import { PresetCard1StyleOverview } from "@/components/preset-swatch/components/preset-card-1-style-overview"
import { PresetCard2StyleOverview } from "@/components/preset-swatch/components/preset-card-2-style-overview"
import type { LocalPresetPreviewExample } from "@/lib/preset-preview"

const THEME_SYNC_MESSAGE_TYPE = "shadcnpreset:theme-mode"

type ThemeMode = "light" | "dark"

type ThemeModeMessage = {
  type: typeof THEME_SYNC_MESSAGE_TYPE
  mode: ThemeMode
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark"
}

function isThemeModeMessage(value: unknown): value is ThemeModeMessage {
  if (!value || typeof value !== "object") {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    candidate.type === THEME_SYNC_MESSAGE_TYPE && isThemeMode(candidate.mode)
  )
}

function ExampleView({
  example,
  presetCode,
}: {
  example: LocalPresetPreviewExample
  presetCode: string
}) {
  switch (example) {
    case "style-overview-1":
      return (
        <div className="bg-background p-4 md:p-6">
          <PresetCard1StyleOverview initialCode={presetCode} />
        </div>
      )
    case "style-overview-2":
      return (
        <div className="bg-background p-4 md:p-6">
          <PresetCard2StyleOverview initialCode={presetCode} />
        </div>
      )
    case "dashboard":
      return (
        <div className="bg-background min-h-svh text-foreground">
          <DashboardDemo />
        </div>
      )
    default:
      return null
  }
}

export function PresetPreviewExampleShell({
  example,
  presetCode,
}: {
  example: LocalPresetPreviewExample
  presetCode: string
}) {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isThemeModeMessage(event.data)) {
        return
      }
      setTheme(event.data.mode)
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [setTheme])

  return <ExampleView example={example} presetCode={presetCode} />
}

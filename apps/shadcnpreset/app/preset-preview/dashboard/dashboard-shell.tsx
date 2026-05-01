"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import DashboardDemo from "@/components/shadcn-examples/dashboard"

const THEME_STYLE_ELEMENT_ID = "preset-preview-dashboard-theme"
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

export function PresetPreviewDashboardShell({
  combinedCss,
  styleClass,
  baseColorClass,
}: {
  combinedCss: string
  styleClass: string
  baseColorClass: string
}) {
  const { setTheme } = useTheme()

  React.useLayoutEffect(() => {
    const body = document.body
    body.classList.add(styleClass, baseColorClass)

    let styleEl = document.getElementById(
      THEME_STYLE_ELEMENT_ID
    ) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = THEME_STYLE_ELEMENT_ID
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = combinedCss

    return () => {
      body.classList.remove(styleClass, baseColorClass)
      document.getElementById(THEME_STYLE_ELEMENT_ID)?.remove()
    }
  }, [combinedCss, styleClass, baseColorClass])

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

  return (
    <div className="bg-background min-h-svh text-foreground">
      <DashboardDemo />
    </div>
  )
}

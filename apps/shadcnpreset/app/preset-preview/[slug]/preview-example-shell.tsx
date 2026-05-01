"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import DashboardDemo from "@/components/shadcn-examples/dashboard"
import { Login02Demo } from "@/components/shadcn-examples/login-02"
import { Login04Demo } from "@/components/shadcn-examples/login-04"
import { Spinner } from "@/components/ui/spinner"
import type { LocalPresetPreviewExample } from "@/lib/preset-preview"

const THEME_SYNC_MESSAGE_TYPE = "shadcnpreset:theme-mode"
const FONT_READY_FALLBACK_MS = 5000

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
  slug,
  presetCode,
}: {
  slug: LocalPresetPreviewExample
  presetCode: string
}) {
  switch (slug) {
    case "dashboard":
      return (
        <div className="min-h-svh bg-background text-foreground">
          <DashboardDemo />
        </div>
      )
    case "login-02":
      return (
        <div className="min-h-svh bg-background text-foreground">
          <Login02Demo />
        </div>
      )
    case "login-04":
      return (
        <div className="min-h-svh bg-background text-foreground">
          <Login04Demo />
        </div>
      )
    default:
      return null
  }
}

export function PresetPreviewExampleShell({
  slug,
  presetCode,
  fontReadyGateKey,
  bodyStyleClass,
  bodyBaseColorClass,
}: {
  slug: LocalPresetPreviewExample
  presetCode: string
  /**
   * When non-empty, blocks the example until `document.fonts.ready` (or timeout),
   * matching v4 DesignSystemProvider + preset iframe behavior. Value should
   * change when the embedded Google font set changes.
   */
  fontReadyGateKey: string
  /** Mirror preset scope on `document.body` so portaled UI (e.g. Vaul drawer) still matches `.style-* .cn-*`. */
  bodyStyleClass: string
  bodyBaseColorClass: string
}) {
  const { setTheme } = useTheme()

  const [contentReady, setContentReady] = React.useState(
    () => fontReadyGateKey.length === 0
  )

  React.useLayoutEffect(() => {
    const body = document.body
    body.classList.add(bodyStyleClass, bodyBaseColorClass)
    return () => {
      body.classList.remove(bodyStyleClass, bodyBaseColorClass)
    }
  }, [bodyStyleClass, bodyBaseColorClass])

  React.useLayoutEffect(() => {
    if (fontReadyGateKey.length === 0) {
      setContentReady(true)
      return
    }

    setContentReady(false)
    let cancelled = false
    const fallbackId = window.setTimeout(() => {
      if (!cancelled) setContentReady(true)
    }, FONT_READY_FALLBACK_MS)

    void document.fonts.ready.then(() => {
      if (!cancelled) setContentReady(true)
    })

    return () => {
      cancelled = true
      window.clearTimeout(fallbackId)
    }
  }, [fontReadyGateKey])

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

  if (!contentReady) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  return <ExampleView slug={slug} presetCode={presetCode} />
}

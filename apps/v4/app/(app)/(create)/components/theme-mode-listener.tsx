"use client"

import * as React from "react"
import { useTheme } from "next-themes"

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

export function ThemeModeListener({
  relayToChildFrames = false,
}: {
  relayToChildFrames?: boolean
}) {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isThemeModeMessage(event.data)) {
        return
      }

      setTheme(event.data.mode)

      if (!relayToChildFrames) {
        return
      }

      const messageSource = event.source
      const frames = document.querySelectorAll("iframe")
      frames.forEach((frame) => {
        if (!frame.contentWindow || frame.contentWindow === messageSource) {
          return
        }

        frame.contentWindow.postMessage(event.data, "*")
      })
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [relayToChildFrames, setTheme])

  return null
}

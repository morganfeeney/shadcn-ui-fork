"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { usePresetPageLiveOptional } from "@/components/preset-page-live-context"
import { usePresetParentUrlSync } from "@/hooks/use-preset-parent-url-sync"

const THEME_SYNC_MESSAGE_TYPE = "shadcnpreset:theme-mode"

type ThemeMode = "light" | "dark"

type PresetV4FrameProps = {
  src: string
  title: string
  className?: string
} & Omit<
  React.ComponentPropsWithoutRef<"iframe">,
  "src" | "title" | "className" | "onLoad"
> & {
  onLoad?: React.ComponentPropsWithoutRef<"iframe">["onLoad"]
}

export function PresetV4Frame({
  src,
  title,
  className,
  onLoad,
  ...props
}: PresetV4FrameProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const hasLoadedRef = React.useRef(false)
  const live = usePresetPageLiveOptional()
  const { resolvedTheme } = useTheme()
  const retryTimersRef = React.useRef<number[]>([])

  usePresetParentUrlSync(iframeRef, live?.onPresetFromIframe)

  const targetOrigin = React.useMemo(() => {
    try {
      return new URL(src).origin
    } catch {
      return "*"
    }
  }, [src])

  const mode: ThemeMode = React.useMemo(
    () => (resolvedTheme === "dark" ? "dark" : "light"),
    [resolvedTheme]
  )

  const postThemeMode = React.useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow) {
      return
    }

    frameWindow.postMessage(
      {
        type: THEME_SYNC_MESSAGE_TYPE,
        mode,
      },
      targetOrigin
    )
  }, [mode, targetOrigin])

  const clearRetryTimers = React.useCallback(() => {
    retryTimersRef.current.forEach((id) => {
      window.clearTimeout(id)
    })
    retryTimersRef.current = []
  }, [])

  const postThemeModeWithRetry = React.useCallback(() => {
    clearRetryTimers()
    postThemeMode()

    // The iframe app can hydrate after load; resend for a short window to avoid races.
    retryTimersRef.current = [200, 800].map((delay) =>
      window.setTimeout(() => {
        postThemeMode()
      }, delay)
    )
  }, [clearRetryTimers, postThemeMode])

  React.useEffect(() => {
    if (!hasLoadedRef.current) {
      return
    }

    postThemeMode()
  }, [postThemeMode])

  React.useEffect(() => {
    return () => {
      clearRetryTimers()
      const frame = iframeRef.current
      if (frame) {
        // Encourage quicker memory reclamation on route changes/unmount.
        frame.src = "about:blank"
      }
    }
  }, [clearRetryTimers])

  return (
    <iframe
      ref={iframeRef}
      className={className}
      src={src}
      title={title}
      onLoad={(event) => {
        hasLoadedRef.current = true
        postThemeModeWithRetry()
        onLoad?.(event)
      }}
      {...props}
    />
  )
}

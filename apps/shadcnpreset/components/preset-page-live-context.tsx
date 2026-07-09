"use client"

import * as React from "react"
import { decodePreset, encodePreset } from "shadcn/preset"

import { syncPresetPageSocialMeta } from "@/lib/sync-preset-social-meta"

type PresetPageLiveContextValue = {
  livePresetCode: string
  /** Normalized preset string for vote/share APIs */
  canonicalPresetCode: string
  onPresetFromIframe: (preset: string) => void
}

const PresetPageLiveContext =
  React.createContext<PresetPageLiveContextValue | null>(null)

function normalizeCanonical(code: string): string {
  const decoded = decodePreset(code)
  return decoded ? encodePreset(decoded) : code
}

export function PresetPageLiveProvider({
  initialPresetCode,
  children,
}: {
  initialPresetCode: string
  children: React.ReactNode
}) {
  const [livePresetCode, setLivePresetCode] = React.useState(initialPresetCode)

  const canonicalPresetCode = React.useMemo(
    () => normalizeCanonical(livePresetCode),
    [livePresetCode]
  )

  const onPresetFromIframe = React.useCallback((preset: string) => {
    setLivePresetCode(preset)
    const path = `/preset/${encodeURIComponent(preset)}${window.location.search}`
    window.history.replaceState(window.history.state, "", path)
  }, [])

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      await syncPresetPageSocialMeta(livePresetCode)
      if (cancelled) {
        return
      }
    })()

    return () => {
      cancelled = true
    }
  }, [livePresetCode])

  const value = React.useMemo(
    () => ({
      livePresetCode,
      canonicalPresetCode,
      onPresetFromIframe,
    }),
    [livePresetCode, canonicalPresetCode, onPresetFromIframe]
  )

  return (
    <PresetPageLiveContext.Provider value={value}>
      {children}
    </PresetPageLiveContext.Provider>
  )
}

export function usePresetPageLiveOptional() {
  return React.useContext(PresetPageLiveContext)
}

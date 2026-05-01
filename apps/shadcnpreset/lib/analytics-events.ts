import { sendGAEvent } from "@next/third-parties/google"

import { siteConfig } from "@/lib/config"

function isGaEnabled(): boolean {
  if (typeof window === "undefined") return false
  if (process.env.NODE_ENV !== "production") return false
  if (!siteConfig.analytics.googleAnalyticsId) return false
  try {
    return window.self === window.top
  } catch {
    return false
  }
}

/** GA4 event parameters (snake_case keys). Undefined values are omitted. */
export type AnalyticsParams = Record<string, string | number | undefined>

/**
 * Send a GA4 custom event. No-op when analytics is disabled or in an iframe.
 *
 * @param name GA4 event name (e.g. `preset_preview`, `search_submit`).
 * @param params Optional key/value payload; omit keys you do not want sent.
 */
export function trackEvent(name: string, params?: AnalyticsParams): void {
  if (!isGaEnabled()) return
  const payload: Record<string, string | number> = {}
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        payload[key] = value
      }
    }
  }
  sendGAEvent("event", name, payload)
}

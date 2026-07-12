"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { useDesignSystemSearchParams } from "@/app/(app)/create/lib/search-params"

import { PRESET_CODE_SYNC_MESSAGE_TYPE } from "./constants"

/**
 * When /create is embedded (e.g. shadcnpreset /preset/[code] iframe), notify the
 * parent window whenever the preset code changes so the host URL can stay in sync.
 *
 * @see UPSTREAM.md (repo root) — run `pnpm verify:shadcnpreset-fork` after merging upstream.
 */
export function ShadcnpresetCreatePageIntegration() {
  const [params] = useDesignSystemSearchParams()
  const rawSearch = useSearchParams()
  const { preset } = params

  const isEmbedded =
    params.embed ||
    rawSearch.get("embed") === "1" ||
    rawSearch.get("embed") === "true"

  React.useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) {
      return
    }
    if (!isEmbedded || !preset) {
      return
    }

    window.parent.postMessage(
      {
        type: PRESET_CODE_SYNC_MESSAGE_TYPE,
        preset,
      },
      "*"
    )
  }, [isEmbedded, preset])

  return null
}

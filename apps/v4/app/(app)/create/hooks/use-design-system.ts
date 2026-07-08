"use client"

import * as React from "react"

import { buildCreateShareUrl } from "@/app/(app)/create/lib/custom-color-params"
import { getPresetCode } from "@/app/(app)/create/lib/preset-code"
import { useDesignSystemSearchParams } from "@/app/(app)/create/lib/search-params"

const CREATE_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Returns the canonical preset code derived from the current search params.
export function usePresetCode() {
  const [params] = useDesignSystemSearchParams()

  return getPresetCode(params)
}

export function useCreateShareUrl() {
  const [params] = useDesignSystemSearchParams()
  const presetCode = usePresetCode()

  return React.useMemo(
    () =>
      buildCreateShareUrl({
        origin: CREATE_ORIGIN,
        presetCode,
        params,
      }),
    [params, presetCode]
  )
}

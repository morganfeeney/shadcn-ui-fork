"use client"

import * as React from "react"

import { appendCustomColorSearchParams } from "@/app/(app)/create/lib/custom-color-params"
import { getPresetCode } from "@/app/(app)/create/lib/preset-code"
import {
  useDesignSystemSearchParams,
  type DesignSystemSearchParams,
} from "@/app/(app)/create/lib/search-params"

const PRESET_SHARE_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4010"

type PresetShareParams = Pick<
  DesignSystemSearchParams,
  "pointer" | "baseCustomColor" | "themeCustomColor" | "chartCustomColor"
>

function buildPresetShareUrl({
  origin,
  presetCode,
  params,
}: {
  origin: string
  presetCode: string
  params: PresetShareParams
}) {
  const searchParams = new URLSearchParams()

  if (params.pointer) {
    searchParams.set("pointer", "true")
  }

  appendCustomColorSearchParams(searchParams, params)

  const query = searchParams.toString()
  const path = `/preset/${encodeURIComponent(presetCode)}`

  return query ? `${origin}${path}?${query}` : `${origin}${path}`
}

export function useCreateShareUrl() {
  const [params] = useDesignSystemSearchParams()
  const presetCode = getPresetCode(params)

  return React.useMemo(
    () =>
      buildPresetShareUrl({
        origin: PRESET_SHARE_ORIGIN,
        presetCode,
        params: {
          pointer: params.pointer,
          baseCustomColor: params.baseCustomColor,
          themeCustomColor: params.themeCustomColor,
          chartCustomColor: params.chartCustomColor,
        },
      }),
    [
      params.baseCustomColor,
      params.chartCustomColor,
      params.pointer,
      params.themeCustomColor,
      presetCode,
    ]
  )
}

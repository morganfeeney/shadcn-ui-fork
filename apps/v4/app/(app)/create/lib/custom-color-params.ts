import type { Options } from "nuqs/server"

import type {
  BaseColorName,
  ChartColorName,
  ThemeName,
} from "@/registry/config"
import type { DesignSystemSearchParams } from "@/app/(app)/create/lib/search-params"

export const CUSTOM_COLOR_SET_OPTIONS = {
  history: "replace",
  shallow: true,
} satisfies Options

function isThemeLinkedToBase(previous: DesignSystemSearchParams) {
  return previous.theme === previous.baseColor
}

function isChartLinkedToBase(previous: DesignSystemSearchParams) {
  return previous.chartColor === previous.baseColor
}

export const CUSTOM_COLOR_PARAM_KEYS = [
  "baseCustomColor",
  "themeCustomColor",
  "chartCustomColor",
] as const satisfies ReadonlyArray<keyof DesignSystemSearchParams>

type CustomColorParams = Pick<
  DesignSystemSearchParams,
  (typeof CUSTOM_COLOR_PARAM_KEYS)[number]
>

export function hasCustomColorParams(params: CustomColorParams) {
  return CUSTOM_COLOR_PARAM_KEYS.some((key) => Boolean(params[key]))
}

export function clearCustomColorUpdates(): Partial<DesignSystemSearchParams> {
  return {
    baseCustomColor: "",
    themeCustomColor: "",
    chartCustomColor: "",
    custom: false,
  }
}

function resolveCustomFlag(
  previous: DesignSystemSearchParams,
  updates: Partial<DesignSystemSearchParams>
) {
  return hasCustomColorParams({ ...previous, ...updates })
}

export function buildBaseCustomColorUpdate(
  color: string,
  previous: DesignSystemSearchParams
): Partial<DesignSystemSearchParams> {
  return {
    baseCustomColor: color,
    ...(isThemeLinkedToBase(previous) ? { themeCustomColor: color } : {}),
    ...(isChartLinkedToBase(previous) ? { chartCustomColor: color } : {}),
    custom: true,
  }
}

export function buildThemeCustomColorUpdate(
  color: string
): Partial<DesignSystemSearchParams> {
  return {
    themeCustomColor: color,
    custom: true,
  }
}

export function buildChartCustomColorUpdate(
  color: string
): Partial<DesignSystemSearchParams> {
  return {
    chartCustomColor: color,
    custom: true,
  }
}

export function buildNamedBaseColorUpdate(
  value: BaseColorName,
  previous: DesignSystemSearchParams
): Partial<DesignSystemSearchParams> {
  const update = {
    baseColor: value,
    baseCustomColor: "",
    ...(isThemeLinkedToBase(previous)
      ? {
          theme: value as ThemeName,
          themeCustomColor: "",
        }
      : {}),
    ...(isChartLinkedToBase(previous)
      ? {
          chartColor: value as ChartColorName,
          chartCustomColor: "",
        }
      : {}),
  }

  return {
    ...update,
    custom: resolveCustomFlag(previous, update),
  }
}

export function buildNamedThemeUpdate(
  value: ThemeName,
  previous: DesignSystemSearchParams
): Partial<DesignSystemSearchParams> {
  const update = {
    theme: value,
    themeCustomColor: "",
  }

  return {
    ...update,
    custom: resolveCustomFlag(previous, update),
  }
}

export function buildNamedChartColorUpdate(
  value: ChartColorName,
  previous: DesignSystemSearchParams
): Partial<DesignSystemSearchParams> {
  const update = {
    chartColor: value,
    chartCustomColor: "",
  }

  return {
    ...update,
    custom: resolveCustomFlag(previous, update),
  }
}

export function applyCustomColorParamDefaults(
  params: Partial<DesignSystemSearchParams>
): Partial<DesignSystemSearchParams> {
  const normalized = { ...params }

  if ("theme" in normalized && !("themeCustomColor" in normalized)) {
    normalized.themeCustomColor = ""
  }

  if ("chartColor" in normalized && !("chartCustomColor" in normalized)) {
    normalized.chartCustomColor = ""
  }

  if ("baseColor" in normalized && !("baseCustomColor" in normalized)) {
    normalized.baseCustomColor = ""
  }

  return normalized
}

export function appendCustomColorSearchParams(
  searchParams: URLSearchParams,
  params: CustomColorParams
) {
  for (const key of CUSTOM_COLOR_PARAM_KEYS) {
    const value = params[key]
    if (value) {
      searchParams.set(key, value)
    }
  }
}

export function buildCreateShareUrl({
  origin,
  presetCode,
  params,
}: {
  origin: string
  presetCode: string
  params: Pick<DesignSystemSearchParams, "item" | "pointer"> & CustomColorParams
}) {
  const searchParams = new URLSearchParams({
    preset: presetCode,
    item: params.item,
  })

  if (params.pointer) {
    searchParams.set("pointer", "true")
  }

  appendCustomColorSearchParams(searchParams, params)

  return `${origin}/create?${searchParams.toString()}`
}

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
  return {
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
    custom: true,
  }
}

export function buildNamedThemeUpdate(
  value: ThemeName
): Partial<DesignSystemSearchParams> {
  return {
    theme: value,
    themeCustomColor: "",
    custom: true,
  }
}

export function buildNamedChartColorUpdate(
  value: ChartColorName
): Partial<DesignSystemSearchParams> {
  return {
    chartColor: value,
    chartCustomColor: "",
    custom: true,
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

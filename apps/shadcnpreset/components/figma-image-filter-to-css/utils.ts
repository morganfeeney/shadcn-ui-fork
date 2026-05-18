import type { ColorValue } from "chromakit-react"

import {
  FILTER_FIELD_BY_KEY,
  type FigmaFilterKey,
  type FigmaFilterState,
} from "@/components/figma-image-filter-to-css/config"

export function clampFilterValue(key: FigmaFilterKey, value: number) {
  const field = FILTER_FIELD_BY_KEY[key]
  if (Number.isNaN(value) || !Number.isFinite(value)) return field.min
  return Math.max(field.min, Math.min(field.max, value))
}

export function clampPercentage(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

function formatFilterAmount(value: number) {
  const rounded = Number.parseFloat(value.toFixed(3))
  return rounded.toString()
}

function toTailwindPercentUtility(name: string, value: number) {
  if (Number.isInteger(value)) {
    return `${name}-${value}`
  }

  return `${name}-[${formatFilterAmount(value)}%]`
}

export function formatFilterValue(key: FigmaFilterKey, value: number) {
  const field = FILTER_FIELD_BY_KEY[key]
  const clamped = clampFilterValue(key, value)
  return `${formatFilterAmount(clamped)}${field.unit}`
}

export function getDirectCssFunctions(filters: FigmaFilterState) {
  const functions: string[] = []

  if (filters.blur > 0) {
    functions.push(`blur(${formatFilterAmount(filters.blur)}px)`)
  }

  if (filters.brightness !== 100) {
    functions.push(`brightness(${formatFilterAmount(filters.brightness)}%)`)
  }

  if (filters.contrast !== 100) {
    functions.push(`contrast(${formatFilterAmount(filters.contrast)}%)`)
  }

  if (filters.grayscale > 0) {
    functions.push(`grayscale(${formatFilterAmount(filters.grayscale)}%)`)
  }

  if (filters.hueRotate > 0) {
    functions.push(`hue-rotate(${formatFilterAmount(filters.hueRotate)}deg)`)
  }

  if (filters.invert > 0) {
    functions.push(`invert(${formatFilterAmount(filters.invert)}%)`)
  }

  if (filters.opacity !== 100) {
    functions.push(`opacity(${formatFilterAmount(filters.opacity)}%)`)
  }

  if (filters.saturate !== 100) {
    functions.push(`saturate(${formatFilterAmount(filters.saturate)}%)`)
  }

  if (filters.sepia > 0) {
    functions.push(`sepia(${formatFilterAmount(filters.sepia)}%)`)
  }

  return functions
}

export function getTailwindUtilities(filters: FigmaFilterState) {
  const utilities: string[] = []

  if (filters.brightness !== 100) {
    utilities.push(toTailwindPercentUtility("brightness", filters.brightness))
  }

  if (filters.contrast !== 100) {
    utilities.push(toTailwindPercentUtility("contrast", filters.contrast))
  }

  if (filters.saturate !== 100) {
    utilities.push(toTailwindPercentUtility("saturate", filters.saturate))
  }

  if (filters.blur > 0) {
    utilities.push(`blur-[${formatFilterAmount(filters.blur)}px]`)
  }

  if (filters.grayscale > 0) {
    utilities.push(toTailwindPercentUtility("grayscale", filters.grayscale))
  }

  if (filters.hueRotate > 0) {
    utilities.push(`hue-rotate-[${formatFilterAmount(filters.hueRotate)}deg]`)
  }

  if (filters.invert > 0) {
    utilities.push(toTailwindPercentUtility("invert", filters.invert))
  }

  if (filters.sepia > 0) {
    utilities.push(toTailwindPercentUtility("sepia", filters.sepia))
  }

  return utilities.length > 0 ? ["filter", ...utilities] : []
}

export function toTailwindFilterArbitraryValue(filterValue: string) {
  return `[filter:${filterValue.replaceAll(" ", "_")}]`
}

export function formatOklchFromColorValue(color: ColorValue): string {
  const fallback = {
    l: 0.63,
    c: 0.21,
    h: 304,
    a: 1,
  }

  const oklch = color.oklch as
    | { L?: number; C?: number; H?: number; l?: number; c?: number; h?: number }
    | undefined
  const rawL = Number(oklch?.L ?? oklch?.l)
  const rawC = Number(oklch?.C ?? oklch?.c)
  const rawH = Number(oklch?.H ?? oklch?.h)
  const rawA = Number(color.rgba?.a)

  const l = Number.isFinite(rawL)
    ? Math.max(0, Math.min(rawL > 1 ? rawL / 100 : rawL, 1))
    : fallback.l
  const c = Number.isFinite(rawC) ? Math.max(0, rawC) : fallback.c
  const h = Number.isFinite(rawH) ? ((rawH % 360) + 360) % 360 : fallback.h
  const alpha = Number.isFinite(rawA) ? Math.max(0, Math.min(rawA, 1)) : fallback.a

  if (alpha < 0.999) {
    return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)} / ${alpha.toFixed(3)})`
  }

  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`
}

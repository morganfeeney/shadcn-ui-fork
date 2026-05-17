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

export function formatFilterValue(key: FigmaFilterKey, value: number) {
  const field = FILTER_FIELD_BY_KEY[key]
  const clamped = clampFilterValue(key, value)
  return `${formatFilterAmount(clamped)}${field.unit}`
}

export function getDirectCssFunctions(filters: FigmaFilterState) {
  return [
    `blur(${formatFilterAmount(filters.blur)}px)`,
    `brightness(${formatFilterAmount(filters.brightness)}%)`,
    `contrast(${formatFilterAmount(filters.contrast)}%)`,
    `grayscale(${formatFilterAmount(filters.grayscale)}%)`,
    `hue-rotate(${formatFilterAmount(filters.hueRotate)}deg)`,
    `invert(${formatFilterAmount(filters.invert)}%)`,
    `opacity(${formatFilterAmount(filters.opacity)}%)`,
    `saturate(${formatFilterAmount(filters.saturate)}%)`,
    `sepia(${formatFilterAmount(filters.sepia)}%)`,
  ]
}

export function getTailwindUtilities(filters: FigmaFilterState) {
  return [
    "filter",
    `blur-[${formatFilterAmount(filters.blur)}px]`,
    `brightness-[${formatFilterAmount(filters.brightness)}%]`,
    `contrast-[${formatFilterAmount(filters.contrast)}%]`,
    `grayscale-[${formatFilterAmount(filters.grayscale)}%]`,
    `hue-rotate-[${formatFilterAmount(filters.hueRotate)}deg]`,
    `invert-[${formatFilterAmount(filters.invert)}%]`,
    `opacity-[${formatFilterAmount(filters.opacity)}%]`,
    `saturate-[${formatFilterAmount(filters.saturate)}%]`,
    `sepia-[${formatFilterAmount(filters.sepia)}%]`,
  ]
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

  const rawL = Number(color.oklch?.l)
  const rawC = Number(color.oklch?.c)
  const rawH = Number(color.oklch?.h)
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

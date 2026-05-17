import type { ColorValue } from "chromakit-react"

import type { FigmaFilterState } from "@/components/figma-image-filter-to-css/config"

export function clampFigmaValue(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.max(-1, Math.min(1, value))
}

export function clampPercentage(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

export function formatFigmaValue(value: number) {
  return clampFigmaValue(value).toFixed(2)
}

function formatFilterAmount(value: number) {
  const rounded = Number.parseFloat(value.toFixed(3))
  return rounded.toString()
}

function toCssMultiplier(value: number) {
  return Math.max(0, 1 + clampFigmaValue(value))
}

export function getDirectCssFunctions(filters: FigmaFilterState) {
  return [
    `brightness(${formatFilterAmount(toCssMultiplier(filters.exposure))})`,
    `contrast(${formatFilterAmount(toCssMultiplier(filters.contrast))})`,
    `saturate(${formatFilterAmount(toCssMultiplier(filters.saturation))})`,
  ]
}

export function getTailwindUtilities(filters: FigmaFilterState) {
  return [
    "filter",
    `brightness-[${formatFilterAmount(toCssMultiplier(filters.exposure))}]`,
    `contrast-[${formatFilterAmount(toCssMultiplier(filters.contrast))}]`,
    `saturate-[${formatFilterAmount(toCssMultiplier(filters.saturation))}]`,
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

"use client"

import * as React from "react"
import { useColorState } from "chromakit-react"

import {
  DEFAULT_FILTERS,
  DEFAULT_IMAGE_URL,
  TAILWIND_PALETTE,
  type FigmaFilterKey,
  type FigmaFilterState,
  type FilterPreset,
  type OverlaySource,
} from "@/components/figma-image-filter-to-css/config"
import {
  clampFilterValue,
  clampPercentage,
  formatOklchFromColorValue,
  getDirectCssFunctions,
  getTailwindUtilities,
} from "@/components/figma-image-filter-to-css/utils"

export function useFigmaImageFilterTool() {
  const defaultContainerClassName = "relative aspect-square"
  const defaultImageExtraClasses = ""
  const defaultOverlayBlendClassName = "mix-blend-color"
  const defaultOverlayOpacity = 25

  const [filters, setFilters] = React.useState<FigmaFilterState>(DEFAULT_FILTERS)
  const [imageUrl, setImageUrl] = React.useState(DEFAULT_IMAGE_URL)
  const [activePresetId, setActivePresetId] = React.useState("")
  const [includeOverlay, setIncludeOverlay] = React.useState(false)
  const [overlaySource, setOverlaySource] = React.useState<OverlaySource>("custom")
  const [overlayTailwindClassName, setOverlayTailwindClassName] = React.useState("bg-purple-700")
  const [overlayOklchColor, setOverlayOklchColor] = React.useState("oklch(0.63 0.21 304)")
  const { hsva, colorValue, updateColor } = useColorState(overlayOklchColor)

  React.useEffect(() => {
    setOverlaySource("custom")
    setOverlayOklchColor(formatOklchFromColorValue(colorValue))
  }, [colorValue])

  const selectedOverlaySwatch = React.useMemo(
    () =>
      TAILWIND_PALETTE.find((swatch) => swatch.className === overlayTailwindClassName) ??
      TAILWIND_PALETTE[0],
    [overlayTailwindClassName]
  )

  const directCssFunctions = React.useMemo(() => getDirectCssFunctions(filters), [filters])

  const cssFilterValue = React.useMemo(
    () => (directCssFunctions.length > 0 ? directCssFunctions.join(" ") : "none"),
    [directCssFunctions]
  )

  const tailwindClasses = React.useMemo(() => getTailwindUtilities(filters), [filters])

  const overlayColorClassName = React.useMemo(
    () =>
      overlaySource === "tailwind"
        ? overlayTailwindClassName
        : `bg-[${overlayOklchColor.replaceAll(" ", "_")}]`,
    [overlayOklchColor, overlaySource, overlayTailwindClassName]
  )

  const overlayPreviewColor =
    overlaySource === "tailwind" ? selectedOverlaySwatch.color : overlayOklchColor

  const mergedImageClassName = React.useMemo(
    () =>
      [tailwindClasses.join(" "), defaultImageExtraClasses]
        .filter(Boolean)
        .join(" "),
    [tailwindClasses]
  )

  const tailwindImageSnippet = React.useMemo(() => {
    const containerOutputClassName =
      defaultContainerClassName
        .replace(/\baspect-[^\s]+\b/g, "")
        .trim() || "relative"
    const overlayOpacityClass = `opacity-${Math.round(clampPercentage(defaultOverlayOpacity))}`
    if (includeOverlay) {
      const overlayContainerClassName = `${containerOutputClassName} aspect-square`.trim()
      const imageOutputClassName = [
        "absolute inset-0 h-full w-full object-cover",
        mergedImageClassName,
      ]
        .filter(Boolean)
        .join(" ")

      return `<!-- Wrapper needs width/height or aspect-ratio for absolute overlay/image fill. -->
<div class="${overlayContainerClassName}">
  <div class="absolute inset-0 z-30 ${overlayColorClassName} ${overlayOpacityClass} ${defaultOverlayBlendClassName}"></div>
  <img
    class="${imageOutputClassName}"
    src="${imageUrl}"
    alt=""
  />
</div>`
    }

    const imageOutputClassName = ["h-full w-full object-cover", mergedImageClassName]
      .filter(Boolean)
      .join(" ")

    return `<img
  class="${imageOutputClassName}"
  src="${imageUrl}"
  alt=""
/>`
  }, [
    defaultContainerClassName,
    defaultOverlayBlendClassName,
    defaultOverlayOpacity,
    imageUrl,
    includeOverlay,
    mergedImageClassName,
    overlayColorClassName,
  ])

  const cssImageSnippet = React.useMemo(() => {
    const containerOutputClassName =
      defaultContainerClassName
        .replace(/\baspect-[^\s]+\b/g, "")
        .trim() || "relative"
    const overlayBlendMode = defaultOverlayBlendClassName.replace("mix-blend-", "")
    const imageBaseClassName = includeOverlay
      ? "absolute inset-0 h-full w-full object-cover"
      : "h-full w-full object-cover"

    if (includeOverlay) {
      const overlayContainerClassName = `${containerOutputClassName} aspect-square`.trim()

      return `<!-- Wrapper needs width/height or aspect-ratio for absolute overlay/image fill. -->
<div class="${overlayContainerClassName}">
  <div style="position: absolute; inset: 0; z-index: 30; background-color: ${overlayPreviewColor}; opacity: ${defaultOverlayOpacity / 100}; mix-blend-mode: ${overlayBlendMode};"></div>
  <img
    class="${imageBaseClassName}"
    src="${imageUrl}"
    alt=""
    style="filter: ${cssFilterValue};"
  />
</div>`
    }

    return `<img
  class="${imageBaseClassName}"
  src="${imageUrl}"
  alt=""
  style="filter: ${cssFilterValue};"
/>`
  }, [
    cssFilterValue,
    defaultContainerClassName,
    defaultOverlayBlendClassName,
    defaultOverlayOpacity,
    imageUrl,
    includeOverlay,
    overlayPreviewColor,
  ])

  function updateFilter(key: FigmaFilterKey, nextValue: number) {
    setActivePresetId("custom")
    setFilters((current) => ({ ...current, [key]: clampFilterValue(key, nextValue) }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
    setActivePresetId("")
  }

  function applyPreset(preset: FilterPreset) {
    setFilters({ ...DEFAULT_FILTERS, ...preset.values })
    setActivePresetId(preset.id)
  }

  function setIncludeOverlayWithDefaults(next: boolean) {
    setIncludeOverlay(next)

    if (!next) return

    setActivePresetId("custom")
    setFilters((current) => ({ ...current, grayscale: 100 }))
  }

  return {
    filters,
    imageUrl,
    activePresetId,
    includeOverlay,
    defaultContainerClassName,
    overlaySource,
    overlayTailwindClassName,
    overlayOklchColor,
    defaultOverlayBlendClassName,
    defaultOverlayOpacity,
    defaultImageExtraClasses,
    hsva,
    updateColor,
    selectedOverlaySwatch,
    tailwindPalette: TAILWIND_PALETTE,
    cssFilterValue,
    overlayColorClassName,
    overlayPreviewColor,
    tailwindImageSnippet,
    cssImageSnippet,
    updateFilter,
    resetFilters,
    applyPreset,
    setImageUrl,
    setIncludeOverlay: setIncludeOverlayWithDefaults,
    setOverlaySource,
    setOverlayTailwindClassName,
  }
}

export type FigmaImageFilterToolModel = ReturnType<typeof useFigmaImageFilterTool>

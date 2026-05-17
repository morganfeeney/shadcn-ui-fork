"use client"

import * as React from "react"
import { useColorState } from "chromakit-react"

import { copyToClipboardWithMeta } from "@/components/copy-button"
import {
  DEFAULT_FILTERS,
  DEFAULT_IMAGE_URL,
  READY_MADE_FILTER_PRESETS,
  TAILWIND_PALETTE,
  type FigmaFilterKey,
  type FigmaFilterState,
  type FilterPreset,
  type OverlaySource,
} from "@/components/figma-image-filter-to-css/config"
import {
  clampFigmaValue,
  clampPercentage,
  formatOklchFromColorValue,
  getDirectCssFunctions,
  getTailwindUtilities,
  toTailwindFilterArbitraryValue,
} from "@/components/figma-image-filter-to-css/utils"

export function useFigmaImageFilterTool() {
  const defaultContainerClassName = "relative aspect-square"
  const defaultImageExtraClasses = "grayscale"
  const defaultOverlayBlendClassName = "mix-blend-color"
  const defaultOverlayOpacity = 25

  const [filters, setFilters] = React.useState<FigmaFilterState>(DEFAULT_FILTERS)
  const [imageUrl, setImageUrl] = React.useState(DEFAULT_IMAGE_URL)
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)
  const [activePresetId, setActivePresetId] = React.useState("custom")
  const [includeOverlay, setIncludeOverlay] = React.useState(true)
  const [overlaySource, setOverlaySource] = React.useState<OverlaySource>("custom")
  const [overlayTailwindClassName, setOverlayTailwindClassName] = React.useState("bg-purple-700")
  const [tailwindColorSearch, setTailwindColorSearch] = React.useState("")
  const [overlayOklchColor, setOverlayOklchColor] = React.useState("oklch(0.63 0.21 304)")
  const { hsva, colorValue, updateColor } = useColorState(overlayOklchColor)

  React.useEffect(() => {
    setOverlaySource("custom")
    setOverlayOklchColor(formatOklchFromColorValue(colorValue))
  }, [colorValue])

  React.useEffect(() => {
    if (!copiedKey) return
    const timeout = window.setTimeout(() => setCopiedKey(null), 1500)
    return () => window.clearTimeout(timeout)
  }, [copiedKey])

  const selectedOverlaySwatch = React.useMemo(
    () =>
      TAILWIND_PALETTE.find((swatch) => swatch.className === overlayTailwindClassName) ??
      TAILWIND_PALETTE[0],
    [overlayTailwindClassName]
  )

  const filteredTailwindPalette = React.useMemo(() => {
    const query = tailwindColorSearch.trim().toLowerCase()
    if (!query) return TAILWIND_PALETTE

    return TAILWIND_PALETTE.filter((entry) =>
      `${entry.label} ${entry.className}`.toLowerCase().includes(query)
    )
  }, [tailwindColorSearch])

  const directCssFunctions = React.useMemo(() => getDirectCssFunctions(filters), [filters])

  const cssFilterValue = React.useMemo(() => {
    const activePreset = READY_MADE_FILTER_PRESETS.find((preset) => preset.id === activePresetId)
    const cssExtras = activePreset?.cssExtras ?? []
    return [...directCssFunctions, ...cssExtras].join(" ")
  }, [activePresetId, directCssFunctions])

  const tailwindClasses = React.useMemo(() => {
    const baseUtilities = getTailwindUtilities(filters)
    const activePreset = READY_MADE_FILTER_PRESETS.find((preset) => preset.id === activePresetId)
    if (!activePreset?.cssExtras?.length) {
      return baseUtilities
    }

    return ["filter", toTailwindFilterArbitraryValue(cssFilterValue)]
  }, [activePresetId, cssFilterValue, filters])

  const overlayColorClassName = React.useMemo(
    () =>
      overlaySource === "tailwind"
        ? overlayTailwindClassName
        : `bg-[${overlayOklchColor.replaceAll(" ", "_")}]`,
    [overlayOklchColor, overlaySource, overlayTailwindClassName]
  )

  const overlayPreviewColor =
    overlaySource === "tailwind" ? selectedOverlaySwatch.color : overlayOklchColor

  const cssSnippet = React.useMemo(
    () => `.image {\n  filter: ${cssFilterValue};\n}`,
    [cssFilterValue]
  )

  const tailwindSnippet = React.useMemo(
    () => `className="${tailwindClasses.join(" ")}"`,
    [tailwindClasses]
  )

  const mergedImageClassName = React.useMemo(
    () =>
      [tailwindClasses.join(" "), defaultImageExtraClasses]
        .filter(Boolean)
        .join(" "),
    [tailwindClasses]
  )

  const layeredJsxSnippet = React.useMemo(() => {
    const overlayOpacityClass = `opacity-${Math.round(clampPercentage(defaultOverlayOpacity))}`
    const overlayLine = includeOverlay
      ? `      <div className="absolute inset-0 z-30 ${overlayColorClassName} ${overlayOpacityClass} ${defaultOverlayBlendClassName}" />\n`
      : ""

    return `import Image from "next/image"

<div className="${defaultContainerClassName}">
${overlayLine}  <Image
    className="${mergedImageClassName}"
    src="${imageUrl}"
    alt=""
    fill
  />
</div>`
  }, [
    defaultContainerClassName,
    defaultOverlayBlendClassName,
    defaultOverlayOpacity,
    imageUrl,
    includeOverlay,
    mergedImageClassName,
    overlayColorClassName,
  ])

  async function handleCopy(value: string, key: string) {
    const hasCopied = await copyToClipboardWithMeta(value, {
      name: "figma_filter_css_copy",
      properties: { key },
    })

    if (hasCopied) {
      setCopiedKey(key)
    }
  }

  function updateFilter(key: FigmaFilterKey, nextValue: number) {
    setActivePresetId("custom")
    setFilters((current) => ({ ...current, [key]: clampFigmaValue(nextValue) }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
    setActivePresetId("custom")
  }

  function applyPreset(preset: FilterPreset) {
    setFilters({ ...DEFAULT_FILTERS, ...preset.values })
    setActivePresetId(preset.id)
  }

  return {
    filters,
    imageUrl,
    copiedKey,
    activePresetId,
    includeOverlay,
    defaultContainerClassName,
    overlaySource,
    overlayTailwindClassName,
    tailwindColorSearch,
    overlayOklchColor,
    defaultOverlayBlendClassName,
    defaultOverlayOpacity,
    defaultImageExtraClasses,
    hsva,
    updateColor,
    selectedOverlaySwatch,
    filteredTailwindPalette,
    cssFilterValue,
    overlayColorClassName,
    overlayPreviewColor,
    cssSnippet,
    tailwindSnippet,
    layeredJsxSnippet,
    handleCopy,
    updateFilter,
    resetFilters,
    applyPreset,
    setImageUrl,
    setIncludeOverlay,
    setOverlaySource,
    setOverlayTailwindClassName,
    setTailwindColorSearch,
  }
}

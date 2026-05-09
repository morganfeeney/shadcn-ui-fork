import type { ListViewItem } from "@/lib/list-view"

export type AccessiblePresetExplorerFilters = {
  style: string
  baseColor: string
  theme: string
  chartColor: string
  iconLibrary: string
  font: string
  fontHeading: string
}

export const DEFAULT_ACCESSIBLE_PRESET_FILTERS: AccessiblePresetExplorerFilters =
  {
    style: "all",
    baseColor: "all",
    theme: "all",
    chartColor: "all",
    iconLibrary: "all",
    font: "all",
    fontHeading: "all",
  }

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

export function deriveAccessiblePresetFilterOptions(items: ListViewItem[]) {
  return {
    styles: sortedUnique(items.map((i) => i.style)),
    baseColors: sortedUnique(items.map((i) => i.baseColor)),
    themes: sortedUnique(items.map((i) => i.theme)),
    chartColors: sortedUnique(items.map((i) => i.chartColor)),
    iconLibraries: sortedUnique(items.map((i) => i.iconLibrary)),
    fonts: sortedUnique(items.map((i) => i.font)),
    fontHeadings: sortedUnique(items.map((i) => i.fontHeading)),
  }
}

export function filterAccessiblePresetItems(
  items: ListViewItem[],
  filters: AccessiblePresetExplorerFilters
): ListViewItem[] {
  return items.filter((item) => {
    if (filters.style !== "all" && item.style !== filters.style) return false
    if (filters.baseColor !== "all" && item.baseColor !== filters.baseColor)
      return false
    if (filters.theme !== "all" && item.theme !== filters.theme) return false
    if (filters.chartColor !== "all" && item.chartColor !== filters.chartColor)
      return false
    if (
      filters.iconLibrary !== "all" &&
      item.iconLibrary !== filters.iconLibrary
    )
      return false
    if (filters.font !== "all" && item.font !== filters.font) return false
    if (
      filters.fontHeading !== "all" &&
      item.fontHeading !== filters.fontHeading
    )
      return false
    return true
  })
}

export function filtersActive(filters: AccessiblePresetExplorerFilters) {
  return Object.values(filters).some((v) => v !== "all")
}

const FILTER_PARAM_KEYS: (keyof AccessiblePresetExplorerFilters)[] = [
  "style",
  "baseColor",
  "theme",
  "chartColor",
  "iconLibrary",
  "fontHeading",
  "font",
]

/** Read filter state from the URL; unknown or invalid values fall back to "all". */
export function accessiblePresetFiltersFromSearchParams(
  params: URLSearchParams,
  options: ReturnType<typeof deriveAccessiblePresetFilterOptions>
): AccessiblePresetExplorerFilters {
  const f: AccessiblePresetExplorerFilters = {
    ...DEFAULT_ACCESSIBLE_PRESET_FILTERS,
  }
  const take = (
    key: keyof AccessiblePresetExplorerFilters,
    allowed: string[]
  ) => {
    const v = params.get(key)
    if (v == null || v === "") return
    if (v === "all") {
      f[key] = "all"
      return
    }
    if (allowed.includes(v)) f[key] = v
  }
  take("style", options.styles)
  take("baseColor", options.baseColors)
  take("theme", options.themes)
  take("chartColor", options.chartColors)
  take("iconLibrary", options.iconLibraries)
  take("font", options.fonts)
  take("fontHeading", options.fontHeadings)
  return f
}

/** Update URLSearchParams in place: omit keys that are "all". */
export function applyAccessiblePresetFiltersToSearchParams(
  params: URLSearchParams,
  filters: AccessiblePresetExplorerFilters
) {
  for (const key of FILTER_PARAM_KEYS) {
    const v = filters[key]
    if (v === "all") params.delete(key)
    else params.set(key, v)
  }
}

export function clearAccessiblePresetFilterParams(params: URLSearchParams) {
  for (const key of FILTER_PARAM_KEYS) params.delete(key)
}

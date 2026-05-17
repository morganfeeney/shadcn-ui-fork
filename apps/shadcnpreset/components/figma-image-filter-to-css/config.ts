import tailwindColors from "tailwindcss/colors.js"

export type FigmaFilterKey = "exposure" | "contrast" | "saturation"

export type FigmaFilterState = Record<FigmaFilterKey, number>
export type OverlaySource = "custom" | "tailwind"

export type FilterField = {
  key: FigmaFilterKey
  label: string
}

export type FilterPreset = {
  id: string
  name: string
  description: string
  values: Partial<FigmaFilterState>
  cssExtras?: string[]
}

export type TailwindPaletteEntry = {
  id: string
  label: string
  className: string
  color: string
}

export const FILTER_FIELDS: readonly FilterField[] = [
  { key: "exposure", label: "Exposure" },
  { key: "contrast", label: "Contrast" },
  { key: "saturation", label: "Saturation" },
]

export const DEFAULT_FILTERS: FigmaFilterState = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
}

export const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1691435828932-911a7801adfb?q=80&w=1200&h=1200&auto=format&fit=crop"

export const READY_MADE_FILTER_PRESETS: readonly FilterPreset[] = [
  { id: "natural", name: "Natural", description: "Balanced correction", values: {} },
  {
    id: "washed-out",
    name: "Washed out",
    description: "Bright + muted",
    values: { exposure: 0.2, contrast: -0.35, saturation: -0.45 },
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Punchy contrast",
    values: { exposure: -0.12, contrast: 0.35, saturation: 0.18 },
  },
  {
    id: "cool-tone",
    name: "Cool tone",
    description: "Colder blues",
    values: { exposure: 0.08, contrast: 0.1, saturation: -0.15 },
  },
  {
    id: "sepia",
    name: "Sepia",
    description: "Vintage warm",
    values: { exposure: 0.1, contrast: -0.08, saturation: -0.22 },
    cssExtras: ["sepia(1)"],
  },
  {
    id: "noir",
    name: "Noir",
    description: "Monochrome drama",
    values: { contrast: 0.3 },
    cssExtras: ["grayscale(1)"],
  },
]

const TAILWIND_FAMILIES = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const

function isTailwindScale(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function createTailwindPaletteEntries(): TailwindPaletteEntry[] {
  const source = tailwindColors as Record<string, unknown>
  const entries: TailwindPaletteEntry[] = []

  for (const family of TAILWIND_FAMILIES) {
    const scale = source[family]
    if (!isTailwindScale(scale)) continue

    const shades = Object.entries(scale)
      .filter(([shade, value]) => /^\d+$/.test(shade) && typeof value === "string")
      .sort((a, b) => Number(a[0]) - Number(b[0]))

    for (const [shade, color] of shades) {
      entries.push({
        id: `${family}-${shade}`,
        label: `${family}-${shade}`,
        className: `bg-${family}-${shade}`,
        color: color as string,
      })
    }
  }

  return entries
}

export const TAILWIND_PALETTE = createTailwindPaletteEntries()

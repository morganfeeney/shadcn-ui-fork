import tailwindColors from "tailwindcss/colors.js"

export type FigmaFilterKey =
  | "blur"
  | "brightness"
  | "contrast"
  | "grayscale"
  | "hueRotate"
  | "invert"
  | "opacity"
  | "saturate"
  | "sepia"

export type FigmaFilterState = Record<FigmaFilterKey, number>
export type OverlaySource = "custom" | "tailwind"

export type FilterField = {
  key: FigmaFilterKey
  label: string
  min: number
  max: number
  step: number
  unit: "%" | "deg" | "px"
}

export type FilterPreset = {
  id: string
  name: string
  description: string
  values: Partial<FigmaFilterState>
}

export type TailwindPaletteEntry = {
  id: string
  label: string
  className: string
  color: string
  family: string
}

export const FILTER_FIELDS: readonly FilterField[] = [
  { key: "blur", label: "Blur Radius", min: 0, max: 50, step: 1, unit: "px" },
  {
    key: "brightness",
    label: "Brightness",
    min: 0,
    max: 200,
    step: 1,
    unit: "%",
  },
  { key: "contrast", label: "Contrast", min: 0, max: 200, step: 1, unit: "%" },
  {
    key: "grayscale",
    label: "Grayscale",
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
  },
  {
    key: "hueRotate",
    label: "Hue Rotate",
    min: 0,
    max: 360,
    step: 1,
    unit: "deg",
  },
  { key: "invert", label: "Invert", min: 0, max: 100, step: 1, unit: "%" },
  { key: "opacity", label: "Opacity", min: 0, max: 100, step: 1, unit: "%" },
  { key: "saturate", label: "Saturate", min: 0, max: 200, step: 1, unit: "%" },
  { key: "sepia", label: "Sepia", min: 0, max: 100, step: 1, unit: "%" },
]

export const DEFAULT_FILTERS: FigmaFilterState = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  hueRotate: 0,
  invert: 0,
  opacity: 100,
  saturate: 100,
  sepia: 0,
}

export const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1691435828932-911a7801adfb?q=80&w=1200&h=1200&auto=format&fit=crop"

export const READY_MADE_FILTER_PRESETS: readonly FilterPreset[] = [
  {
    id: "washed-out",
    name: "Washed out",
    description: "Bright + muted",
    values: { brightness: 112, contrast: 92, saturate: 78 },
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Punchy contrast",
    values: { brightness: 92, contrast: 130, saturate: 118 },
  },
  {
    id: "cool-tone",
    name: "Cool tone",
    description: "Colder blues",
    values: { brightness: 104, contrast: 110, saturate: 90, hueRotate: 12 },
  },
  {
    id: "sepia",
    name: "Sepia",
    description: "Vintage warm",
    values: { brightness: 110, contrast: 92, saturate: 78, sepia: 100 },
  },
  {
    id: "noir",
    name: "Noir",
    description: "Monochrome drama",
    values: { contrast: 130, saturate: 0, grayscale: 100 },
  },
]

export const FILTER_FIELD_BY_KEY = Object.fromEntries(
  FILTER_FIELDS.map((field) => [field.key, field])
) as Record<FigmaFilterKey, FilterField>

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
  const entries: TailwindPaletteEntry[] = [
    {
      id: "common-black",
      label: "black",
      className: "bg-black",
      color: "#000000",
      family: "Common",
    },
    {
      id: "common-white",
      label: "white",
      className: "bg-white",
      color: "#ffffff",
      family: "Common",
    },
  ]

  for (const family of TAILWIND_FAMILIES) {
    const scale = source[family]
    if (!isTailwindScale(scale)) continue

    const shades = Object.entries(scale)
      .filter(
        ([shade, value]) => /^\d+$/.test(shade) && typeof value === "string"
      )
      .sort((a, b) => Number(a[0]) - Number(b[0]))

    for (const [shade, color] of shades) {
      entries.push({
        id: `${family}-${shade}`,
        label: `${family}-${shade}`,
        className: `bg-${family}-${shade}`,
        color: color as string,
        family: family[0].toUpperCase() + family.slice(1),
      })
    }
  }

  return entries
}

export const TAILWIND_PALETTE = createTailwindPaletteEntries()

import { PRESET_FONTS } from "shadcn/preset"

/**
 * Single source of truth for preset-supported font metadata. Mirrors the shape
 * of `apps/v4/lib/font-definitions.ts` so we use the same `FONT_DEFINITIONS.find(...).title`
 * idiom as shadcn for display names.
 *
 * `family` strings target the Google Fonts web names (loaded dynamically via
 * `components/preset-font-loader.tsx`) rather than the `*-Variable` fontsource
 * builds v4 uses — that's the only intentional divergence.
 */
export type FontDefinition = {
  name: (typeof PRESET_FONTS)[number]
  title: string
  type: "sans" | "mono" | "serif"
  family: string
}

export const FONT_DEFINITIONS = [
  {
    name: "geist",
    title: "Geist",
    type: "sans",
    family: '"Geist", system-ui, sans-serif',
  },
  {
    name: "inter",
    title: "Inter",
    type: "sans",
    family: '"Inter", system-ui, sans-serif',
  },
  {
    name: "noto-sans",
    title: "Noto Sans",
    type: "sans",
    family: '"Noto Sans", system-ui, sans-serif',
  },
  {
    name: "nunito-sans",
    title: "Nunito Sans",
    type: "sans",
    family: '"Nunito Sans", system-ui, sans-serif',
  },
  {
    name: "figtree",
    title: "Figtree",
    type: "sans",
    family: '"Figtree", system-ui, sans-serif',
  },
  {
    name: "roboto",
    title: "Roboto",
    type: "sans",
    family: '"Roboto", system-ui, sans-serif',
  },
  {
    name: "raleway",
    title: "Raleway",
    type: "sans",
    family: '"Raleway", system-ui, sans-serif',
  },
  {
    name: "dm-sans",
    title: "DM Sans",
    type: "sans",
    family: '"DM Sans", system-ui, sans-serif',
  },
  {
    name: "public-sans",
    title: "Public Sans",
    type: "sans",
    family: '"Public Sans", system-ui, sans-serif',
  },
  {
    name: "outfit",
    title: "Outfit",
    type: "sans",
    family: '"Outfit", system-ui, sans-serif',
  },
  {
    name: "oxanium",
    title: "Oxanium",
    type: "sans",
    family: '"Oxanium", system-ui, sans-serif',
  },
  {
    name: "manrope",
    title: "Manrope",
    type: "sans",
    family: '"Manrope", system-ui, sans-serif',
  },
  {
    name: "space-grotesk",
    title: "Space Grotesk",
    type: "sans",
    family: '"Space Grotesk", system-ui, sans-serif',
  },
  {
    name: "montserrat",
    title: "Montserrat",
    type: "sans",
    family: '"Montserrat", system-ui, sans-serif',
  },
  {
    name: "ibm-plex-sans",
    title: "IBM Plex Sans",
    type: "sans",
    family: '"IBM Plex Sans", system-ui, sans-serif',
  },
  {
    name: "source-sans-3",
    title: "Source Sans 3",
    type: "sans",
    family: '"Source Sans 3", system-ui, sans-serif',
  },
  {
    name: "instrument-sans",
    title: "Instrument Sans",
    type: "sans",
    family: '"Instrument Sans", system-ui, sans-serif',
  },
  {
    name: "jetbrains-mono",
    title: "JetBrains Mono",
    type: "mono",
    family: '"JetBrains Mono", monospace',
  },
  {
    name: "geist-mono",
    title: "Geist Mono",
    type: "mono",
    family: '"Geist Mono", monospace',
  },
  {
    name: "noto-serif",
    title: "Noto Serif",
    type: "serif",
    family: '"Noto Serif", serif',
  },
  {
    name: "roboto-slab",
    title: "Roboto Slab",
    type: "serif",
    family: '"Roboto Slab", serif',
  },
  {
    name: "merriweather",
    title: "Merriweather",
    type: "serif",
    family: '"Merriweather", serif',
  },
  {
    name: "lora",
    title: "Lora",
    type: "serif",
    family: '"Lora", serif',
  },
  {
    name: "playfair-display",
    title: "Playfair Display",
    type: "serif",
    family: '"Playfair Display", serif',
  },
  {
    name: "eb-garamond",
    title: "EB Garamond",
    type: "serif",
    family: '"EB Garamond", serif',
  },
  {
    name: "instrument-serif",
    title: "Instrument Serif",
    type: "serif",
    family: '"Instrument Serif", serif',
  },
] as const satisfies readonly FontDefinition[]

export type FontName = (typeof FONT_DEFINITIONS)[number]["name"]

// Compile-time exhaustiveness: every PRESET_FONTS slug must have a definition.
type _AssertExhaustive = Exclude<
  (typeof PRESET_FONTS)[number],
  FontName
> extends never
  ? true
  : never
const _assertExhaustive: _AssertExhaustive = true
void _assertExhaustive

export function getFontDefinition(
  name: string
): (typeof FONT_DEFINITIONS)[number] | undefined {
  return FONT_DEFINITIONS.find((f) => f.name === name)
}

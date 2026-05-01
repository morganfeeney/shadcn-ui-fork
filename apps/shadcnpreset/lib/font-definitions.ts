import { PRESET_FONTS } from "shadcn/preset"

/**
 * Single source of truth for preset-supported font metadata. Mirrors the shape
 * of `apps/v4/lib/font-definitions.ts` so we use the same `FONT_DEFINITIONS.find(...).title`
 * idiom as shadcn for display names.
 *
 * `family` strings target the Google Fonts web names (loaded dynamically via
 * `components/preset-font-loader.tsx`) rather than the `*-Variable` fontsource
 * builds v4 uses — that's the only intentional divergence.
 *
 * `googleFontQuery` is the `family=` parameter value for Google Fonts CSS2 URLs
 * (weights/axes differ per family; not derivable from `title` alone).
 */
export type FontDefinition = {
  name: (typeof PRESET_FONTS)[number]
  title: string
  type: "sans" | "mono" | "serif"
  family: string
  googleFontQuery: string
}

export const FONT_DEFINITIONS = [
  {
    name: "geist",
    title: "Geist",
    type: "sans",
    family: '"Geist", system-ui, sans-serif',
    googleFontQuery: "Geist:wght@100..900",
  },
  {
    name: "inter",
    title: "Inter",
    type: "sans",
    family: '"Inter", system-ui, sans-serif',
    googleFontQuery: "Inter:wght@400;500;600;700",
  },
  {
    name: "noto-sans",
    title: "Noto Sans",
    type: "sans",
    family: '"Noto Sans", system-ui, sans-serif',
    googleFontQuery: "Noto+Sans:wght@400;500;600;700",
  },
  {
    name: "nunito-sans",
    title: "Nunito Sans",
    type: "sans",
    family: '"Nunito Sans", system-ui, sans-serif',
    googleFontQuery: "Nunito+Sans:wght@400;500;600;700",
  },
  {
    name: "figtree",
    title: "Figtree",
    type: "sans",
    family: '"Figtree", system-ui, sans-serif',
    googleFontQuery: "Figtree:wght@400;500;600;700",
  },
  {
    name: "roboto",
    title: "Roboto",
    type: "sans",
    family: '"Roboto", system-ui, sans-serif',
    googleFontQuery: "Roboto:wght@400;500;700",
  },
  {
    name: "raleway",
    title: "Raleway",
    type: "sans",
    family: '"Raleway", system-ui, sans-serif',
    googleFontQuery: "Raleway:wght@400;500;600;700",
  },
  {
    name: "dm-sans",
    title: "DM Sans",
    type: "sans",
    family: '"DM Sans", system-ui, sans-serif',
    googleFontQuery: "DM+Sans:wght@400;500;700",
  },
  {
    name: "public-sans",
    title: "Public Sans",
    type: "sans",
    family: '"Public Sans", system-ui, sans-serif',
    googleFontQuery: "Public+Sans:wght@400;500;600;700",
  },
  {
    name: "outfit",
    title: "Outfit",
    type: "sans",
    family: '"Outfit", system-ui, sans-serif',
    googleFontQuery: "Outfit:wght@400;500;600;700",
  },
  {
    name: "oxanium",
    title: "Oxanium",
    type: "sans",
    family: '"Oxanium", system-ui, sans-serif',
    googleFontQuery: "Oxanium:wght@400;500;600;700",
  },
  {
    name: "manrope",
    title: "Manrope",
    type: "sans",
    family: '"Manrope", system-ui, sans-serif',
    googleFontQuery: "Manrope:wght@400;500;600;700",
  },
  {
    name: "space-grotesk",
    title: "Space Grotesk",
    type: "sans",
    family: '"Space Grotesk", system-ui, sans-serif',
    googleFontQuery: "Space+Grotesk:wght@400;500;600;700",
  },
  {
    name: "montserrat",
    title: "Montserrat",
    type: "sans",
    family: '"Montserrat", system-ui, sans-serif',
    googleFontQuery: "Montserrat:wght@400;500;600;700",
  },
  {
    name: "ibm-plex-sans",
    title: "IBM Plex Sans",
    type: "sans",
    family: '"IBM Plex Sans", system-ui, sans-serif',
    googleFontQuery: "IBM+Plex+Sans:wght@400;500;600;700",
  },
  {
    name: "source-sans-3",
    title: "Source Sans 3",
    type: "sans",
    family: '"Source Sans 3", system-ui, sans-serif',
    googleFontQuery: "Source+Sans+3:wght@400;500;600;700",
  },
  {
    name: "instrument-sans",
    title: "Instrument Sans",
    type: "sans",
    family: '"Instrument Sans", system-ui, sans-serif',
    googleFontQuery: "Instrument+Sans:wght@400;500;600;700",
  },
  {
    name: "jetbrains-mono",
    title: "JetBrains Mono",
    type: "mono",
    family: '"JetBrains Mono", monospace',
    googleFontQuery: "JetBrains+Mono:wght@400;500;700",
  },
  {
    name: "geist-mono",
    title: "Geist Mono",
    type: "mono",
    family: '"Geist Mono", monospace',
    googleFontQuery: "Geist+Mono:wght@100..900",
  },
  {
    name: "noto-serif",
    title: "Noto Serif",
    type: "serif",
    family: '"Noto Serif", serif',
    googleFontQuery: "Noto+Serif:wght@400;500;600;700",
  },
  {
    name: "roboto-slab",
    title: "Roboto Slab",
    type: "serif",
    family: '"Roboto Slab", serif',
    googleFontQuery: "Roboto+Slab:wght@400;500;600;700",
  },
  {
    name: "merriweather",
    title: "Merriweather",
    type: "serif",
    family: '"Merriweather", serif',
    googleFontQuery: "Merriweather:wght@400;700",
  },
  {
    name: "lora",
    title: "Lora",
    type: "serif",
    family: '"Lora", serif',
    googleFontQuery: "Lora:wght@400;500;600;700",
  },
  {
    name: "playfair-display",
    title: "Playfair Display",
    type: "serif",
    family: '"Playfair Display", serif',
    googleFontQuery: "Playfair+Display:wght@400;500;600;700",
  },
  {
    name: "eb-garamond",
    title: "EB Garamond",
    type: "serif",
    family: '"EB Garamond", serif',
    googleFontQuery: "EB+Garamond:wght@400;500;600;700",
  },
  {
    name: "instrument-serif",
    title: "Instrument Serif",
    type: "serif",
    family: '"Instrument Serif", serif',
    googleFontQuery: "Instrument+Serif:ital@0;1",
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

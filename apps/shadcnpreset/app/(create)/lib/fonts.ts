import { Geist, Inter, JetBrains_Mono } from "next/font/google"

import {
  FONT_DEFINITIONS,
  type FontName,
} from "@/lib/font-definitions"

type PreviewFont = ReturnType<typeof Inter>

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

// Only fonts loaded via `next/font/google` for the create flow's live preview.
// Other preset fonts are loaded dynamically by `components/preset-font-loader.tsx`.
const PREVIEW_FONTS = {
  geist: geistSans,
  inter,
  "jetbrains-mono": jetbrainsMono,
} satisfies Partial<Record<FontName, PreviewFont>>

type PreviewFontName = keyof typeof PREVIEW_FONTS

function createFontOption(name: PreviewFontName) {
  const definition = FONT_DEFINITIONS.find((font) => font.name === name)

  if (!definition) {
    throw new Error(`Unknown font definition: ${name}`)
  }

  return {
    name: definition.title,
    value: definition.name,
    font: PREVIEW_FONTS[name],
    type: definition.type,
  } as const
}

export const FONTS = [
  createFontOption("geist"),
  createFontOption("inter"),
  createFontOption("jetbrains-mono"),
] as const

export type Font = (typeof FONTS)[number]

export const FONT_HEADING_OPTIONS = [
  {
    name: "Inherit",
    value: "inherit",
    font: null,
    type: "default",
  },
  ...FONTS,
] as const

export type FontHeadingOption = (typeof FONT_HEADING_OPTIONS)[number]

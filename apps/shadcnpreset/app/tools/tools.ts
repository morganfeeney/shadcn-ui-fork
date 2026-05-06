export const TOOLS_PAGE = {
  title: "Tools",
  description:
    "Utility tools for decoding, inspecting, and working with shadcn presets.",
  href: "/tools",
} as const

export const PRESET_THEME_GENERATOR_TOOL = {
  slug: "preset-theme-generator",
  legacySlug: "preset-theme",
  href: "/tools/preset-theme-generator",
  legacyHref: "/tools/preset-theme",
  title: "Preset Theme CSS Generator",
  description:
    "Decode a shadcn preset, preview it, and generate CSS custom properties for light and dark mode you can copy and paste into your project.",
  cardDescription:
    "Paste a preset code to decode its config, preview it, and copy ready-to-use CSS custom properties.",
} as const

export const PRESET_COLOR_CONTRAST_TOOL = {
  slug: "color-contrast",
  legacySlug: "accessibility-checker",
  href: "/tools/color-contrast",
  legacyHref: "/tools/accessibility-checker",
  title: "Preset color contrast checker",
  description:
    "WCAG 2.x contrast ratios for shadcn variable pairs in a preset's light and dark theme tokens.",
  cardDescription:
    "Check WCAG contrast for core theme token pairs from a preset code, with light and dark previews.",
} as const

export const TOOLS = [
  PRESET_THEME_GENERATOR_TOOL,
  PRESET_COLOR_CONTRAST_TOOL,
] as const

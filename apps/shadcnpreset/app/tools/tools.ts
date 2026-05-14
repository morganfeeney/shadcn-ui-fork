export const TOOLS_PAGE = {
  title: "Tools",
  description:
    "Utility tools for decoding, inspecting, and working with shadcn presets.",
  href: "/tools",
} as const

export const PRESET_THEME_GENERATOR_TOOL = {
  slug: "preset-theme-generator",
  href: "/tools/preset-theme-generator",
  title: "Preset Theme CSS Generator",
  description:
    "Decode a shadcn preset, preview it, and generate CSS custom properties for light and dark mode you can copy and paste into your project.",
  cardDescription:
    "Paste a preset code to decode its config, preview it, and copy ready-to-use CSS custom properties.",
} as const

export const PRESET_COLOR_CONTRAST_TOOL = {
  slug: "color-contrast-checker",
  href: "/tools/color-contrast-checker",
  title: "Preset color contrast checker",
  description:
    "WCAG 2.x contrast ratios for a shadcn preset's light and dark theme tokens.",
  cardDescription:
    "Check WCAG contrast for core theme token pairs from a preset code, with light and dark previews.",
} as const

export const PRESET_FIGMA_PLUGIN = {
  slug: "shadcn-preset-variables",
  href: "https://www.figma.com/community/plugin/1629785761451501897",
  title: "Shadcn preset variables Figma plugin",
  cardDescription:
    "Enter a preset code, click generate, and you get light and dark mode variables for the shadcn theme belonging to that preset, perfect for syncing your Figma designs with your codebase.",
}

export const TOOLS = [
  PRESET_THEME_GENERATOR_TOOL,
  PRESET_COLOR_CONTRAST_TOOL,
  PRESET_FIGMA_PLUGIN,
] as const

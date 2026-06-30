import {
  effectiveHeadingFont,
  getFontDisplayName,
  type ResolvedPreset,
} from "@/lib/preset"

export function presetMetaDescription(preset: ResolvedPreset): string {
  return `Preview this shadcn/ui preset (${preset.code}): ${preset.style} style, ${preset.baseColor} base, ${preset.theme} theme, ${preset.font} body, ${preset.radius} radius. Copy the code, open in create, or share.`
}

export function presetDnaMetaDescription(preset: ResolvedPreset): string {
  const headingFont = effectiveHeadingFont(preset.font, preset.fontHeading)

  return `A shadcn preset featuring the ${preset.style} style, a ${preset.baseColor} base, ${preset.theme} theme, ${preset.effectiveChartColor} charts, and ${getFontDisplayName(preset.font)} body text paired with ${getFontDisplayName(headingFont)} headings.`
}

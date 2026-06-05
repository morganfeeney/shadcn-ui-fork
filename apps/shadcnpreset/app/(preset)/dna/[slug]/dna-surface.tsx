"use client"

import { useTheme } from "next-themes"

import {
  PresetThemeSurface,
  type RegistryThemeSurface,
} from "@/components/preset-theme-surface"
import { useMounted } from "@/hooks/use-mounted"
import {
  effectiveHeadingFont,
  getFontDisplayName,
  type ResolvedPreset,
} from "@/lib/preset"
import { DEFAULT_CONFIG } from "@/registry/config"

import { DnaSwatchGrid } from "./swatch-grid"
import { resolveSwatchRowsForMode } from "./swatch-utils"
import { DnaTypographySection } from "./typography-section"

type DnaSurfaceProps = {
  resolved: ResolvedPreset
  registryTheme: RegistryThemeSurface
}

export function DnaSurface({ resolved, registryTheme }: DnaSurfaceProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  if (!mounted) {
    return null
  }

  const mode = resolvedTheme === "dark" ? "dark" : "light"
  const modeVars = registryTheme.cssVars[mode] as Record<string, string>
  const swatchRows = resolveSwatchRowsForMode(modeVars)
  const headingFont = effectiveHeadingFont(resolved.font, resolved.fontHeading)

  return (
    <PresetThemeSurface
      registryTheme={registryTheme}
      surfaceMode={mode}
      bodyFont={DEFAULT_CONFIG.font}
      headingFont={DEFAULT_CONFIG.fontHeading}
      styleName={resolved.style}
    >
      <header className="grid gap-10 pt-30 pb-6">
        <h1 className="text-5xl font-display font-normal">
          Preset: {resolved.code}
        </h1>
        <p className="max-w-[70ch] text-sm leading-relaxed text-balance text-muted-foreground">
          This shadcn preset comes in a {resolved.style} style, with a{" "}
          {resolved.baseColor} base, {resolved.theme} theme,{" "}
          {resolved.effectiveChartColor} charts, and{" "}
          {getFontDisplayName(resolved.font)} body font paired with{" "}
          {getFontDisplayName(headingFont)} headings.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-4">
        <DnaSwatchGrid rows={swatchRows} />
        <DnaTypographySection
          bodyFont={resolved.font}
          headingFont={headingFont}
        />
      </div>
    </PresetThemeSurface>
  )
}

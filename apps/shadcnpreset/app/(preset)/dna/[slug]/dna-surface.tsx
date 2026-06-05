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
import Image from "next/image"
import NotoLight from "@/public/marketing/cta/notolight.png"
import NotoDark from "@/public/marketing/cta/notodark.png"

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
      <header className="grid gap-6 pt-30 pb-10">
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
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <DnaSwatchGrid rows={swatchRows} />
          <DnaTypographySection
            bodyFont={resolved.font}
            headingFont={headingFont}
          />
        </div>
        <div className="relative aspect-video">
          <Image
            className="brightness-400 grayscale dark:brightness-200"
            src="https://images.unsplash.com/photo-1691435828932-911a7801adfb?auto=format&fit=crop&w=1200&h=1200&crop=focalpoint&fp-x=0.25&fp-y=0.35&fp-z=2.8&q=80"
            alt=""
            fill
          />
          <div className="absolute inset-0 bg-primary opacity-25 mix-blend-color" />
        </div>
      </div>
    </PresetThemeSurface>
  )
}

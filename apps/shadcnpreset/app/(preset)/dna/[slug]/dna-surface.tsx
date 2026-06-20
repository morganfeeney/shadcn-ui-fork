"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"

import {
  PresetThemeSurface,
  type RegistryThemeSurface,
} from "@/components/preset-theme-surface"
import { PresetV4ScaledFrame } from "@/components/preset-v4-scaled-frame"
import { Button } from "@/components/ui/button"
import { useMounted } from "@/hooks/use-mounted"
import {
  effectiveHeadingFont,
  getFontDisplayName,
  getFontFamily,
  getPresetPreviewUrl,
  type ResolvedPreset,
} from "@/lib/preset"
import { generateRandomCompatiblePreset } from "@/lib/random-preset"
import { DEFAULT_CONFIG } from "@/registry/config"

import { DnaSwatchGrid } from "./swatch-grid"
import { DnaSurfaceSkeleton } from "./dna-surface-skeleton"
import { resolveSwatchRowsForMode } from "./swatch-utils"
import { DnaTypographySection } from "./typography-section"
import { DnaIconSection } from "./icon-section"

import ipadMockup from "@/public/dna/ipad-mockup.png"

type DnaSurfaceProps = {
  resolved: ResolvedPreset
  registryTheme: RegistryThemeSurface
}

export function DnaSurface({ resolved, registryTheme }: DnaSurfaceProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  if (!mounted) {
    return (
      <PresetThemeSurface
        registryTheme={registryTheme}
        surfaceMode="light"
        bodyFont={DEFAULT_CONFIG.font}
        headingFont={DEFAULT_CONFIG.fontHeading}
        styleName={resolved.style}
      >
        <DnaSurfaceSkeleton />
      </PresetThemeSurface>
    )
  }

  const mode = resolvedTheme === "dark" ? "dark" : "light"
  const modeVars = registryTheme.cssVars[mode] as Record<string, string>
  const swatchRows = resolveSwatchRowsForMode(modeVars)
  const headingFont = effectiveHeadingFont(resolved.font, resolved.fontHeading)
  const previewSrc = getPresetPreviewUrl(resolved.code, "preview")

  function onRandomPreset() {
    const code = generateRandomCompatiblePreset()
    router.push(`/dna/${code}`)
  }

  const bodyFontFamily = getFontFamily(resolved.font)

  return (
    <PresetThemeSurface
      registryTheme={registryTheme}
      surfaceMode={mode}
      bodyFont={DEFAULT_CONFIG.font}
      headingFont={DEFAULT_CONFIG.fontHeading}
      styleName={resolved.style}
    >
      <header className="grid gap-6 pt-30 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-5xl font-display font-normal">
            Preset: {resolved.code}
          </h1>
          <Button variant="outline" onClick={onRandomPreset}>
            Random preset
          </Button>
        </div>
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
        <div className="relative aspect-video overflow-hidden border bg-background">
          <Image
            className="object-cover brightness-400 grayscale dark:brightness-200"
            src="https://images.unsplash.com/photo-1691435828932-911a7801adfb?auto=format&q=80&fit=crop&crop=focalpoint&w=1600&h=900&fp-x=0.323&fp-y=0.455&fp-z=2.15"
            alt=""
            fill
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-primary opacity-25 mix-blend-color" />
          <div className="absolute inset-0 p-4 md:p-20">
            <div className="relative h-full w-full overflow-hidden rounded-xs">
              {previewSrc ? (
                <PresetV4ScaledFrame
                  key={previewSrc}
                  title={`shadcn v4 preview · ${resolved.code}`}
                  src={previewSrc}
                  virtualWidth={2150}
                  virtualHeight={1100}
                  className="pointer-events-none"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  Could not build preview URL for this preset.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="@container grid gap-4 py-10 md:grid-cols-2">
          <p
            style={{
              fontFamily: bodyFontFamily,
              hangingPunctuation: "first last",
            }}
            className="indent-[-0.35em] text-[clamp(1rem,2cqw,3rem)] leading-snug md:col-start-2"
          >
            &#34;The naive, hasty aegithales who lay eggs at Christmas when it's
            freezing are sure to be disappointed when they see their funny eggs
            damaged&#34;
          </p>
        </div>
        <DnaIconSection iconLibrary={resolved.iconLibrary} />
        <div className="relative w-full">
          <Image src={ipadMockup} alt="" width={1600} height={1225} />
          <div className="pointer-events-none absolute top-[24.2%] left-[28.9%] z-10 h-[44%] w-[43%] transform-[rotate(-8deg)_skewX(6.75deg)] overflow-hidden rounded-[3%] border border-lime-400/90 bg-lime-400/10">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 border border-lime-400/50" />
              <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-lime-400/60" />
              <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-lime-400/60" />
            </div>
          </div>
        </div>
      </div>
    </PresetThemeSurface>
  )
}

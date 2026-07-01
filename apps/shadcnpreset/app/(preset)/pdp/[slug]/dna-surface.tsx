"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import {
  PresetThemeSurface,
  type RegistryThemeSurface,
} from "@/components/preset-theme-surface"
import { PresetV4ScaledFrame } from "@/components/preset-v4-scaled-frame"
import { useMounted } from "@/hooks/use-mounted"
import {
  effectiveHeadingFont,
  getFontFamily,
  getPresetPreviewUrl,
  type ResolvedPreset,
} from "@/lib/preset"
import { presetDnaMetaDescription } from "@/lib/data/metadata/preset-meta"
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
  const { resolvedTheme } = useTheme()
  const tabletSectionRef = useRef<HTMLDivElement>(null)
  const mounted = useMounted()
  const [visibleTabletPreviewCode, setVisibleTabletPreviewCode] = useState<
    string | null
  >(null)

  const mode = resolvedTheme === "dark" ? "dark" : "light"
  const modeVars = registryTheme.cssVars[mode] as Record<string, string>
  const swatchRows = resolveSwatchRowsForMode(modeVars)
  const headingFont = effectiveHeadingFont(resolved.font, resolved.fontHeading)
  const previewSrc = getPresetPreviewUrl(resolved.code, "preview")
  const tabletPreviewSrcBase = getPresetPreviewUrl(resolved.code, "login-02")
  const supportsIntersectionObserver =
    typeof window !== "undefined" &&
    typeof window.IntersectionObserver !== "undefined"
  const showTabletPreview =
    !supportsIntersectionObserver || visibleTabletPreviewCode === resolved.code

  const bodyFontFamily = getFontFamily(resolved.font)
  useEffect(() => {
    if (!mounted) return
    const node = tabletSectionRef.current
    if (!node) return

    if (typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setVisibleTabletPreviewCode(resolved.code)
        observer.disconnect()
      },
      {
        rootMargin: "240px 0px",
        threshold: 0.01,
      }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [resolved.code, mounted])

  const tabletMaskImage = "url('/dna/mask.svg')"

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

  return (
    <PresetThemeSurface
      registryTheme={registryTheme}
      surfaceMode={mode}
      bodyFont={DEFAULT_CONFIG.font}
      headingFont={DEFAULT_CONFIG.fontHeading}
      styleName={resolved.style}
    >
      <div className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
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
            <div className="relative h-full w-full overflow-hidden rounded-xs bg-muted dark:bg-background">
              {previewSrc ? (
                <>
                  <PresetV4ScaledFrame
                    key={previewSrc}
                    title={`shadcn v4 preview · ${resolved.code}`}
                    src={previewSrc}
                    virtualWidth={2150}
                    virtualHeight={1100}
                    loadingOverlayClassName="bg-transparent"
                    hideFrameUntilLoaded
                  />
                  {/* Prevent the iframe from scrolling */}
                  <div className="absolute inset-0 bg-transparent" />
                </>
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
            className="indent-[-0.35em] text-[clamp(1.5rem,4cqw,2.5rem)] leading-snug supports-[hanging-punctuation:first]:indent-0 md:col-start-2"
          >
            &#34;The naive, hasty aegithales who lay eggs at Christmas when
            it&#39;s freezing are sure to be disappointed when they see their
            funny eggs damaged&#34;
          </p>
        </div>
        <DnaIconSection iconLibrary={resolved.iconLibrary} />
        <div ref={tabletSectionRef} className="relative w-full">
          <Image src={ipadMockup} alt="" width={1600} height={1225} />
          {tabletPreviewSrcBase && showTabletPreview ? (
            <div
              className="pointer-events-none absolute top-[21.75%] left-[24.65%] z-10 h-[51.175%] w-[51.75%]"
              style={{
                WebkitMaskImage: tabletMaskImage,
                maskImage: tabletMaskImage,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            >
              <div className="relative h-full w-full origin-top-left px-[7%]">
                <PresetV4ScaledFrame
                  key={`${tabletPreviewSrcBase}-tablet`}
                  title={`shadcn login preview · ${resolved.code}`}
                  src={tabletPreviewSrcBase}
                  className="transform-[skew(15deg,-8deg)] border-0 bg-background"
                  loadingOverlayClassName="bg-transparent"
                  hideFrameUntilLoaded
                  virtualWidth={1024}
                  virtualHeight={756}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </PresetThemeSurface>
  )
}

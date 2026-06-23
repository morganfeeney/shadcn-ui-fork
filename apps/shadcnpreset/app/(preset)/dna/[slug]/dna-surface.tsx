"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"

import {
  PresetThemeSurface,
  type RegistryThemeSurface,
} from "@/components/preset-theme-surface"
import { PresetV4Frame } from "@/components/preset-v4-frame"
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

type Point = {
  x: number
  y: number
}

type HomographyResult = {
  transform: string
  coeffs: {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
    g: number
    h: number
  }
}

function solveLinearSystem(matrix: number[][], rhs: number[]): number[] | null {
  const n = rhs.length
  const augmented = matrix.map((row, i) => [...row, rhs[i]])

  for (let col = 0; col < n; col++) {
    let pivotRow = col
    for (let row = col + 1; row < n; row++) {
      if (
        Math.abs(augmented[row]![col]!) > Math.abs(augmented[pivotRow]![col]!)
      ) {
        pivotRow = row
      }
    }

    const pivot = augmented[pivotRow]![col]!
    if (Math.abs(pivot) < 1e-10) return null
    ;[augmented[col], augmented[pivotRow]] = [
      augmented[pivotRow]!,
      augmented[col]!,
    ]

    for (let c = col; c <= n; c++) {
      augmented[col]![c] = augmented[col]![c]! / pivot
    }

    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const factor = augmented[row]![col]!
      if (Math.abs(factor) < 1e-12) continue
      for (let c = col; c <= n; c++) {
        augmented[row]![c] = augmented[row]![c]! - factor * augmented[col]![c]!
      }
    }
  }

  return augmented.map((row) => row[n]!)
}

function matrix3dFromRectToQuad(
  width: number,
  height: number,
  quad: Point[]
): HomographyResult | null {
  if (width <= 0 || height <= 0 || quad.length !== 4) return null

  const src: Point[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ]

  const matrix: number[][] = []
  const rhs: number[] = []

  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i]!
    const { x: X, y: Y } = quad[i]!
    matrix.push([x, y, 1, 0, 0, 0, -X * x, -X * y])
    rhs.push(X)
    matrix.push([0, 0, 0, x, y, 1, -Y * x, -Y * y])
    rhs.push(Y)
  }

  const solved = solveLinearSystem(matrix, rhs)
  if (!solved) return null

  const [a, b, c, d, e, f, g, h] = solved
  const fmt = (value: number) => String(Number(value.toFixed(10)))
  return {
    transform: `matrix3d(${fmt(a)},${fmt(d)},0,${fmt(g)},${fmt(b)},${fmt(e)},0,${fmt(h)},0,0,1,0,${fmt(c)},${fmt(f)},0,1)`,
    coeffs: { a, b, c, d, e, f, g, h },
  }
}

function mapPointWithHomography(
  x: number,
  y: number,
  coeffs: HomographyResult["coeffs"]
) {
  const { a, b, c, d, e, f, g, h } = coeffs
  const denom = g * x + h * y + 1
  if (Math.abs(denom) < 1e-10) return null
  return {
    x: (a * x + b * y + c) / denom,
    y: (d * x + e * y + f) / denom,
  }
}

export function DnaSurface({ resolved, registryTheme }: DnaSurfaceProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const tabletPlaneRef = useRef<HTMLDivElement>(null)
  const mounted = useMounted()
  const [tabletPlaneSize, setTabletPlaneSize] = useState({
    width: 0,
    height: 0,
  })

  const mode = resolvedTheme === "dark" ? "dark" : "light"
  const modeVars = registryTheme.cssVars[mode] as Record<string, string>
  const swatchRows = resolveSwatchRowsForMode(modeVars)
  const headingFont = effectiveHeadingFont(resolved.font, resolved.fontHeading)
  const previewSrc = getPresetPreviewUrl(resolved.code, "preview")
  const tabletPreviewSrcBase = getPresetPreviewUrl(resolved.code, "login-02")

  function onRandomPreset() {
    const code = generateRandomCompatiblePreset()
    router.push(`/dna/${code}`)
  }

  const bodyFontFamily = getFontFamily(resolved.font)
  useEffect(() => {
    const node = tabletPlaneRef.current
    if (!node) return

    const measure = () => {
      const rect = node.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      setTabletPlaneSize({ width: rect.width, height: rect.height })
    }

    measure()
    requestAnimationFrame(measure)

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setTabletPlaneSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    resizeObserver.observe(node)
    window.addEventListener("resize", measure)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  const tabletQuadRatios: Point[] = [
    { x: 0, y: 0.1501990775 },
    { x: 0.8246176702, y: 0 },
    { x: 1, y: 0.8189884603 },
    { x: 0.1640728047, y: 1 },
  ]
  const tabletMaskImage = "url('/dna/mask.svg')"

  const tabletHomography = useMemo(() => {
    const { width, height } = tabletPlaneSize
    if (!width || !height) return null

    // Authored quad from public/dna/screen-quad.svg path, normalized to its bbox.
    // Order: TL, TR, BR, BL
    const quad: Point[] = tabletQuadRatios.map((point) => ({
      x: width * point.x,
      y: height * point.y,
    }))

    const homography = matrix3dFromRectToQuad(width, height, quad)
    if (!homography) return null

    // Validation: source corners should map to authored target corners with minimal error.
    const sourceCorners: Point[] = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ]

    let maxError = 0
    for (let i = 0; i < 4; i++) {
      const projected = mapPointWithHomography(
        sourceCorners[i]!.x,
        sourceCorners[i]!.y,
        homography.coeffs
      )
      if (!projected) return null
      const dx = projected.x - quad[i]!.x
      const dy = projected.y - quad[i]!.y
      const error = Math.hypot(dx, dy)
      maxError = Math.max(maxError, error)
    }

    // Hard guard: if this fails, do not apply transform.
    if (maxError > 0.75) {
      return null
    }

    return homography
  }, [tabletPlaneSize, tabletQuadRatios])

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
            className="indent-[-0.35em] text-[clamp(1.5rem,4cqw,2.5rem)] leading-snug md:col-start-2"
          >
            &#34;The naive, hasty aegithales who lay eggs at Christmas when
            it&#39;s freezing are sure to be disappointed when they see their
            funny eggs damaged&#34;
          </p>
        </div>
        <DnaIconSection iconLibrary={resolved.iconLibrary} />
        <div className="relative w-full">
          <Image src={ipadMockup} alt="" width={1600} height={1225} />
          {tabletPreviewSrcBase ? (
            <div
              ref={tabletPlaneRef}
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

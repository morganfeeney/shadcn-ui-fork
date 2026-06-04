import { parse, wcagContrast } from "culori"
import { ImageResponse } from "next/og"
import { NextResponse } from "next/server"
import { notFound } from "next/navigation"

import { logoMarkDataUrl } from "@/components/zippystarter/logo"
import { siteConfig } from "@/lib/config"
import { isCommunityPresetCode } from "@/lib/community-presets"
import { getPresetOgSwatchHexes } from "@/lib/oklch-swatch"
import { resolvePresetFromCode } from "@/lib/preset"

export const alt = "shadcn preset preview"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GEIST_MONO = "Geist Mono"

type ImageProps = {
  params: Promise<{ code: string }>
}

async function loadGeistMono() {
  const mod = await import("@/lib/og/geistmono-regular-otf.json")
  const data = (mod as { default?: { base64Font: string } }).default ?? mod
  const base64Font = (data as { base64Font: string }).base64Font
  return {
    name: GEIST_MONO,
    data: Buffer.from(base64Font, "base64"),
    weight: 400 as const,
    style: "normal" as const,
  }
}

function codeFontSize(codeLength: number): number {
  if (codeLength > 72) return 26
  if (codeLength > 56) return 30
  if (codeLength > 40) return 36
  return 44
}

/** Mid-tone from the OG gradient — compare swatches to this so “blends in” colors get a rim. */
const OG_CARD_REFERENCE = parse("#18181b")!
/** Below this WCAG contrast vs the card, a swatch is hard to see without an outline. */
const SWATCH_OUTLINE_CONTRAST_THRESHOLD = 2.75

const SWATCH_OUTLINE_SHADOW = "0 0 0 2px rgba(255 255 255 / 0.55)"

/**
 * Light rim only when the fill is low-contrast against the dark card (e.g. near-black + deep
 * indigo). Uses `boxShadow` instead of `border` because Satori often fails to paint `border`
 * consistently on multiple sibling divs.
 */
function ogSwatchOutlineStyle(hex: string): { boxShadow?: string } {
  const color = parse(hex)
  if (!color) {
    return { boxShadow: SWATCH_OUTLINE_SHADOW }
  }
  const ratio = wcagContrast(color, OG_CARD_REFERENCE)
  if (!Number.isFinite(ratio) || ratio < SWATCH_OUTLINE_CONTRAST_THRESHOLD) {
    return { boxShadow: SWATCH_OUTLINE_SHADOW }
  }
  return {}
}

export default async function Image({ params }: ImageProps) {
  const { code } = await params
  const preset = resolvePresetFromCode(code)
  if (!preset) {
    notFound()
  }

  if (!(await isCommunityPresetCode(preset.code, code))) {
    return NextResponse.redirect(new URL("/og-card.png", siteConfig.url))
  }

  const metaLine = `${preset.style} · ${preset.theme} · ${preset.baseColor}`
  const swatchColors = getPresetOgSwatchHexes({
    baseColor: preset.baseColor,
    theme: preset.theme,
    chartColor: preset.chartColor ?? preset.effectiveChartColor,
    menuAccent: preset.menuAccent,
    radius: preset.effectiveRadius,
  })

  const fonts = [await loadGeistMono()]

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 72px 64px 72px",
        background:
          "linear-gradient(155deg, #09090b 0%, #18181b 48%, #0c0c0e 100%)",
        color: "#fafafa",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Top: logo + swatches on one row (reference: header pinned to top) */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          <img
            width={40}
            height={40}
            src={logoMarkDataUrl({ stroke: "#a1a1aa", size: 40 })}
            alt=""
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: "-0.02em",
              color: "#a1a1aa",
              fontWeight: 500,
            }}
          >
            {siteConfig.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexShrink: 0,
            alignItems: "center",
            gap: 14,
          }}
        >
          {swatchColors.map((color, i) => (
            <div
              key={`${color}-${i}`}
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                backgroundColor: color,
                ...ogSwatchOutlineStyle(color),
              }}
            />
          ))}
        </div>
      </div>
      {/* Bottom-left: code + tags (reference: main block anchored low, empty middle/right) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignSelf: "flex-start",
          minWidth: 0,
          maxWidth: "100%",
          marginBottom: 48,
        }}
      >
        <div
          style={{
            paddingTop: 4,
            fontSize: codeFontSize(preset.code.length) * 2,
            fontFamily: GEIST_MONO,
            fontWeight: 400,
            lineHeight: 1.2,
            color: "#e4e4e7",
            wordBreak: "break-all",
          }}
        >
          {preset.code}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 26,
            color: "#a1a1aa",
            fontWeight: 500,
          }}
        >
          {metaLine}
        </div>
      </div>
    </div>,
    { ...size, fonts }
  )
}

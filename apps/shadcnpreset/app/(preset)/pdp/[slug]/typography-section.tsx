"use client"

import { useEffect, useRef, useState } from "react"

import { getFontDisplayName, getFontFamily } from "@/lib/preset"

type DnaTypographySectionProps = {
  bodyFont: string
  headingFont: string
}

const MAX_HEADING_PX = 128
const MIN_HEADING_PX = 24
const FIT_SAFETY_FACTOR = 0.97
const FIT_GUTTER_PX = 12

function AutoFitSingleLineText({
  text,
  fontFamily,
}: {
  text: string
  fontFamily: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fontSizePx, setFontSizePx] = useState(MAX_HEADING_PX)

  useEffect(() => {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    function measureTextWidth(sizePx: number) {
      if (!context) return 0
      context.font = `${sizePx}px ${fontFamily}`
      return context.measureText(text).width
    }

    function measure() {
      const container = containerRef.current
      if (!container) return

      const availableWidth = Math.max(1, container.clientWidth - FIT_GUTTER_PX)
      if (!availableWidth) return

      let low = MIN_HEADING_PX
      let high = MAX_HEADING_PX
      let best = MIN_HEADING_PX

      for (let i = 0; i < 14; i += 1) {
        const mid = (low + high) / 2
        const width = measureTextWidth(mid)
        if (width <= availableWidth * FIT_SAFETY_FACTOR) {
          best = mid
          low = mid
        } else {
          high = mid
        }
      }

      setFontSizePx(Math.floor(best))
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (containerRef.current) observer.observe(containerRef.current)
    const fontSet = document.fonts
    const onFontsDone = () => measure()
    fontSet?.addEventListener?.("loadingdone", onFontsDone)
    void fontSet?.ready.then(measure)
    return () => {
      observer.disconnect()
      fontSet?.removeEventListener?.("loadingdone", onFontsDone)
    }
  }, [text, fontFamily])

  return (
    <div ref={containerRef} className="line-clamp-1 w-full self-end pr-3">
      <span
        className="inline-block w-max leading-tight whitespace-nowrap"
        style={{ fontFamily, fontSize: `${fontSizePx}px` }}
      >
        {text}
      </span>
    </div>
  )
}

export function DnaTypographySection({
  bodyFont,
  headingFont,
}: DnaTypographySectionProps) {
  const bodyFontFamily = getFontFamily(bodyFont)
  const headingFontFamily = getFontFamily(headingFont)

  return (
    <div className="@container grid bg-muted">
      <section className="grid gap-16 p-[clamp(1rem,5cqw,3rem)]">
        <div className="min-w-0" style={{ fontFamily: bodyFontFamily }}>
          <p className="text-[clamp(1rem,10cqw,3rem)] leading-snug break-all">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
            !?@&£$¥%(){}[]:;,.+-=/\*&quot;&apos;
          </p>
        </div>

        <AutoFitSingleLineText
          text={getFontDisplayName(headingFont)}
          fontFamily={headingFontFamily}
        />
      </section>
    </div>
  )
}

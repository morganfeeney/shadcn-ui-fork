"use client"

import { getFontDisplayName, getFontFamily } from "@/lib/preset"

type DnaTypographySectionProps = {
  bodyFont: string
  headingFont: string
}

export function DnaTypographySection({
  bodyFont,
  headingFont,
}: DnaTypographySectionProps) {
  const bodyFontFamily = getFontFamily(bodyFont)
  const headingFontFamily = getFontFamily(headingFont)

  return (
    <section className="@container grid gap-6 bg-muted p-12">
      <div style={{ fontFamily: bodyFontFamily }}>
        <p className="text-[clamp(2rem,10cqw,3rem)] leading-snug break-all">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
          !?@&£$¥%(){}[]:;,.+-=/\*&quot;&apos;
        </p>
      </div>

      <p
        style={{ fontFamily: headingFontFamily }}
        className="self-end text-[clamp(4rem,20cqw,8rem)]"
      >
        {getFontDisplayName(headingFont)}
      </p>
    </section>
  )
}

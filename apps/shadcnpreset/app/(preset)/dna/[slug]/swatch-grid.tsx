"use client"

import type { SwatchCell } from "./swatch-utils"

type DnaSwatchGridProps = {
  rows: readonly (readonly SwatchCell[])[]
}

export function DnaSwatchGrid({ rows }: DnaSwatchGridProps) {
  return (
    <section>
      <div className="grid">
        {rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid md:grid-cols-[1fr_2fr]">
            {row.map((swatch) => (
              <div
                key={swatch.label}
                className="min-h-30 p-6 text-base tracking-tight"
                style={{
                  backgroundColor: `var(--${swatch.backgroundToken})`,
                  color: `var(--${swatch.textToken})`,
                }}
              >
                {swatch.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

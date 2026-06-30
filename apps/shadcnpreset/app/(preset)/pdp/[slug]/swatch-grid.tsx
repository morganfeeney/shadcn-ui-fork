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
          <div
            key={`row-${rowIndex}`}
            className="grid grid-cols-2 md:grid-cols-[1fr_2fr]"
          >
            {row.map((swatch) => (
              <div
                key={swatch.label}
                className="min-h-30 p-4 text-sm tracking-tight md:p-6 md:text-base"
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

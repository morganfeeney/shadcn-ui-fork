"use client"

import type { IconLibraryName } from "shadcn/icons"

import { IconPlaceholder } from "@/components/icon-placeholder"
import { PREVIEW_ICON_NAMES } from "@/components/preset-swatch/components/cards/icon-preview-grid"

type DnaIconSectionProps = {
  iconLibrary: IconLibraryName
}

const ICON_TILE_COUNT = 40

export function DnaIconSection({ iconLibrary }: DnaIconSectionProps) {
  return (
    <section className="overflow-hidden">
      <div className="grid grid-cols-5 gap-1 md:grid-cols-10">
        {Array.from({ length: ICON_TILE_COUNT }).map((_, index) => {
          const names = PREVIEW_ICON_NAMES[index % PREVIEW_ICON_NAMES.length]

          return (
            <div
              key={`${names.lucide}-${index}`}
              className="flex aspect-square items-center justify-center bg-muted/40 p-2"
            >
              <IconPlaceholder
                iconLibrary={iconLibrary}
                {...names}
                className="size-8 text-foreground"
                aria-hidden
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

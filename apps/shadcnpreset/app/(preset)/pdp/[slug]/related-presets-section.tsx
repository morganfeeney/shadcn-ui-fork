"use client"

import { useMemo } from "react"

import { HomePresetCarousel } from "@/app/(home)/components"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { resolvePresetFromCode, type ResolvedPreset } from "@/lib/preset"
import { getRelatedPresets } from "./related-presets"

type DnaRelatedPresetsSectionProps = {
  resolved: ResolvedPreset
}

const RELATED_TILE_COUNT = 6

export function DnaRelatedPresetsSection({
  resolved,
}: DnaRelatedPresetsSectionProps) {
  const relatedCodes = useMemo(
    () => getRelatedPresets(resolved, RELATED_TILE_COUNT),
    [resolved]
  )
  const relatedItems = useMemo(
    () =>
      relatedCodes.map((code) => {
        const related = resolvePresetFromCode(code)
        const description = related
          ? formatPresetCardDescription(related)
          : "Related preset"

        return { code, title: code, description }
      }),
    [relatedCodes]
  )

  return (
    <HomePresetCarousel
      className="rail-edge-safe-padding w-screen"
      items={relatedItems.map((item) => ({
        code: item.code,
        title: item.title,
        description: item.description,
      }))}
    />
  )
}

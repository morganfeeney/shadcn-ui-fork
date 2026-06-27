"use client"

import { useMemo } from "react"

import { HomePresetCarousel } from "@/app/(home)/components"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { resolvePresetFromCode, type ResolvedPreset } from "@/lib/preset"
import { getRelatedPresets } from "./related-presets"

type DnaRelatedPresetsSectionProps = {
  resolved: ResolvedPreset
}

const RELATED_TILE_COUNT = 12

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
      className="w-screen scroll-pr-[calc((var(--excess-width)/2))] scroll-pl-[calc((var(--excess-width)/2))] [&_[role=listitem]:first-child]:box-content [&_[role=listitem]:first-child]:pl-[calc((var(--excess-width)/2))] [&_[role=listitem]:last-child]:box-content [&_[role=listitem]:last-child]:pr-[calc((var(--excess-width)/2))]"
      items={relatedItems.map((item) => ({
        code: item.code,
        title: item.title,
        description: item.description,
      }))}
    />
  )
}

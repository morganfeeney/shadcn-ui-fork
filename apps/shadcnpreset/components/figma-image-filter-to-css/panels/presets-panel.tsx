"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DEFAULT_FILTERS,
  READY_MADE_FILTER_PRESETS,
} from "@/components/figma-image-filter-to-css/config"
import { getDirectCssFunctions } from "@/components/figma-image-filter-to-css/utils"
import type { FigmaImageFilterToolModel } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"
import { cn } from "@/lib/utils"

type PresetsPanelProps = {
  model: FigmaImageFilterToolModel
}

export function PresetsPanel({ model }: PresetsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Presets</CardTitle>
        <CardDescription>
          Pick a starting look, then continue editing with sliders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {READY_MADE_FILTER_PRESETS.map((preset) => {
            const previewFilter = getDirectCssFunctions({
              ...DEFAULT_FILTERS,
              ...preset.values,
            }).join(" ")
            const isActive = model.activePresetId === preset.id

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => model.applyPreset(preset)}
                className={cn(
                  "grid gap-2 text-left",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                )}
                aria-pressed={isActive}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.imageUrl}
                  alt={`${preset.name} preview`}
                  className={cn(
                    "aspect-square w-full max-w-30 rounded-md object-cover transition-colors",
                    isActive
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "ring-1 ring-border/60 hover:ring-border"
                  )}
                  style={{ filter: previewFilter }}
                />
                <span className="px-0.5 text-[11px] font-medium">
                  {preset.name}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

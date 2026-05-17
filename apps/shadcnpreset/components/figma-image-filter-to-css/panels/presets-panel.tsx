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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                  "overflow-hidden rounded-lg border text-left transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                  isActive
                    ? "border-primary ring-1 ring-primary/40"
                    : "border-border/60 hover:border-border"
                )}
                aria-pressed={isActive}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.imageUrl}
                  alt={`${preset.name} preview`}
                  className="h-16 w-full object-cover"
                  style={{ filter: previewFilter }}
                />
                <div className="grid gap-0.5 px-2 py-1.5">
                  <span className="text-xs font-medium">{preset.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {preset.description}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

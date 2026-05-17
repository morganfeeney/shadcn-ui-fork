"use client"

import { AlphaSlider, ColorArea, HueSlider } from "chromakit-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DEFAULT_FILTERS,
  FILTER_FIELDS,
  READY_MADE_FILTER_PRESETS,
} from "@/components/figma-image-filter-to-css/config"
import {
  formatFilterValue,
  getDirectCssFunctions,
} from "@/components/figma-image-filter-to-css/utils"
import type { FigmaImageFilterToolModel } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"
import { cn } from "@/lib/utils"

type FiltersPanelProps = {
  model: FigmaImageFilterToolModel
}

export function FiltersPanel({ model }: FiltersPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image filter values</CardTitle>
        <CardDescription>
          Use sliders to build a CSS filter chain.
        </CardDescription>
        <p className="text-sm text-muted-foreground">
          Figma mapping note: Exposure maps to CSS <code>brightness()</code>,
          Contrast maps to <code>contrast()</code>, and Saturation maps to{" "}
          <code>saturate()</code>.
        </p>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="preview-image-url">
                Preview image URL
              </FieldLabel>
              <FieldDescription>
                Use any image URL to test filters and overlay composition.
              </FieldDescription>
              <Input
                id="preview-image-url"
                value={model.imageUrl}
                onChange={(event) => model.setImageUrl(event.target.value)}
                placeholder="https://..."
              />
            </Field>

            <Field>
              <FieldLabel>Ready-made looks</FieldLabel>
              <FieldDescription>
                Choose a starting look, then fine-tune with sliders.
              </FieldDescription>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {READY_MADE_FILTER_PRESETS.map((preset) => {
                  const previewFilter = [
                    ...getDirectCssFunctions({
                      ...DEFAULT_FILTERS,
                      ...preset.values,
                    }),
                  ].join(" ")
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
                        <span className="text-xs font-medium">
                          {preset.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {preset.description}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Field>

            <FieldSet>
              <FieldLegend variant="label">Filter controls</FieldLegend>
              <FieldDescription>
                Every slider maps directly to a CSS filter function.
              </FieldDescription>
              <FieldGroup>
                {FILTER_FIELDS.map((field) => {
                  const value = model.filters[field.key]

                  return (
                    <Field key={field.key}>
                      <div className="flex items-center justify-between gap-2">
                        <FieldLabel htmlFor={`figma-filter-${field.key}`}>
                          {field.label}
                        </FieldLabel>
                        <span className="text-sm text-muted-foreground">
                          {formatFilterValue(field.key, value)}
                        </span>
                      </div>
                      <Slider
                        id={`figma-filter-${field.key}`}
                        aria-label={field.label}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={[value]}
                        onValueChange={(nextValue) => {
                          const valueToUse = Array.isArray(nextValue)
                            ? nextValue[0]
                            : nextValue
                          model.updateFilter(field.key, valueToUse ?? field.min)
                        }}
                      />
                    </Field>
                  )
                })}
              </FieldGroup>
            </FieldSet>

            <div className="rounded-lg border border-border/60 p-3">
              <FieldSet>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="include-overlay-snippet">
                    Include overlay
                  </FieldLabel>
                  <Switch
                    id="include-overlay-snippet"
                    checked={model.includeOverlay}
                    onCheckedChange={model.setIncludeOverlay}
                  />
                </Field>

                <FieldGroup>
                  <Field>
                    <FieldLabel>Overlay color</FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!model.includeOverlay}
                          />
                        }
                      >
                        <>
                          <span
                            className="size-4 rounded border border-black/15"
                            style={{
                              backgroundColor: model.overlayPreviewColor,
                            }}
                          />
                          <span className="truncate text-xs font-normal">
                            {model.overlaySource === "tailwind"
                              ? model.selectedOverlaySwatch.label
                              : model.overlayOklchColor}
                          </span>
                        </>
                      </PopoverTrigger>
                      <PopoverContent align="start">
                        <div className="w-105 p-3">
                          <Tabs defaultValue="custom">
                            <div className="w-full">
                              <TabsList>
                                <TabsTrigger value="custom">Custom</TabsTrigger>
                                <TabsTrigger value="tailwind-v4">
                                  Tailwind v4
                                </TabsTrigger>
                              </TabsList>
                            </div>
                            <TabsContent value="custom">
                              <div className="grid gap-2">
                                <div className="grid gap-2 rounded-md border border-border/60 p-2">
                                  <div className="grid grid-cols-[150px_1fr] gap-2">
                                    <ColorArea
                                      hsva={model.hsva}
                                      onChange={model.updateColor}
                                      width={150}
                                      height={150}
                                      className="aspect-video"
                                    />
                                    <div className="grid content-start gap-2">
                                      <HueSlider
                                        hsva={model.hsva}
                                        onChange={model.updateColor}
                                      />
                                      <AlphaSlider
                                        hsva={model.hsva}
                                        onChange={model.updateColor}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <Input
                                  value={model.overlayOklchColor}
                                  readOnly
                                />
                                <p className="text-xs text-muted-foreground">
                                  Custom color uses arbitrary Tailwind class
                                  output.
                                </p>
                              </div>
                            </TabsContent>
                            <TabsContent value="tailwind-v4">
                              <div className="grid gap-2">
                                <Input
                                  placeholder="Search colors, e.g. purple-700"
                                  value={model.tailwindColorSearch}
                                  onChange={(event) =>
                                    model.setTailwindColorSearch(
                                      event.target.value
                                    )
                                  }
                                />
                                <div className="max-h-[280px] overflow-y-auto rounded-md border border-border/60 p-2">
                                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {model.filteredTailwindPalette.map(
                                      (swatch) => {
                                        const isActive =
                                          model.overlayTailwindClassName ===
                                          swatch.className

                                        return (
                                          <button
                                            key={swatch.id}
                                            type="button"
                                            onClick={() => {
                                              model.setOverlaySource("tailwind")
                                              model.setOverlayTailwindClassName(
                                                swatch.className
                                              )
                                            }}
                                            className={cn(
                                              "grid gap-1 rounded-md border p-1.5 text-left transition-colors",
                                              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                                              isActive
                                                ? "border-primary ring-1 ring-primary/40"
                                                : "border-border/60 hover:border-border"
                                            )}
                                            aria-pressed={isActive}
                                          >
                                            <span
                                              className="h-7 rounded-sm border border-black/10"
                                              style={{
                                                backgroundColor: swatch.color,
                                              }}
                                            />
                                            <span className="text-[10px] leading-tight font-medium">
                                              {swatch.label}
                                            </span>
                                          </button>
                                        )
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={model.resetFilters}>
                Reset
              </Button>
            </div>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}

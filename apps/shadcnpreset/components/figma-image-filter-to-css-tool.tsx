"use client"
import "chromakit-react/chromakit.css"

import { Check, Copy } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_FILTERS,
  FILTER_FIELDS,
  READY_MADE_FILTER_PRESETS,
} from "@/components/figma-image-filter-to-css/config"
import {
  formatFigmaValue,
  getDirectCssFunctions,
} from "@/components/figma-image-filter-to-css/utils"
import { useFigmaImageFilterTool } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"
import { cn } from "@/lib/utils"

function CopyValueButton({
  value,
  copyKey,
  copiedKey,
  onCopy,
  label,
}: {
  value: string
  copyKey: string
  copiedKey: string | null
  onCopy: (value: string, key: string) => void
  label: string
}) {
  const copied = copiedKey === copyKey

  return (
    <div className="absolute top-3 right-3 z-10">
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={() => onCopy(value, copyKey)}
        aria-label={copied ? "Copied" : label}
        title={copied ? "Copied" : label}
      >
        {copied ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Copy className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  )
}

export function FigmaImageFilterToCssTool() {
  const model = useFigmaImageFilterTool()

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Figma filter values</CardTitle>
          <CardDescription>
            Enter values from Figma (-1 to +1) or drag sliders.
          </CardDescription>
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
                      ...(preset.cssExtras ?? []),
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
                  These controls map directly to CSS filter functions.
                </FieldDescription>
                <FieldGroup>
                  {FILTER_FIELDS.map((field) => {
                    const value = model.filters[field.key]

                    return (
                      <Field key={field.key}>
                        <FieldLabel htmlFor={`figma-filter-${field.key}`}>
                          {field.label}
                        </FieldLabel>
                        <FieldDescription>
                          {formatFigmaValue(value)}
                        </FieldDescription>
                        <input
                          id={`figma-filter-${field.key}`}
                          type="range"
                          min={-1}
                          max={1}
                          step={0.01}
                          value={value}
                          onChange={(event) =>
                            model.updateFilter(
                              field.key,
                              Number.parseFloat(event.target.value)
                            )
                          }
                          className="accent-primary"
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
                                  <TabsTrigger value="custom">
                                    Custom
                                  </TabsTrigger>
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
                                                model.setOverlaySource(
                                                  "tailwind"
                                                )
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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Applies converted CSS filters in real time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="overflow-hidden rounded-lg border border-border/60">
                <div
                  className={cn(
                    model.defaultContainerClassName || "relative aspect-square",
                    "overflow-hidden"
                  )}
                >
                  {model.includeOverlay ? (
                    <div
                      className={cn(
                        "absolute inset-0 z-30",
                        model.defaultOverlayBlendClassName
                      )}
                      style={{
                        opacity: model.defaultOverlayOpacity / 100,
                        backgroundColor: model.overlayPreviewColor,
                      }}
                    />
                  ) : null}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.imageUrl}
                    alt="Filter preview"
                    className={cn(
                      "h-full w-full object-cover",
                      model.defaultImageExtraClasses
                    )}
                    style={{ filter: model.cssFilterValue }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Active filter: <code>{model.cssFilterValue}</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>
              Copy direct CSS or Tailwind utility classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="relative">
                <CopyValueButton
                  value={model.cssSnippet}
                  copyKey="css"
                  copiedKey={model.copiedKey}
                  onCopy={model.handleCopy}
                  label="Copy CSS"
                />
                <Textarea readOnly value={model.cssSnippet} />
              </div>
              <div className="relative">
                <CopyValueButton
                  value={model.tailwindSnippet}
                  copyKey="tailwind"
                  copiedKey={model.copiedKey}
                  onCopy={model.handleCopy}
                  label="Copy Tailwind classes"
                />
                <Textarea readOnly value={model.tailwindSnippet} />
              </div>
              <div className="relative">
                <CopyValueButton
                  value={model.layeredJsxSnippet}
                  copyKey="layered-jsx"
                  copiedKey={model.copiedKey}
                  onCopy={model.handleCopy}
                  label="Copy layered JSX snippet"
                />
                <Textarea readOnly value={model.layeredJsxSnippet} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

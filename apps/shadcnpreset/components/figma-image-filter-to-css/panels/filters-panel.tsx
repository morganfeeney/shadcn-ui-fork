"use client"

import * as React from "react"
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FILTER_FIELDS } from "@/components/figma-image-filter-to-css/config"
import { formatFilterValue } from "@/components/figma-image-filter-to-css/utils"
import type { FigmaImageFilterToolModel } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"
import { cn } from "@/lib/utils"

type FiltersPanelProps = {
  model: FigmaImageFilterToolModel
}

export function FiltersPanel({ model }: FiltersPanelProps) {
  const tailwindPalette = model.tailwindPalette
  const tailwindGroups = React.useMemo(
    () =>
      Object.entries(
        tailwindPalette.reduce(
          (groups, swatch) => {
            if (!groups[swatch.family]) {
              groups[swatch.family] = []
            }
            groups[swatch.family].push(swatch)
            return groups
          },
          {} as Record<string, typeof tailwindPalette>
        )
      ),
    [tailwindPalette]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image filter values</CardTitle>
        <CardDescription>
          Use sliders to build a CSS filter chain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <FieldSet>
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
                      <PopoverContent align="start" className="w-100">
                        <div className="p-3">
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
                              <Command className="-mx-1 p-0">
                                <CommandInput placeholder="Search Tailwind colors" />
                                <CommandList className="max-h-70">
                                  <CommandEmpty>No colors found.</CommandEmpty>
                                  {tailwindGroups.map(([family, swatches]) => (
                                    <CommandGroup key={family} heading={family}>
                                      {swatches.map((swatch) => {
                                        const isActive =
                                          model.overlayTailwindClassName ===
                                          swatch.className

                                        return (
                                          <CommandItem
                                            key={swatch.id}
                                            value={swatch.label}
                                            keywords={[
                                              swatch.className,
                                              swatch.family,
                                            ]}
                                            onSelect={() => {
                                              model.setOverlaySource("tailwind")
                                              model.setOverlayTailwindClassName(
                                                swatch.className
                                              )
                                            }}
                                            data-checked={isActive}
                                            className={cn(
                                              "flex items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-colors",
                                              isActive
                                                ? "bg-accent text-accent-foreground"
                                                : "hover:bg-accent/40"
                                            )}
                                          >
                                            <span
                                              className="size-5 rounded-sm border border-black/10"
                                              style={{
                                                backgroundColor: swatch.color,
                                              }}
                                            />
                                            <span className="text-sm">
                                              {swatch.label}
                                            </span>
                                          </CommandItem>
                                        )
                                      })}
                                    </CommandGroup>
                                  ))}
                                </CommandList>
                              </Command>
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

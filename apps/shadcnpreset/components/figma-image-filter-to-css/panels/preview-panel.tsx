"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { FigmaImageFilterToolModel } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"
import { cn } from "@/lib/utils"

type PreviewPanelProps = {
  model: FigmaImageFilterToolModel
}

export function PreviewPanel({ model }: PreviewPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview image</CardTitle>
        <CardDescription>CSS filters are applied in real time.</CardDescription>
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
          <Field>
            <FieldLabel htmlFor="preview-image-url">Image source</FieldLabel>
            <Input
              id="preview-image-url"
              value={model.imageUrl}
              onChange={(event) => model.setImageUrl(event.target.value)}
              placeholder="https://..."
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}

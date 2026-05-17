"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FigmaImageFilterToolModel } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"
import { cn } from "@/lib/utils"

type PreviewPanelProps = {
  model: FigmaImageFilterToolModel
}

export function PreviewPanel({ model }: PreviewPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>Applies converted CSS filters in real time.</CardDescription>
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
                  className={cn("absolute inset-0 z-30", model.defaultOverlayBlendClassName)}
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
                className={cn("h-full w-full object-cover", model.defaultImageExtraClasses)}
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
  )
}

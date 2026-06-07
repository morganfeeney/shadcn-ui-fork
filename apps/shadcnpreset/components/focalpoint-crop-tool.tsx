"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  ASPECT_RATIO_PRESETS,
  getSliderSingleValue,
  toFixed,
} from "@/lib/focalpoint-crop"
import {
  FOCALPOINT_CROP_DEFAULTS,
  FOCALPOINT_SAMPLE_PHOTO_ID,
  FOCALPOINT_TOOL_DEFAULT_DESCRIPTION,
  FOCALPOINT_TOOL_DEFAULT_TITLE,
} from "@/lib/focalpoint-crop-config"
import { useFocalpointCropControls } from "@/hooks/use-focalpoint-crop-controls"
import { useFocalpointOverlay } from "@/hooks/use-focalpoint-overlay"

type FocalpointCropToolProps = {
  title?: string
  description?: string
}

export function FocalpointCropTool({
  title = FOCALPOINT_TOOL_DEFAULT_TITLE,
  description = FOCALPOINT_TOOL_DEFAULT_DESCRIPTION,
}: FocalpointCropToolProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const {
    photoId,
    setPhotoId,
    outputWidth,
    setOutputWidth,
    outputHeight,
    setOutputHeight,
    selectedAspectPreset,
    setSelectedAspectPreset,
    fpXPercent,
    setFpXPercent,
    fpYPercent,
    setFpYPercent,
    zoom,
    setZoom,
    copyLabel,
    imageSize,
    outputUrl,
    previewUrl,
    sourceImageUrl,
    unavailableState,
    isResetDisabled,
    handleCopy,
    handleAspectPresetChange,
    handleReset,
  } = useFocalpointCropControls({ isDragging })

  const fpX = fpXPercent / 100
  const fpY = fpYPercent / 100
  const fpZ = zoom
  const {
    cropOverlay,
    referenceFrameRef,
    handleOverlayPointerDown,
    handleResizePointerDown,
    handleOverlayPointerMove,
    handleOverlayPointerUp,
  } = useFocalpointOverlay({
    imageSize,
    outputWidth,
    outputHeight,
    fpXPercent,
    fpYPercent,
    zoom,
    setFpXPercent,
    setFpYPercent,
    setZoom,
    setSelectedAspectPreset,
    setOutputWidth,
    setOutputHeight,
    setIsDragging,
  })

  return (
    <SidebarProvider
      defaultOpen
      className="min-h-0 flex-1"
      style={
        {
          "--header-height": "52px",
        } as React.CSSProperties
      }
    >
      <Sidebar
        collapsible="none"
        className="md:sticky md:top-(--header-height) md:h-[calc(100svh-var(--header-height))]"
      >
        <SidebarHeader className="gap-1 p-4">
          <h1 className="text-sm font-semibold">{title}</h1>
          <p className="text-xs text-muted-foreground">{description}</p>
        </SidebarHeader>
        <SidebarContent className="px-4 pb-4">
          <FieldSet className="grid gap-4">
            <FieldGroup className="grid gap-2">
              <FieldLabel htmlFor="source-url">Unsplash photo ID</FieldLabel>
              <Input
                id="source-url"
                value={photoId}
                onChange={(event) => setPhotoId(event.target.value)}
                placeholder={FOCALPOINT_SAMPLE_PHOTO_ID}
              />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-3">
              <FieldGroup className="grid gap-2">
                <FieldLabel htmlFor="aspect-preset">Aspect ratio</FieldLabel>
                <Select
                  value={selectedAspectPreset}
                  onValueChange={handleAspectPresetChange}
                >
                  <SelectTrigger id="aspect-preset" className="w-full">
                    <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {ASPECT_RATIO_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>
              <FieldGroup className="grid gap-2">
                <FieldLabel htmlFor="output-width">Output width</FieldLabel>
                <Input
                  id="output-width"
                  type="number"
                  min={100}
                  value={outputWidth}
                  onChange={(event) => {
                    setSelectedAspectPreset("custom")
                    setOutputWidth(
                      Math.max(
                        100,
                        Number(event.target.value) ||
                          FOCALPOINT_CROP_DEFAULTS.outputWidth
                      )
                    )
                  }}
                />
              </FieldGroup>
            </div>

            <FieldGroup className="grid gap-2">
              <FieldLabel htmlFor="output-height">Output height</FieldLabel>
              <Input
                id="output-height"
                type="number"
                min={100}
                value={outputHeight}
                onChange={(event) => {
                  setSelectedAspectPreset("custom")
                  setOutputHeight(
                    Math.max(
                      100,
                        Number(event.target.value) ||
                          FOCALPOINT_CROP_DEFAULTS.outputHeight
                    )
                  )
                }}
              />
            </FieldGroup>

            <FieldGroup className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <FieldLabel>Focal X</FieldLabel>
                <span className="font-mono text-muted-foreground">
                  {toFixed(fpX, 3)}
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={0.1}
                value={[fpXPercent]}
                onValueChange={(value) =>
                  setFpXPercent(getSliderSingleValue(value, 50))
                }
              />
            </FieldGroup>

            <FieldGroup className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <FieldLabel>Focal Y</FieldLabel>
                <span className="font-mono text-muted-foreground">
                  {toFixed(fpY, 3)}
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={0.1}
                value={[fpYPercent]}
                onValueChange={(value) =>
                  setFpYPercent(getSliderSingleValue(value, 50))
                }
              />
            </FieldGroup>

            <FieldGroup className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <FieldLabel>Zoom (fp-z)</FieldLabel>
                <span className="font-mono text-muted-foreground">
                  {toFixed(fpZ, 2)}
                </span>
              </div>
              <Slider
                min={1}
                max={8}
                step={0.01}
                value={[zoom]}
                onValueChange={(value) =>
                  setZoom(getSliderSingleValue(value, 1))
                }
              />
            </FieldGroup>

            <FieldGroup className="grid gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  disabled={isResetDisabled}
                >
                  Reset
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="@container min-h-0 overflow-auto bg-muted md:h-[calc(100svh-var(--header-height))]">
        <div className="grid grid-cols-[200px_1fr_200px] items-start gap-4 p-4 pb-24">
          {unavailableState ? (
            <Empty className="col-start-2 min-h-[320px] self-start rounded-lg border bg-muted">
              <EmptyHeader>
                <EmptyTitle>{unavailableState.title}</EmptyTitle>
                <EmptyDescription>
                  {unavailableState.description}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="col-start-2 grid grid-cols-2 gap-4">
              <div
                ref={referenceFrameRef}
                className="relative self-start overflow-hidden border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sourceImageUrl}
                  alt=""
                  className="block h-auto w-full"
                  crossOrigin="anonymous"
                />
                {cropOverlay ? (
                  <div
                    className="absolute cursor-move touch-none border-2 border-red-500 shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.35)]"
                    style={{
                      left: `${cropOverlay.leftPercent}%`,
                      top: `${cropOverlay.topPercent}%`,
                      width: `${cropOverlay.widthPercent}%`,
                      height: `${cropOverlay.heightPercent}%`,
                    }}
                    onPointerDown={handleOverlayPointerDown}
                    onPointerMove={handleOverlayPointerMove}
                    onPointerUp={handleOverlayPointerUp}
                    onPointerCancel={handleOverlayPointerUp}
                  >
                    <div
                      className="absolute top-1/2 right-0 h-10 w-3 translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border border-red-600 bg-background/90"
                      onPointerDown={(event) =>
                        handleResizePointerDown(event, "resize-right")
                      }
                      onPointerMove={handleOverlayPointerMove}
                      onPointerUp={handleOverlayPointerUp}
                      onPointerCancel={handleOverlayPointerUp}
                    />
                    <div
                      className="absolute bottom-0 left-1/2 h-3 w-10 -translate-x-1/2 translate-y-1/2 cursor-ns-resize rounded-full border border-red-600 bg-background/90"
                      onPointerDown={(event) =>
                        handleResizePointerDown(event, "resize-bottom")
                      }
                      onPointerMove={handleOverlayPointerMove}
                      onPointerUp={handleOverlayPointerUp}
                      onPointerCancel={handleOverlayPointerUp}
                    />
                    <div
                      className="absolute top-0 left-0 size-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-xs border border-red-600 bg-background"
                      onPointerDown={(event) =>
                        handleResizePointerDown(event, "resize-top-left")
                      }
                      onPointerMove={handleOverlayPointerMove}
                      onPointerUp={handleOverlayPointerUp}
                      onPointerCancel={handleOverlayPointerUp}
                    />
                    <div
                      className="absolute right-0 bottom-0 size-4 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-xs border border-red-600 bg-background"
                      onPointerDown={(event) =>
                        handleResizePointerDown(event, "resize-corner")
                      }
                      onPointerMove={handleOverlayPointerMove}
                      onPointerUp={handleOverlayPointerUp}
                      onPointerCancel={handleOverlayPointerUp}
                    />
                  </div>
                ) : null}
              </div>

              <div className="relative self-start overflow-hidden border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || outputUrl}
                  alt=""
                  className="block h-auto w-full"
                />
              </div>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 px-4">
          <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-lg border bg-background/90 p-3 shadow-lg backdrop-blur">
            <div className="flex gap-2">
              <Input id="crop-url" readOnly value={outputUrl} />
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={!outputUrl}
              >
                {copyLabel}
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

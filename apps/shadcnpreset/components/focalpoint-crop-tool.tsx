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
  buildFocalpointUrl,
  buildUnsplashImageUrl,
  clamp,
  findAspectPresetByRatio,
  getSliderSingleValue,
  toFixed,
} from "@/lib/focalpoint-crop"

const DEFAULT_PHOTO_ID = "1691435828932-911a7801adfb"
const DEFAULT_OUTPUT_WIDTH = 1200
const DEFAULT_OUTPUT_HEIGHT = 1200
const DEFAULT_FP_X_PERCENT = 72
const DEFAULT_FP_Y_PERCENT = 62
const DEFAULT_ZOOM = 1.9

const DEFAULT_ASPECT_PRESET_ID = "1:1"

type FocalpointCropToolProps = {
  title?: string
  description?: string
}

type UnavailableState = {
  title: string
  description: React.ReactNode
}

export function FocalpointCropTool({
  title = "Unsplash focalpoint crop helper",
  description = "Tune focal point placement and zoom to generate Unsplash crop params.",
}: FocalpointCropToolProps) {
  const referenceFrameRef = React.useRef<HTMLDivElement>(null)
  const dragStateRef = React.useRef<{
    pointerId: number
    mode:
      | "move"
      | "resize-right"
      | "resize-bottom"
      | "resize-corner"
      | "resize-top-left"
    offsetXPercent: number
    offsetYPercent: number
    startWidthPercent: number
    startHeightPercent: number
    startCenterXPercent: number
    startCenterYPercent: number
    startXPercent: number
    startYPercent: number
  } | null>(null)
  const [photoId, setPhotoId] = React.useState(DEFAULT_PHOTO_ID)
  const [outputWidth, setOutputWidth] = React.useState(DEFAULT_OUTPUT_WIDTH)
  const [outputHeight, setOutputHeight] = React.useState(DEFAULT_OUTPUT_HEIGHT)
  const [selectedAspectPreset, setSelectedAspectPreset] = React.useState(
    DEFAULT_ASPECT_PRESET_ID
  )
  const [fpXPercent, setFpXPercent] = React.useState(DEFAULT_FP_X_PERCENT)
  const [fpYPercent, setFpYPercent] = React.useState(DEFAULT_FP_Y_PERCENT)
  const [zoom, setZoom] = React.useState(DEFAULT_ZOOM)
  const [copyLabel, setCopyLabel] = React.useState("Copy URL")
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 })
  const [imageLoadError, setImageLoadError] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState("")

  const fpX = fpXPercent / 100
  const fpY = fpYPercent / 100
  const fpZ = zoom
  const sourceImageUrl = React.useMemo(
    () => buildUnsplashImageUrl(photoId),
    [photoId]
  )
  const isMissingPhotoId = photoId.trim().length === 0
  const isInvalidPhotoId = photoId.trim().length > 0 && !sourceImageUrl
  const isUnavailablePhoto =
    !isInvalidPhotoId && !!sourceImageUrl && imageLoadError
  const unavailableState: UnavailableState | null = isMissingPhotoId
    ? {
        title: "Enter an Unsplash photo ID",
        description:
          "Paste a photo ID to generate the reference crop and preview.",
      }
    : isInvalidPhotoId
      ? {
          title: "Invalid Unsplash photo ID",
          description: (
            <>
              Paste the photo ID only, for example
              <span className="font-mono"> 1691435828932-911a7801adfb</span>.
            </>
          ),
        }
      : isUnavailablePhoto
        ? {
            title: "Photo not found",
            description:
              "We could not load this Unsplash photo ID. Check the ID and try again.",
          }
        : null

  const outputUrl = React.useMemo(
    () =>
      buildFocalpointUrl(
        sourceImageUrl,
        fpX,
        fpY,
        fpZ,
        outputWidth,
        outputHeight
      ),
    [sourceImageUrl, fpX, fpY, fpZ, outputWidth, outputHeight]
  )
  const previewSize = React.useMemo(() => {
    const maxEdge = 1000
    const maxDim = Math.max(outputWidth, outputHeight)
    if (!maxDim) return { width: 1000, height: 1000 }
    const ratio = Math.min(1, maxEdge / maxDim)
    return {
      width: Math.max(100, Math.round(outputWidth * ratio)),
      height: Math.max(100, Math.round(outputHeight * ratio)),
    }
  }, [outputHeight, outputWidth])
  const previewUrlCandidate = React.useMemo(
    () =>
      buildFocalpointUrl(
        sourceImageUrl,
        fpX,
        fpY,
        fpZ,
        previewSize.width,
        previewSize.height
      ),
    [fpX, fpY, fpZ, sourceImageUrl, previewSize.height, previewSize.width]
  )

  React.useEffect(() => {
    if (!previewUrlCandidate) return
    if (isDragging) return
    const timeoutId = window.setTimeout(() => {
      setPreviewUrl(previewUrlCandidate)
    }, 220)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isDragging, previewUrlCandidate])

  React.useEffect(() => {
    if (!previewUrl) {
      setPreviewUrl(previewUrlCandidate)
    }
  }, [previewUrl, previewUrlCandidate])

  React.useEffect(() => {
    if (!sourceImageUrl) {
      setImageSize({ width: 0, height: 0 })
      setImageLoadError(false)
      return
    }

    setImageLoadError(false)
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight })
      setImageLoadError(false)
    }
    image.onerror = () => {
      setImageSize({ width: 0, height: 0 })
      setImageLoadError(true)
    }
    image.src = sourceImageUrl
  }, [sourceImageUrl])

  const cropOverlay = React.useMemo(() => {
    const width = imageSize.width
    const height = imageSize.height
    if (!width || !height || !outputWidth || !outputHeight) {
      return null
    }

    const targetAspect = outputWidth / outputHeight
    const fullAspect = width / height
    const baseCropWidth =
      targetAspect > fullAspect ? width : height * targetAspect
    const baseCropHeight = baseCropWidth / targetAspect

    const cropWidth = clamp(baseCropWidth / fpZ, 1, width)
    const cropHeight = clamp(baseCropHeight / fpZ, 1, height)

    const centerX = fpX * width
    const centerY = fpY * height

    const left = clamp(centerX - cropWidth / 2, 0, width - cropWidth)
    const top = clamp(centerY - cropHeight / 2, 0, height - cropHeight)

    return {
      leftPercent: (left / width) * 100,
      topPercent: (top / height) * 100,
      widthPercent: (cropWidth / width) * 100,
      heightPercent: (cropHeight / height) * 100,
      centerXPercent: ((left + cropWidth / 2) / width) * 100,
      centerYPercent: ((top + cropHeight / 2) / height) * 100,
    }
  }, [
    fpX,
    fpY,
    fpZ,
    imageSize.height,
    imageSize.width,
    outputHeight,
    outputWidth,
  ])

  const updateFocalFromCenter = React.useCallback(
    (centerXPercent: number, centerYPercent: number) => {
      if (!cropOverlay) return

      const halfWidth = cropOverlay.widthPercent / 2
      const halfHeight = cropOverlay.heightPercent / 2
      const clampedCenterX = clamp(centerXPercent, halfWidth, 100 - halfWidth)
      const clampedCenterY = clamp(centerYPercent, halfHeight, 100 - halfHeight)

      setFpXPercent(clampedCenterX)
      setFpYPercent(clampedCenterY)
    },
    [cropOverlay]
  )

  const updateBoxSizeFromPercent = React.useCallback(
    (
      widthPercent: number,
      heightPercent: number,
      nextCenterPercent?: { x: number; y: number }
    ) => {
      const width = imageSize.width
      const height = imageSize.height
      if (!width || !height) return

      const nextWidthPx = clamp((widthPercent / 100) * width, 40, width)
      const nextHeightPx = clamp((heightPercent / 100) * height, 40, height)
      const nextAspect = nextWidthPx / nextHeightPx
      const fullAspect = width / height
      const nextZoom = clamp(
        nextAspect > fullAspect ? width / nextWidthPx : height / nextHeightPx,
        1,
        8
      )

      // Keep output dimensions stable-ish while matching dragged aspect ratio.
      const baseHeight = clamp(outputHeight, 100, 2400)
      let nextOutputWidth = Math.round(baseHeight * nextAspect)
      let nextOutputHeight = baseHeight
      if (nextOutputWidth < 100) {
        nextOutputWidth = 100
        nextOutputHeight = Math.round(nextOutputWidth / nextAspect)
      }
      if (nextOutputWidth > 4000) {
        nextOutputWidth = 4000
        nextOutputHeight = Math.round(nextOutputWidth / nextAspect)
      }
      nextOutputHeight = clamp(nextOutputHeight, 100, 4000)

      setZoom(nextZoom)
      const matchingPreset = findAspectPresetByRatio(
        nextOutputWidth,
        nextOutputHeight
      )
      setSelectedAspectPreset(matchingPreset?.id ?? "custom")
      setOutputWidth(nextOutputWidth)
      setOutputHeight(nextOutputHeight)
      if (nextCenterPercent) {
        setFpXPercent(clamp(nextCenterPercent.x, 0, 100))
        setFpYPercent(clamp(nextCenterPercent.y, 0, 100))
      }
    },
    [imageSize.height, imageSize.width, outputHeight]
  )

  function getPointerPercent(clientX: number, clientY: number) {
    const frame = referenceFrameRef.current
    if (!frame) return null
    const bounds = frame.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return null

    const xPercent = clamp(
      ((clientX - bounds.left) / bounds.width) * 100,
      0,
      100
    )
    const yPercent = clamp(
      ((clientY - bounds.top) / bounds.height) * 100,
      0,
      100
    )

    return { xPercent, yPercent }
  }

  function handleOverlayPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!cropOverlay) return

    const pointer = getPointerPercent(event.clientX, event.clientY)
    if (!pointer) return

    dragStateRef.current = {
      pointerId: event.pointerId,
      mode: "move",
      offsetXPercent: pointer.xPercent - cropOverlay.centerXPercent,
      offsetYPercent: pointer.yPercent - cropOverlay.centerYPercent,
      startWidthPercent: cropOverlay.widthPercent,
      startHeightPercent: cropOverlay.heightPercent,
      startCenterXPercent: cropOverlay.centerXPercent,
      startCenterYPercent: cropOverlay.centerYPercent,
      startXPercent: pointer.xPercent,
      startYPercent: pointer.yPercent,
    }
    setIsDragging(true)

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleResizePointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    mode: "resize-right" | "resize-bottom" | "resize-corner" | "resize-top-left"
  ) {
    event.stopPropagation()
    if (!cropOverlay) return

    const pointer = getPointerPercent(event.clientX, event.clientY)
    if (!pointer) return

    dragStateRef.current = {
      pointerId: event.pointerId,
      mode,
      offsetXPercent: 0,
      offsetYPercent: 0,
      startWidthPercent: cropOverlay.widthPercent,
      startHeightPercent: cropOverlay.heightPercent,
      startCenterXPercent: cropOverlay.centerXPercent,
      startCenterYPercent: cropOverlay.centerYPercent,
      startXPercent: pointer.xPercent,
      startYPercent: pointer.yPercent,
    }
    setIsDragging(true)

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleOverlayPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    const pointer = getPointerPercent(event.clientX, event.clientY)
    if (!pointer) return

    if (dragState.mode === "move") {
      updateFocalFromCenter(
        pointer.xPercent - dragState.offsetXPercent,
        pointer.yPercent - dragState.offsetYPercent
      )
      return
    }

    const deltaX = pointer.xPercent - dragState.startXPercent
    const deltaY = pointer.yPercent - dragState.startYPercent
    let constrainedWidth = dragState.startWidthPercent
    let constrainedHeight = dragState.startHeightPercent

    if (
      dragState.mode === "resize-right" ||
      dragState.mode === "resize-corner"
    ) {
      constrainedWidth = dragState.startWidthPercent + deltaX
    } else if (dragState.mode === "resize-top-left") {
      constrainedWidth = dragState.startWidthPercent - deltaX
    }

    if (
      dragState.mode === "resize-bottom" ||
      dragState.mode === "resize-corner"
    ) {
      constrainedHeight = dragState.startHeightPercent + deltaY
    } else if (dragState.mode === "resize-top-left") {
      constrainedHeight = dragState.startHeightPercent - deltaY
    }

    if (event.shiftKey && dragState.startHeightPercent > 0) {
      const startAspect =
        dragState.startWidthPercent / dragState.startHeightPercent

      if (dragState.mode === "resize-right") {
        constrainedHeight = constrainedWidth / startAspect
      } else if (dragState.mode === "resize-bottom") {
        constrainedWidth = constrainedHeight * startAspect
      } else if (dragState.mode === "resize-corner") {
        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
          constrainedHeight = constrainedWidth / startAspect
        } else {
          constrainedWidth = constrainedHeight * startAspect
        }
      } else if (dragState.mode === "resize-top-left") {
        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
          constrainedHeight = constrainedWidth / startAspect
        } else {
          constrainedWidth = constrainedHeight * startAspect
        }
      }
    }

    const widthDelta = constrainedWidth - dragState.startWidthPercent
    const heightDelta = constrainedHeight - dragState.startHeightPercent
    let nextCenterX = dragState.startCenterXPercent
    let nextCenterY = dragState.startCenterYPercent

    if (dragState.mode === "resize-right") {
      nextCenterX = dragState.startCenterXPercent + widthDelta / 2
    } else if (dragState.mode === "resize-bottom") {
      nextCenterY = dragState.startCenterYPercent + heightDelta / 2
    } else if (dragState.mode === "resize-corner") {
      nextCenterX = dragState.startCenterXPercent + widthDelta / 2
      nextCenterY = dragState.startCenterYPercent + heightDelta / 2
    } else if (dragState.mode === "resize-top-left") {
      nextCenterX = dragState.startCenterXPercent - widthDelta / 2
      nextCenterY = dragState.startCenterYPercent - heightDelta / 2
    }

    updateBoxSizeFromPercent(constrainedWidth, constrainedHeight, {
      x: nextCenterX,
      y: nextCenterY,
    })
  }

  function handleOverlayPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId !== event.pointerId) return
    dragStateRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  async function handleCopy() {
    if (!outputUrl) return
    try {
      await navigator.clipboard.writeText(outputUrl)
      setCopyLabel("Copied")
      window.setTimeout(() => setCopyLabel("Copy URL"), 1200)
    } catch {
      setCopyLabel("Copy failed")
      window.setTimeout(() => setCopyLabel("Copy URL"), 1500)
    }
  }

  function handleAspectPresetChange(value: string | null) {
    if (!value) return
    setSelectedAspectPreset(value)
    if (value === "custom") return
    const preset = ASPECT_RATIO_PRESETS.find((item) => item.id === value)
    if (!preset) return
    setOutputWidth(preset.width)
    setOutputHeight(preset.height)
  }

  function handleReset() {
    const defaultPreset = ASPECT_RATIO_PRESETS.find(
      (item) => item.id === DEFAULT_ASPECT_PRESET_ID
    )
    setPhotoId(DEFAULT_PHOTO_ID)
    setFpXPercent(DEFAULT_FP_X_PERCENT)
    setFpYPercent(DEFAULT_FP_Y_PERCENT)
    setZoom(DEFAULT_ZOOM)
    setSelectedAspectPreset(DEFAULT_ASPECT_PRESET_ID)
    setOutputWidth(defaultPreset?.width ?? DEFAULT_OUTPUT_WIDTH)
    setOutputHeight(defaultPreset?.height ?? DEFAULT_OUTPUT_HEIGHT)
    setCopyLabel("Copy URL")
    setPreviewUrl("")
  }

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
                placeholder="1691435828932-911a7801adfb"
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
                        Number(event.target.value) || DEFAULT_OUTPUT_WIDTH
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
                      Number(event.target.value) || DEFAULT_OUTPUT_HEIGHT
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
                <Button variant="secondary" onClick={handleReset}>
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

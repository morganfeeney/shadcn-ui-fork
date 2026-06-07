"use client"

import * as React from "react"

import {
  ASPECT_RATIO_PRESETS,
  buildFocalpointUrl,
  buildUnsplashImageUrl,
} from "@/lib/focalpoint-crop"
import {
  FOCALPOINT_COPY_LABEL,
  FOCALPOINT_CROP_DEFAULTS,
  FOCALPOINT_SAMPLE_PHOTO_ID,
  isFocalpointCropAtDefaults,
} from "@/lib/focalpoint-crop-config"

type UnavailableState = {
  title: string
  description: React.ReactNode
}

export function useFocalpointCropControls({ isDragging }: { isDragging: boolean }) {
  const [photoId, setPhotoId] = React.useState<string>(
    FOCALPOINT_CROP_DEFAULTS.photoId
  )
  const [outputWidth, setOutputWidth] = React.useState<number>(
    FOCALPOINT_CROP_DEFAULTS.outputWidth
  )
  const [outputHeight, setOutputHeight] = React.useState<number>(
    FOCALPOINT_CROP_DEFAULTS.outputHeight
  )
  const [selectedAspectPreset, setSelectedAspectPreset] = React.useState<string>(
    FOCALPOINT_CROP_DEFAULTS.aspectPresetId
  )
  const [fpXPercent, setFpXPercent] = React.useState<number>(
    FOCALPOINT_CROP_DEFAULTS.fpXPercent
  )
  const [fpYPercent, setFpYPercent] = React.useState<number>(
    FOCALPOINT_CROP_DEFAULTS.fpYPercent
  )
  const [zoom, setZoom] = React.useState<number>(FOCALPOINT_CROP_DEFAULTS.zoom)
  const [copyLabel, setCopyLabel] = React.useState<string>(FOCALPOINT_COPY_LABEL)
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 })
  const [imageLoadError, setImageLoadError] = React.useState(false)
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
  const isResetDisabled = isFocalpointCropAtDefaults({
    photoId,
    outputWidth,
    outputHeight,
    fpXPercent,
    fpYPercent,
    zoom,
    selectedAspectPreset,
  })

  const unavailableState: UnavailableState | null = isMissingPhotoId
    ? {
        title: "Enter an Unsplash photo ID",
        description: "Paste a photo ID to generate the reference crop and preview.",
      }
    : isInvalidPhotoId
      ? {
          title: "Invalid Unsplash photo ID",
          description: (
            <>
              Paste the photo ID only, for example
              <span className="font-mono"> {FOCALPOINT_SAMPLE_PHOTO_ID}</span>.
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

  const handleAspectPresetChange = React.useCallback((value: string | null) => {
    if (!value) return
    setSelectedAspectPreset(value)
    if (value === "custom") return
    const preset = ASPECT_RATIO_PRESETS.find((item) => item.id === value)
    if (!preset) return
    setOutputWidth(preset.width)
    setOutputHeight(preset.height)
  }, [])

  const handleReset = React.useCallback(() => {
    const defaultPreset = ASPECT_RATIO_PRESETS.find(
      (item) => item.id === FOCALPOINT_CROP_DEFAULTS.aspectPresetId
    )
    setPhotoId(FOCALPOINT_CROP_DEFAULTS.photoId)
    setFpXPercent(FOCALPOINT_CROP_DEFAULTS.fpXPercent)
    setFpYPercent(FOCALPOINT_CROP_DEFAULTS.fpYPercent)
    setZoom(FOCALPOINT_CROP_DEFAULTS.zoom)
    setSelectedAspectPreset(FOCALPOINT_CROP_DEFAULTS.aspectPresetId)
    setOutputWidth(defaultPreset?.width ?? FOCALPOINT_CROP_DEFAULTS.outputWidth)
    setOutputHeight(defaultPreset?.height ?? FOCALPOINT_CROP_DEFAULTS.outputHeight)
    setCopyLabel(FOCALPOINT_COPY_LABEL)
    setPreviewUrl("")
  }, [])

  const handleCopy = React.useCallback(async () => {
    if (!outputUrl) return
    try {
      await navigator.clipboard.writeText(outputUrl)
      setCopyLabel("Copied")
      window.setTimeout(() => setCopyLabel(FOCALPOINT_COPY_LABEL), 1200)
    } catch {
      setCopyLabel("Copy failed")
      window.setTimeout(() => setCopyLabel(FOCALPOINT_COPY_LABEL), 1500)
    }
  }, [outputUrl])

  return {
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
  }
}

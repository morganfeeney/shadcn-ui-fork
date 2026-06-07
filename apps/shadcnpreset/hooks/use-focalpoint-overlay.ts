"use client"

import * as React from "react"

import { clamp, findAspectPresetByRatio } from "@/lib/focalpoint-crop"

type ResizeMode =
  | "resize-right"
  | "resize-bottom"
  | "resize-corner"
  | "resize-top-left"

type DragMode = "move" | ResizeMode

type CropOverlay = {
  leftPercent: number
  topPercent: number
  widthPercent: number
  heightPercent: number
  centerXPercent: number
  centerYPercent: number
}

type UseFocalpointOverlayArgs = {
  imageSize: { width: number; height: number }
  outputWidth: number
  outputHeight: number
  fpXPercent: number
  fpYPercent: number
  zoom: number
  setFpXPercent: React.Dispatch<React.SetStateAction<number>>
  setFpYPercent: React.Dispatch<React.SetStateAction<number>>
  setZoom: React.Dispatch<React.SetStateAction<number>>
  setSelectedAspectPreset: React.Dispatch<React.SetStateAction<string>>
  setOutputWidth: React.Dispatch<React.SetStateAction<number>>
  setOutputHeight: React.Dispatch<React.SetStateAction<number>>
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
}

export function useFocalpointOverlay({
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
}: UseFocalpointOverlayArgs) {
  const referenceFrameRef = React.useRef<HTMLDivElement>(null)
  const dragStateRef = React.useRef<{
    pointerId: number
    mode: DragMode
    offsetXPercent: number
    offsetYPercent: number
    startWidthPercent: number
    startHeightPercent: number
    startCenterXPercent: number
    startCenterYPercent: number
    startXPercent: number
    startYPercent: number
  } | null>(null)

  const fpX = fpXPercent / 100
  const fpY = fpYPercent / 100
  const fpZ = zoom

  const cropOverlay = React.useMemo<CropOverlay | null>(() => {
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
  }, [fpX, fpY, fpZ, imageSize.height, imageSize.width, outputHeight, outputWidth])

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
    [cropOverlay, setFpXPercent, setFpYPercent]
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
    [
      imageSize.height,
      imageSize.width,
      outputHeight,
      setFpXPercent,
      setFpYPercent,
      setOutputHeight,
      setOutputWidth,
      setSelectedAspectPreset,
      setZoom,
    ]
  )

  function getPointerPercent(clientX: number, clientY: number) {
    const frame = referenceFrameRef.current
    if (!frame) return null
    const bounds = frame.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return null

    const xPercent = clamp(((clientX - bounds.left) / bounds.width) * 100, 0, 100)
    const yPercent = clamp(((clientY - bounds.top) / bounds.height) * 100, 0, 100)

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
    mode: ResizeMode
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

    if (dragState.mode === "resize-right" || dragState.mode === "resize-corner") {
      constrainedWidth = dragState.startWidthPercent + deltaX
    } else if (dragState.mode === "resize-top-left") {
      constrainedWidth = dragState.startWidthPercent - deltaX
    }

    if (dragState.mode === "resize-bottom" || dragState.mode === "resize-corner") {
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
      } else if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        constrainedHeight = constrainedWidth / startAspect
      } else {
        constrainedWidth = constrainedHeight * startAspect
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

  return {
    cropOverlay,
    referenceFrameRef,
    handleOverlayPointerDown,
    handleResizePointerDown,
    handleOverlayPointerMove,
    handleOverlayPointerUp,
  }
}

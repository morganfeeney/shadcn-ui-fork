"use client"

import * as React from "react"

import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type PresetV4ScaledFrameProps = {
  src: string
  title: string
  className?: string
  frameClassName?: string
  loadingOverlayClassName?: string
  hideFrameUntilLoaded?: boolean
  virtualWidth?: number
  virtualHeight?: number
}

export function PresetV4ScaledFrame({
  src,
  title,
  className,
  frameClassName,
  loadingOverlayClassName,
  hideFrameUntilLoaded = false,
  virtualWidth = 1400,
  virtualHeight = 700,
}: PresetV4ScaledFrameProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [loadedSrc, setLoadedSrc] = React.useState<string | null>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const [containerHeight, setContainerHeight] = React.useState(0)

  React.useEffect(() => {
    const node = wrapperRef.current
    if (!node) return

    const resizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries
      if (!entry) return
      setContainerWidth(entry.contentRect.width)
      setContainerHeight(entry.contentRect.height)
    })

    resizeObserver.observe(node)
    return () => resizeObserver.disconnect()
  }, [])

  const iframeLoaded = loadedSrc === src

  const scale = React.useMemo(() => {
    if (!containerWidth || !containerHeight) return 1
    return Math.min(containerWidth / virtualWidth, containerHeight / virtualHeight)
  }, [containerWidth, containerHeight, virtualWidth, virtualHeight])

  return (
    <div ref={wrapperRef} className={cn("relative h-full w-full overflow-hidden", className)}>
      <div
        className={cn(
          "absolute top-1/2 left-1/2 transition-opacity duration-150",
          hideFrameUntilLoaded && !iframeLoaded && "opacity-0"
        )}
        style={{
          width: virtualWidth,
          height: virtualHeight,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <PresetV4Frame
          title={title}
          src={src}
          className={cn("h-full w-full border-0", frameClassName)}
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => setLoadedSrc(src)}
        />
      </div>
      {!iframeLoaded ? (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/80",
            loadingOverlayClassName
          )}
        >
          <Spinner />
        </div>
      ) : null}
    </div>
  )
}

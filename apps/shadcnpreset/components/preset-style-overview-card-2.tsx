"use client"

import { usePathname } from "next/navigation"
import { HeartIcon, EyeIcon } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"

import useVote from "@/hooks/use-vote"
import { useIsMobile } from "@/hooks/use-mobile"
import { PresetPreviewDialog } from "@/components/preset-preview-dialog"
import { Button } from "@/components/ui/button"
import {
  trackAiAssistantResultClick,
  trackPresetPreview,
  trackPresetVoteClick,
} from "@/lib/analytics-events"
import { PresetCard2StyleOverview } from "@/components/preset-swatch/components/preset-card-2-style-overview"
import { Skeleton } from "@/components/ui/skeleton"

type PresetStyleOverviewCard2Props = {
  code: string
  title: string
  description: string
  virtualWidth?: number
  virtualHeight?: number
}

export function PresetStyleOverviewCard2({
  code,
  title,
  description,
  virtualWidth = 700,
  virtualHeight = 350,
}: PresetStyleOverviewCard2Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [shouldRender, setShouldRender] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const isMobile = useIsMobile()
  const pathname = usePathname()

  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return

    const resizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries
      if (entry) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    resizeObserver.observe(node)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return

    let intersectionObserver: IntersectionObserver | null = null

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)

        if (!isMobile && isVisible) {
          setShouldRender(true)
          intersectionObserver?.disconnect()
          return
        }

        setShouldRender(isVisible)
      },
      {
        rootMargin: isMobile ? "96px 0px" : "220px 0px",
        threshold: 0.01,
      }
    )
    intersectionObserver.observe(node)

    return () => intersectionObserver?.disconnect()
  }, [isMobile])

  const scale = useMemo(() => {
    if (!containerWidth) return 1
    return containerWidth / virtualWidth
  }, [containerWidth, virtualWidth])

  const canRenderPreview = shouldRender && containerWidth > 0

  const { toggleVote, voteCount, isVoting, hasVoted, authStatus } = useVote(
    code,
    {
      enabled: shouldRender,
    }
  )

  const isAssistantSurface = pathname.startsWith("/assistant")

  function handlePreview() {
    trackPresetPreview({ pagePath: pathname, presetCode: code })
    if (isAssistantSurface) {
      trackAiAssistantResultClick({
        pagePath: pathname,
        resultType: "action",
        targetId: `preview:${code}`,
      })
    }
    setPreviewOpen(true)
  }

  function handleVoteClick() {
    trackPresetVoteClick({ pagePath: pathname, presetCode: code })
    if (isAssistantSurface) {
      trackAiAssistantResultClick({
        pagePath: pathname,
        resultType: "action",
        targetId: `vote:${code}`,
      })
    }
    void toggleVote()
  }

  return (
    <div className="grid gap-0.5">
      <div
        ref={wrapperRef}
        className="pointer-events-none relative w-full rounded-sm"
        style={{ aspectRatio: `${virtualWidth} / ${virtualHeight}` }}
      >
        {canRenderPreview ? (
          <>
            <div
              className="absolute inset-0 p-0 will-change-transform"
              style={{
                width: virtualWidth,
                height: virtualHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <PresetCard2StyleOverview
                initialCode={code}
                className="h-full w-full overflow-auto"
              />
            </div>
          </>
        ) : (
          <Skeleton className="absolute inset-0 flex items-center justify-center" />
        )}
      </div>

      <PresetPreviewDialog
        code={code}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={title}
        description={description}
      />

      <div className="grid gap-3">
        <div className="flex w-full items-center justify-between gap-2">
          <div>
            <p className="truncate pl-2 font-mono text-xs font-medium">
              {title}
            </p>
          </div>
          <div className="flex items-center">
            <Button
              type="button"
              onClick={handlePreview}
              size="icon"
              variant="ghost"
            >
              <EyeIcon />
            </Button>
            <Button
              onClick={handleVoteClick}
              disabled={isVoting}
              aria-pressed={hasVoted}
              variant="ghost"
              className="gap-1"
              title={
                authStatus === "authenticated"
                  ? "Vote for this preset"
                  : "Sign in to vote"
              }
            >
              <HeartIcon />
              {voteCount}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

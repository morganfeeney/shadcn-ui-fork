"use client"

import { usePathname } from "next/navigation"
import { HeartIcon } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

import useVote from "@/hooks/use-vote"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  PresetPreviewDialog,
  type PresetPreviewStepItem,
} from "@/components/preset-preview/dialog"
import { PresetCard1StyleOverview } from "@/components/preset-swatch/components/preset-card-1-style-overview"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics-events"

type PresetStyleOverviewCardProps = {
  code: string
  title: string
  description: string
  previewStepOrder?: readonly PresetPreviewStepItem[]
  virtualWidth?: number
  virtualHeight?: number
  className?: string
}

export function PresetStyleOverviewCard({
  code,
  title,
  description,
  previewStepOrder,
  virtualWidth = 1400,
  virtualHeight = 700,
  className,
}: PresetStyleOverviewCardProps) {
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
        if (!isVisible) return
        setShouldRender(true)
        intersectionObserver?.disconnect()
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
    trackEvent("preset_preview", {
      page_path: pathname,
      preset_code: code,
    })
    trackEvent("preset_demo_dialog_open", {
      page_path: pathname,
      preset_code: code,
    })
    if (isAssistantSurface) {
      trackEvent("ai_assistant_result_click", {
        page_path: pathname,
        result_type: "action",
        target_id: `preview:${code}`,
      })
    }
    setPreviewOpen(true)
  }

  function handleVoteClick() {
    trackEvent("preset_vote_click", {
      page_path: pathname,
      preset_code: code,
    })
    if (isAssistantSurface) {
      trackEvent("ai_assistant_result_click", {
        page_path: pathname,
        result_type: "action",
        target_id: `vote:${code}`,
      })
    }
    void toggleVote()
  }

  return (
    <Card
      className={cn("gap-0 rounded-sm bg-background pt-0 ring-0", className)}
    >
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden rounded-sm border"
        style={{ aspectRatio: `${virtualWidth} / ${virtualHeight}` }}
      >
        {canRenderPreview ? (
          <>
            <CardContent
              className="pointer-events-none absolute inset-0 p-0"
              style={{
                width: virtualWidth,
                height: virtualHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <div className="size-full" inert>
                <PresetCard1StyleOverview
                  initialCode={code}
                  className="h-full w-full"
                />
              </div>
            </CardContent>
            <button
              type="button"
              className={cn(
                "absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-t-xl rounded-b-none border border-transparent bg-transparent p-0 transition-all outline-none select-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
              )}
              aria-label={`Open preview for ${title}`}
              onClick={handlePreview}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-linear-to-b from-foreground/20 to-background/20 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100"
              />
              <span className="pointer-events-none invisible relative z-10 group-hover/card:visible">
                <span className={cn(buttonVariants())}>Preview</span>
              </span>
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>

      <PresetPreviewDialog
        code={code}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={title}
        description={description}
        previewStepOrder={previewStepOrder}
      />

      <CardFooter className="grid justify-items-start gap-1 border-0 bg-background px-2 pt-2 pb-0">
        <div className="flex w-full justify-between gap-2">
          <div>
            <p className="truncate font-mono text-sm font-medium">{title}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <Button
          className="-ml-2"
          onClick={handleVoteClick}
          disabled={isVoting}
          aria-pressed={hasVoted}
          variant="ghost"
          title={
            authStatus === "authenticated"
              ? "Vote for this preset"
              : "Sign in to vote"
          }
        >
          <HeartIcon className="size-3.5" />
          {voteCount}
        </Button>
      </CardFooter>
    </Card>
  )
}

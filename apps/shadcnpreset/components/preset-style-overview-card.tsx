"use client"

import { usePathname } from "next/navigation"
import { HeartIcon } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

import useVote from "@/hooks/use-vote"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  PresetPreviewDialog,
  type PresetPreviewStepItem,
} from "@/components/preset-preview/dialog"
import { PresetV4ScaledFrame } from "@/components/preset-v4-scaled-frame"
import { PresetCard1StyleOverview } from "@/components/preset-swatch/components/preset-card-1-style-overview"
import { RouteScoped } from "@/components/route-scoped"
import { Button, buttonVariants } from "@/components/ui/button"
import { getPresetPreviewUrl } from "@/lib/preset"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics-events"

type PresetStyleOverviewCardProps = {
  code: string
  title: string
  description: string
  initialVoteCount?: number
  initialHasVoted?: boolean
  /**
   * `inline` — local React preview (default).
   * `v4-iframe` — scaled shadcn v4 create preview URL (same as PresetPreviewDialog /create).
   */
  previewVariant?: "inline" | "v4-iframe"
  previewStepOrder?: readonly PresetPreviewStepItem[]
  virtualWidth?: number
  virtualHeight?: number
  className?: string
}

type PresetStyleOverviewCardRootProps = React.ComponentProps<typeof Card>

type PresetStyleOverviewCardPreviewProps = {
  code: string
  title: string
  description: string
  previewVariant?: "inline" | "v4-iframe"
  previewStepOrder?: readonly PresetPreviewStepItem[]
  virtualWidth?: number
  virtualHeight?: number
}

const voteTapTransition = {
  type: "spring" as const,
  stiffness: 520,
  damping: 28,
}

const voteHeartEase = [0.22, 1.15, 0.36, 1] as [number, number, number, number]

/** Module-level targets so list re-renders / reorder never look like new animation props. */
const heartMotionRest = { scale: 1, rotate: 0 }

const heartMotionCelebrate = {
  scale: [1, 1.34, 1],
  rotate: [0, -18, 14, -10, 0],
  transition: {
    duration: 0.55,
    ease: voteHeartEase,
  },
}

export function PresetStyleOverviewCard({
  code,
  title,
  description,
  initialVoteCount,
  initialHasVoted,
  previewVariant = "inline",
  previewStepOrder,
  virtualWidth = 1400,
  virtualHeight = 700,
  className,
}: PresetStyleOverviewCardProps) {
  return (
    <PresetStyleOverviewCardRoot className={className}>
      <PresetStyleOverviewCardPreview
        code={code}
        title={title}
        description={description}
        previewVariant={previewVariant}
        previewStepOrder={previewStepOrder}
        virtualWidth={virtualWidth}
        virtualHeight={virtualHeight}
      />
      <PresetStyleOverviewCardDefaultFooter
        code={code}
        title={title}
        description={description}
        initialVoteCount={initialVoteCount}
        initialHasVoted={initialHasVoted}
      />
    </PresetStyleOverviewCardRoot>
  )
}

export function PresetStyleOverviewCardRoot({
  className,
  children,
  ...props
}: PresetStyleOverviewCardRootProps) {
  return (
    <Card
      className={cn("relative gap-0 rounded-sm bg-background pt-0 ring-0", className)}
      {...props}
    >
      <div className="relative z-10 flex flex-col">{children}</div>
    </Card>
  )
}

export function PresetStyleOverviewCardPreview({
  code,
  title,
  description,
  previewVariant = "inline",
  previewStepOrder,
  virtualWidth = 1400,
  virtualHeight = 700,
}: PresetStyleOverviewCardPreviewProps) {
  return (
    <RouteScoped scope={code}>
      <PresetStyleOverviewCardPreviewInner
        code={code}
        title={title}
        description={description}
        previewVariant={previewVariant}
        previewStepOrder={previewStepOrder}
        virtualWidth={virtualWidth}
        virtualHeight={virtualHeight}
      />
    </RouteScoped>
  )
}

function PresetStyleOverviewCardPreviewInner({
  code,
  title,
  description,
  previewVariant = "inline",
  previewStepOrder,
  virtualWidth = 1400,
  virtualHeight = 700,
}: PresetStyleOverviewCardPreviewProps) {
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

  const isV4Iframe = previewVariant === "v4-iframe"

  const previewSrc = useMemo(() => {
    if (!isV4Iframe) return null
    return getPresetPreviewUrl(code, "preview")
  }, [code, isV4Iframe])

  const scale = useMemo(() => {
    if (!containerWidth) return 1
    return containerWidth / virtualWidth
  }, [containerWidth, virtualWidth])

  const showV4UrlError =
    isV4Iframe && shouldRender && containerWidth > 0 && previewSrc === null

  const canRenderPreview = isV4Iframe
    ? shouldRender && containerWidth > 0 && previewSrc !== null
    : shouldRender && containerWidth > 0

  function handlePreview() {
    trackEvent("preset_preview", {
      page_path: pathname,
      preset_code: code,
    })
    trackEvent("preset_demo_dialog_open", {
      page_path: pathname,
      preset_code: code,
    })
    if (pathname.startsWith("/assistant")) {
      trackEvent("ai_assistant_result_click", {
        page_path: pathname,
        result_type: "action",
        target_id: `preview:${code}`,
      })
    }
    setPreviewOpen(true)
  }

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden rounded-sm border"
        style={{ aspectRatio: `${virtualWidth} / ${virtualHeight}` }}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 z-30 rounded-sm border border-transparent bg-transparent p-0 transition-all outline-none select-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
          )}
          aria-label={`Open preview for ${title}`}
          onClick={handlePreview}
        />
        {showV4UrlError ? (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Live preview URL could not be built for this preset code.
          </div>
        ) : canRenderPreview ? (
          isV4Iframe ? (
            <>
              <PresetV4ScaledFrame
                key={previewSrc}
                title={`v4 create preview · ${code}`}
                src={previewSrc!}
                virtualHeight={virtualHeight}
                virtualWidth={virtualWidth}
                className="absolute inset-0"
              />
              <div
                aria-hidden
                className="absolute inset-0 z-10 flex items-center justify-center rounded-t-xl rounded-b-none"
              >
                <span className="pointer-events-none absolute inset-0 bg-linear-to-b from-foreground/20 to-background/20 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100" />
                <span className="pointer-events-none invisible relative z-10 group-hover/card:visible">
                  <span className={cn(buttonVariants())}>Preview</span>
                </span>
              </div>
            </>
          ) : (
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
                  <PresetCard1StyleOverview initialCode={code} className="h-full w-full" />
                </div>
              </CardContent>
              <div
                aria-hidden
                className="absolute inset-0 z-10 flex items-center justify-center rounded-t-xl rounded-b-none"
              >
                <span className="pointer-events-none absolute inset-0 bg-linear-to-b from-foreground/20 to-background/20 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100" />
                <span className="pointer-events-none invisible relative z-10 group-hover/card:visible">
                  <span className={cn(buttonVariants())}>Preview</span>
                </span>
              </div>
            </>
          )
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
    </>
  )
}

export function PresetStyleOverviewCardFooter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter
      className={cn("grid justify-items-start gap-0.5 border-0 bg-background px-2 pt-2 pb-0", className)}
      {...props}
    >
      {children}
    </CardFooter>
  )
}

export function PresetStyleOverviewCardDefaultFooter({
  code,
  title,
  description,
  initialVoteCount,
  initialHasVoted,
}: {
  code: string
  title: string
  description: string
  initialVoteCount?: number
  initialHasVoted?: boolean
}) {
  /** Bumped only on this card's “add vote” click — not derived from `hasVoted` (reorder/async would replay). */
  const [voteCelebrateGeneration, setVoteCelebrateGeneration] = useState(0)
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const { toggleVote, voteCount, isVoting, hasVoted, authStatus } = useVote(code, {
    initialVotes: initialVoteCount,
    initialHasVoted,
  })

  function handleVoteClick() {
    trackEvent("preset_vote_click", {
      page_path: pathname,
      preset_code: code,
    })
    if (pathname.startsWith("/assistant")) {
      trackEvent("ai_assistant_result_click", {
        page_path: pathname,
        result_type: "action",
        target_id: `vote:${code}`,
      })
    }
    if (!hasVoted) {
      setVoteCelebrateGeneration((g) => g + 1)
    }
    void toggleVote()
  }

  return (
    <PresetStyleOverviewCardFooter>
      <div className="flex w-full justify-between gap-2">
        <div>
          <p className="truncate font-mono text-sm font-medium">{title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        className={cn(
          "pointer-events-auto -ml-2.5 rounded-full",
          hasVoted
            ? "bg-destructive/20 fill-destructive text-destructive"
            : "text-muted-foreground"
        )}
        onClick={handleVoteClick}
        disabled={isVoting}
        aria-pressed={hasVoted}
        variant="ghost"
        title={
          authStatus === "authenticated" ? "Vote for this preset" : "Sign in to vote"
        }
      >
        <motion.span
          className="inline-flex items-center gap-1.5"
          whileTap={
            reduceMotion || isVoting
              ? undefined
              : { scale: 0.88, transition: voteTapTransition }
          }
        >
          <motion.span
            key={voteCelebrateGeneration}
            className="inline-flex will-change-transform"
            initial={false}
            animate={
              reduceMotion || voteCelebrateGeneration === 0
                ? heartMotionRest
                : heartMotionCelebrate
            }
          >
            <HeartIcon className="size-3.5" weight={hasVoted ? "fill" : "regular"} />
          </motion.span>
          <span className="tabular-nums">{voteCount}</span>
        </motion.span>
      </Button>
    </PresetStyleOverviewCardFooter>
  )
}

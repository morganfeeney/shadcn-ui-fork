"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import { Shimmer } from "@/components/ai-elements/shimmer"
import {
  PresetStyleOverviewCardPreview,
  PresetStyleOverviewCardRoot,
} from "@/components/preset-style-overview-card"
import { cn } from "@/lib/utils"

export type HomeAiPreviewPreset = {
  code: string
  description: string
}

const CHAT_STEPS = [
  {
    key: "u-1",
    from: "user" as const,
    text: "Educational app for kids",
  },
  {
    key: "a-1",
    from: "assistant" as const,
    text: "Are you looking for a fun, vibrant style or something more educational and calm?",
  },
  {
    key: "u-2",
    from: "user" as const,
    text: "Fun · vibrant · playful",
  },
]

const CHAT_COPY = {
  thinking: "Thinking and matching presets...",
  summary:
    'Here are four presets matching the phrase "fun, vibrant, playful" using the Nova style with bright colors and rounded fonts.',
}

type TimelineAction =
  | { afterMs: number; type: "show-steps"; count: number }
  | { afterMs: number; type: "show-thinking" }
  | { afterMs: number; type: "show-summary" }
  | { afterMs: number; type: "show-cards"; count: number }

const CHAT_TIMELINE: TimelineAction[] = [
  // Conversation
  { afterMs: 350, type: "show-steps", count: 1 },
  { afterMs: 1100, type: "show-steps", count: 2 },
  { afterMs: 1300, type: "show-steps", count: 3 },
  // Assistant "thinking"
  { afterMs: 900, type: "show-thinking" },
  { afterMs: 2100, type: "show-summary" },
  // Result cards (slightly accelerating cadence feels more natural)
  { afterMs: 800, type: "show-cards", count: 1 },
  { afterMs: 470, type: "show-cards", count: 2 },
  { afterMs: 410, type: "show-cards", count: 3 },
  { afterMs: 360, type: "show-cards", count: 4 },
]

const VIEWPORT_THRESHOLD = 0.4

export function HomeAiChatPreview({
  presets,
  className,
}: {
  presets: HomeAiPreviewPreset[]
  className?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [visibleStepCount, setVisibleStepCount] = useState(0)
  const [showThinking, setShowThinking] = useState(false)
  const [showResults, setshowResults] = useState(false)
  const [visibleCards, setVisibleCards] = useState(0)

  const stepTransition = {
    duration: 0.52,
    ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  }

  useEffect(() => {
    const node = rootRef.current
    if (!node || hasStarted) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)
        if (!isVisible) return
        setHasStarted(true)
        observer.disconnect()
      },
      {
        threshold: VIEWPORT_THRESHOLD,
      }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let cancelled = false
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms))

    const runTimeline = async () => {
      for (const action of CHAT_TIMELINE) {
        await sleep(action.afterMs)
        if (cancelled) return
        switch (action.type) {
          case "show-steps":
            setVisibleStepCount(action.count)
            break
          case "show-thinking":
            setShowThinking(true)
            break
          case "show-summary":
            setShowThinking(false)
            setshowResults(true)
            break
          case "show-cards":
            setVisibleCards(action.count)
            break
        }
      }
    }

    void runTimeline()

    return () => {
      cancelled = true
    }
  }, [hasStarted])

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative grid h-full w-full content-start gap-6 overflow-hidden bg-background p-6",
        className
      )}
    >
      <div className="grid gap-6 text-[10px] leading-4 @2xl:text-xs">
        {CHAT_STEPS.slice(0, visibleStepCount).map((step) => (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={stepTransition}
          >
            <Message from={step.from}>
              <MessageContent>
                <MessageResponse>{step.text}</MessageResponse>
              </MessageContent>
            </Message>
          </motion.div>
        ))}
      </div>
      <div>
        {showThinking ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={stepTransition}
          >
            <Message from="assistant">
              <MessageContent className="w-full rounded-lg">
                <Shimmer className="text-xs">{CHAT_COPY.thinking}</Shimmer>
                <div className="mt-3 grid grid-cols-2 gap-3 @2xl:gap-5">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div
                      key={`pending-card-${index}`}
                      className="h-28 animate-pulse rounded-lg border border-border/60 bg-muted/30 @2xl:h-32"
                    />
                  ))}
                </div>
              </MessageContent>
            </Message>
          </motion.div>
        ) : null}

        {showResults ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={stepTransition}
          >
            <Message from="assistant">
              <MessageContent>
                <MessageResponse>{CHAT_COPY.summary}</MessageResponse>
                <div className="mt-3 grid grid-cols-2 gap-3 @2xl:gap-5">
                  {presets.slice(0, visibleCards).map((preset) => (
                    <PresetStyleOverviewCardRoot
                      key={preset.code}
                      className="pointer-events-none overflow-hidden motion-safe:animate-in motion-safe:duration-500 motion-safe:fade-in motion-safe:slide-in-from-bottom-1"
                    >
                      <PresetStyleOverviewCardPreview
                        code={preset.code}
                        title={preset.code}
                        description={preset.description}
                      />
                    </PresetStyleOverviewCardRoot>
                  ))}
                </div>
              </MessageContent>
            </Message>
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}

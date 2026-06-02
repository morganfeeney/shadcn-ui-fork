"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"

export type HomeAiPreviewPreset = {
  code: string
  description: string
}

const CHAT_STEPS = [
  {
    key: "u-1",
    from: "user" as const,
    text: "I want a modern look with tight spacing and muted colors",
  },
  {
    key: "a-1",
    from: "assistant" as const,
    text: "By modern, do you mean sleek and minimal or bold and vibrant?",
  },
  {
    key: "u-2",
    from: "user" as const,
    text: "Sleek, muted colors, tight spacing",
  },
]

const CHAT_COPY = {
  thinking: "Thinking and matching presets...",
  summary:
    "Here are four presets matching that direction using subtle tones and clean spacing.",
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
}: {
  presets: HomeAiPreviewPreset[]
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [visibleStepCount, setVisibleStepCount] = useState(0)
  const [showThinking, setShowThinking] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
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
            setShowSummary(true)
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
      className="relative aspect-square overflow-hidden bg-[#d8d4cf] p-4 @2xl:p-5 dark:bg-zinc-600"
    >
      <div className="relative grid h-full w-full items-start gap-6 overflow-hidden rounded-xl bg-background p-3">
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
          <AnimatePresence mode="wait">
            {showThinking ? (
              <motion.div
                key="thinking"
                className="mt-3"
                initial={{ opacity: 0, y: 8, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={stepTransition}
              >
                <Message from="assistant">
                  <MessageContent className="w-full rounded-lg border border-border/60 p-3">
                    <Shimmer className="text-xs">{CHAT_COPY.thinking}</Shimmer>
                  </MessageContent>
                </Message>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {showSummary ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={stepTransition}
            >
              <Message from="assistant" className="max-w-full">
                <MessageContent>
                  <MessageResponse>{CHAT_COPY.summary}</MessageResponse>
                </MessageContent>
              </Message>
            </motion.div>
          ) : null}

          <div className="mt-3 grid grid-cols-2 gap-2 @2xl:mt-4 @2xl:gap-3">
            {presets.slice(0, visibleCards).map((preset) => (
              <PresetStyleOverviewCard
                key={preset.code}
                code={preset.code}
                title={preset.code}
                description={preset.description}
                className="pointer-events-none overflow-hidden motion-safe:animate-in motion-safe:duration-500 motion-safe:fade-in motion-safe:slide-in-from-bottom-1"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

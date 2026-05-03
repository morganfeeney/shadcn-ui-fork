"use client"

import { useCallback, useEffect, useLayoutEffect, useState } from "react"

export type PresetPreviewStepItem = {
  code: string
  title: string
  description?: string
}

/** Featured rail and similar: one shared order for preset preview stepping. */
export function buildPreviewStepOrder<
  T extends { code: string; title: string; description?: string },
>(items: readonly T[]): readonly PresetPreviewStepItem[] | undefined {
  if (items.length < 2) return undefined
  return items.map(({ code, title, description }) => ({
    code,
    title,
    description,
  }))
}

type UsePresetPreviewStepOptions = {
  open: boolean
  fromCard: { code: string; title: string; description?: string }
  previewStepOrder?: readonly PresetPreviewStepItem[]
  afterStep?: () => void
}

export function usePresetPreviewStep({
  open,
  fromCard,
  previewStepOrder,
  afterStep,
}: UsePresetPreviewStepOptions) {
  const { code, title, description } = fromCard
  const [viewCode, setViewCode] = useState(code)

  useLayoutEffect(() => {
    if (!open) return
    setViewCode(code)
  }, [open, code])

  const canStep =
    !!(previewStepOrder && previewStepOrder.length > 1 && open)

  const stepMeta =
    previewStepOrder?.find((p) => p.code === viewCode) ?? undefined
  const displayTitle = stepMeta?.title ?? title
  const displayDesc = stepMeta?.description ?? description

  const stepIndex =
    previewStepOrder?.findIndex((p) => p.code === viewCode) ?? -1
  const canPrev = canStep && stepIndex > 0
  const canNext =
    canStep &&
    previewStepOrder !== undefined &&
    stepIndex >= 0 &&
    stepIndex < previewStepOrder.length - 1

  const stepPreset = useCallback(
    (delta: -1 | 1) => {
      if (!previewStepOrder || previewStepOrder.length < 2 || stepIndex < 0)
        return
      const n = stepIndex + delta
      if (n < 0 || n >= previewStepOrder.length) return
      setViewCode(previewStepOrder[n]!.code)
      afterStep?.()
    },
    [previewStepOrder, stepIndex, afterStep]
  )

  useEffect(() => {
    if (!canStep) return
    const rtl = document.documentElement.dir === "rtl"
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return
      const tag = (e.target as HTMLElement | null)?.tagName ?? ""
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        stepPreset(rtl ? 1 : -1)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        stepPreset(rtl ? -1 : 1)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [canStep, stepPreset])

  return {
    viewCode,
    displayTitle,
    displayDesc,
    canStep,
    canPrev,
    canNext,
    stepPreset,
  }
}

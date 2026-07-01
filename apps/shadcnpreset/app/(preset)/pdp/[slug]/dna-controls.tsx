"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CaretLeftIcon,
  CaretRightIcon,
  ShuffleIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react"
import { useMemo, type MouseEvent } from "react"

import { PresetVoteButton } from "@/components/preset-vote-button"
import { buttonVariants } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import type { ResolvedPreset } from "@/lib/preset"
import { generateRandomCompatiblePreset } from "@/lib/random-preset"

import { getRelatedPresets } from "./related-presets"
import { cn } from "@/lib/utils"

type DnaControlsProps = {
  resolved: ResolvedPreset
  className?: string
}

export function DnaControls({ resolved, className }: DnaControlsProps) {
  const router = useRouter()
  const navCodes = useMemo(() => {
    const related = getRelatedPresets(resolved, 12).filter(
      (code) => code !== resolved.code
    )
    return [resolved.code, ...related]
  }, [resolved])

  const canCyclePresets = navCodes.length > 1
  const prevCode = canCyclePresets ? navCodes[navCodes.length - 1]! : null
  const nextCode = canCyclePresets ? navCodes[1]! : null

  function navigateToPreset(code: string) {
    // Avoid browser restoring focus to sticky footer controls after nav,
    // which can scroll the new PDP down to this section.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    // Keep current scroll position across PDP-to-PDP navigation.
    // This avoids browser-specific focus/anchor jumps (notably Safari).
    router.push(`/pdp/${code}`, { scroll: false })
  }

  function preventPointerFocus(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
  }

  function onRandomPreset() {
    const code = generateRandomCompatiblePreset()
    navigateToPreset(code)
  }

  function onPreviousPreset() {
    if (!prevCode) return
    navigateToPreset(prevCode)
  }

  function onNextPreset() {
    if (!nextCode) return
    navigateToPreset(nextCode)
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 bg-background p-1.5",
        "rounded-xl border bg-background/95 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <InputGroup className="w-auto">
        <InputGroupAddon align="inline-start" className="gap-0 px-0">
          <InputGroupButton
            size="icon-sm"
            onMouseDown={preventPointerFocus}
            onClick={onPreviousPreset}
            disabled={!canCyclePresets}
            aria-label="Previous related preset"
          >
            <CaretLeftIcon className="size-4" />
          </InputGroupButton>
          <InputGroupButton
            size="icon-sm"
            onMouseDown={preventPointerFocus}
            onClick={onRandomPreset}
            aria-label="Random preset"
          >
            <ShuffleIcon className="size-4" />
          </InputGroupButton>
          <InputGroupButton
            size="icon-sm"
            onMouseDown={preventPointerFocus}
            onClick={onNextPreset}
            disabled={!canCyclePresets}
            aria-label="Next related preset"
          >
            <CaretRightIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <PresetVoteButton code={resolved.code} />
      <Link
        href={`/preset/${resolved.code}`}
        className={buttonVariants({ variant: "outline" })}
      >
        Edit
        <SlidersHorizontalIcon className="size-4" />
      </Link>
    </div>
  )
}

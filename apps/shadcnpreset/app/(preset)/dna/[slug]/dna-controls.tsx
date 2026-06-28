"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CaretLeftIcon,
  CaretRightIcon,
  ShuffleIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react"
import { useMemo } from "react"

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

  function onRandomPreset() {
    const code = generateRandomCompatiblePreset()
    router.push(`/dna/${code}`)
  }

  function onPreviousPreset() {
    if (!prevCode) return
    router.push(`/dna/${prevCode}`)
  }

  function onNextPreset() {
    if (!nextCode) return
    router.push(`/dna/${nextCode}`)
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 bg-background p-1.5",
        className
      )}
    >
      <InputGroup className="w-auto">
        <InputGroupAddon align="inline-start" className="gap-0 px-0">
          <InputGroupButton
            size="icon-sm"
            onClick={onPreviousPreset}
            disabled={!canCyclePresets}
            aria-label="Previous related preset"
          >
            <CaretLeftIcon className="size-4" />
          </InputGroupButton>
          <InputGroupButton
            size="icon-sm"
            onClick={onRandomPreset}
            aria-label="Random preset"
          >
            <ShuffleIcon className="size-4" />
          </InputGroupButton>
          <InputGroupButton
            size="icon-sm"
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

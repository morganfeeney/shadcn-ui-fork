"use client"

import Link from "next/link"
import * as React from "react"

import { PresetVoteButton } from "@/components/preset-vote-button"
import { copyToClipboardWithMeta } from "@/components/copy-button"
import { Button, buttonVariants } from "@/components/ui/button"

import { usePresetPageLiveOptional } from "@/components/preset-page-live-context"
import { InfoIcon, CopyIcon, CheckIcon, ShareIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function PresetCodeTitle({ presetCode }: { presetCode: string }) {
  const live = usePresetPageLiveOptional()
  const displayCode = live?.livePresetCode ?? presetCode
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const handleCopy = React.useCallback(() => {
    copyToClipboardWithMeta(displayCode, {
      name: "copy_preset_code",
      properties: { preset: displayCode },
    })
    setHasCopied(true)
  }, [displayCode])

  return (
    <h1 className="flex items-center gap-1.5 font-mono text-lg text-foreground md:text-2xl">
      <span className="min-w-0 truncate">{displayCode}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
        aria-label={hasCopied ? "Copied" : "Copy preset code"}
      >
        {hasCopied ? (
          <CheckIcon aria-hidden className="size-4" />
        ) : (
          <CopyIcon aria-hidden className="size-4" />
        )}
      </Button>
    </h1>
  )
}

export function PresetButtons({ preset }: { preset: string }) {
  const live = usePresetPageLiveOptional()
  const effectivePreset = live?.canonicalPresetCode ?? preset
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const handleShare = React.useCallback(() => {
    const url = window.location.href
    copyToClipboardWithMeta(url, {
      name: "copy_preset_share_url",
      properties: { url, preset: effectivePreset },
    })
    setHasCopied(true)
  }, [effectivePreset])

  return (
    <>
      <PresetVoteButton code={effectivePreset} />
      <Link
        href={`/pdp/${effectivePreset}`}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Details <InfoIcon />
      </Link>
      <Button variant="outline" onClick={handleShare}>
        {hasCopied ? "Copied" : "Share"}
        {hasCopied ? (
          <CheckIcon aria-hidden className="size-4" />
        ) : (
          <ShareIcon aria-hidden className="size-4" />
        )}
      </Button>
    </>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { copyToClipboardWithMeta } from "@/components/copy-button"
import { Button } from "@/styles/base-nova/ui/button"
import { useCreateShareUrl } from "@/app/(app)/create/components/shadcnpreset-fork/preset-share-url"

export function CopyUrl({ className }: React.ComponentProps<typeof Button>) {
  const shareUrl = useCreateShareUrl()
  const [hasCopied, setHasCopied] = React.useState(false)
  const label = hasCopied ? "Copied" : "Copy URL"

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const handleCopy = React.useCallback(async () => {
    const copied = await copyToClipboardWithMeta(shareUrl, {
      name: "copy_create_share_url",
      properties: {
        url: shareUrl,
      },
    })

    if (copied) {
      setHasCopied(true)
    }
  }, [shareUrl])

  return (
    <Button
      variant="outline"
      type="button"
      onMouseDown={(event) => {
        // Keep focus out of the scrollable customizer footer in production/embed.
        event.preventDefault()
      }}
      onClick={handleCopy}
      title={label}
      className={cn(
        "touch-manipulation bg-transparent! px-2! py-0! text-sm! transition-none select-none hover:bg-muted! pointer-coarse:h-10!",
        className
      )}
    >
      <span className="block min-w-0 truncate">{label}</span>
    </Button>
  )
}

"use client"

import * as React from "react"

import { CMD_K_FORWARD_TYPE } from "@/app/(app)/(create)/components/action-menu"
import { CreateDevtools } from "@/app/(app)/(create)/components/create-devtools"
import {
  REDO_FORWARD_TYPE,
  UNDO_FORWARD_TYPE,
} from "@/app/(app)/(create)/components/history-buttons"
import { DARK_MODE_FORWARD_TYPE } from "@/app/(app)/(create)/components/mode-switcher"
import { PreviewSwitcher } from "@/app/(app)/(create)/components/preview-switcher"
import { RANDOMIZE_FORWARD_TYPE } from "@/app/(app)/(create)/components/random-button"
import { sendToIframe } from "@/app/(app)/(create)/hooks/use-iframe-sync"
import { OPEN_PRESET_FORWARD_TYPE } from "@/app/(app)/(create)/hooks/use-open-preset"
import { RESET_FORWARD_TYPE } from "@/app/(app)/(create)/hooks/use-reset"
import {
  mergeCustomColorsFromLocation,
  serializeDesignSystemSearchParams,
  useDesignSystemSearchParams,
} from "@/app/(app)/(create)/lib/search-params"

// Hoisted — avoids recreating on every message event. (js-hoist-regexp)
const MAC_REGEX = /Mac|iPhone|iPad|iPod/

export function Preview() {
  const [params] = useDesignSystemSearchParams()
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) {
      return
    }

    const sendParams = () => {
      sendToIframe(iframe, "design-system-params", params)
    }

    if (iframe.contentWindow) {
      sendParams()
    }

    iframe.addEventListener("load", sendParams)
    return () => {
      iframe.removeEventListener("load", sendParams)
    }
  }, [params])

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const iframeWindow = iframeRef.current?.contentWindow
      if (
        !iframeWindow ||
        event.origin !== window.location.origin ||
        event.source !== iframeWindow ||
        !event.data ||
        typeof event.data !== "object"
      ) {
        return
      }

      const type = event.data.type
      if (type === CMD_K_FORWARD_TYPE) {
        const isMac = MAC_REGEX.test(navigator.userAgent)
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: event.data.key || "k",
            metaKey: isMac,
            ctrlKey: !isMac,
            bubbles: true,
            cancelable: true,
          })
        )
      } else if (type === RANDOMIZE_FORWARD_TYPE) {
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: event.data.key || "r",
            bubbles: true,
            cancelable: true,
          })
        )
      } else if (type === OPEN_PRESET_FORWARD_TYPE) {
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: event.data.key || "o",
            bubbles: true,
            cancelable: true,
          })
        )
      } else if (type === UNDO_FORWARD_TYPE) {
        const isMac = MAC_REGEX.test(navigator.userAgent)
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "z",
            metaKey: isMac,
            ctrlKey: !isMac,
            bubbles: true,
            cancelable: true,
          })
        )
      } else if (type === REDO_FORWARD_TYPE) {
        const isMac = MAC_REGEX.test(navigator.userAgent)
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "z",
            shiftKey: true,
            metaKey: isMac,
            ctrlKey: !isMac,
            bubbles: true,
            cancelable: true,
          })
        )
      } else if (type === RESET_FORWARD_TYPE) {
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "R",
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          })
        )
      } else if (type === DARK_MODE_FORWARD_TYPE) {
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: event.data.key || "d",
            bubbles: true,
            cancelable: true,
          })
        )
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const [iframeSrc, setIframeSrc] = React.useState<string | null>(null)

  React.useLayoutEffect(() => {
    setIframeSrc(
      serializeDesignSystemSearchParams(
        `/preview/${params.base}/${params.item}`,
        mergeCustomColorsFromLocation(params)
      )
    )
    // Custom color changes after load are synced via postMessage, not iframe reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.base, params.item])

  return (
    <div className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-2xl ring ring-foreground/10 md:ring-muted dark:ring-foreground/10">
      <div className="relative z-0 mx-auto flex w-full flex-1 flex-col overflow-hidden">
        <div className="absolute inset-0 bg-muted dark:bg-muted/30" />
        {iframeSrc ? (
          <iframe
            key={params.base + params.item}
            ref={iframeRef}
            src={iframeSrc}
            className="z-10 size-full flex-1"
            title="Preview"
          />
        ) : null}
      </div>
      <CreateDevtools />
      <PreviewSwitcher />
    </div>
  )
}

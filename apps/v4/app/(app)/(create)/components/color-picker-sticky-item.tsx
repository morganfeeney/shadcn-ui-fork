"use client"

import * as React from "react"
import Oklume from "oklume"

import { cn } from "@/registry/bases/base/lib/utils"
import { PickerSeparator } from "@/app/(app)/create/components/picker"
import { parseOklch } from "@/app/(app)/create/lib/oklch"

export function shouldKeepPickerOpenForOklume(eventDetails: {
  reason: string
  event: Event
  cancel: () => void
}) {
  if (isOklumeCompactPopupOpen()) {
    return true
  }

  if (
    eventDetails.reason !== "outsidePress" &&
    eventDetails.reason !== "focusOut"
  ) {
    return false
  }

  const target = eventDetails.event?.target
  return (
    target instanceof Element && Boolean(target.closest(".oklume--compact"))
  )
}

export function isOklumeCompactPopupOpen() {
  if (typeof document === "undefined") {
    return false
  }

  return Boolean(document.querySelector(".oklume--compact.oklume--open"))
}

export function ColorPickerStickyItem({
  value,
  defaultColor,
  onColorChange,
}: {
  value?: string | null
  defaultColor?: string | null
  onColorChange?: (color: string) => void
}) {
  const compactPickerContainerRef = React.useRef<HTMLDivElement>(null)
  const hiddenTriggerRef = React.useRef<HTMLButtonElement>(null)
  const pickerRef = React.useRef<Oklume | null>(null)
  const isInitializingRef = React.useRef(true)
  const latestValueRef = React.useRef(value)
  const latestDefaultColorRef = React.useRef(defaultColor)
  const onColorChangeRef = React.useRef(onColorChange)
  const [selectedColor, setSelectedColor] = React.useState<string | null>(
    value ?? null
  )

  React.useEffect(() => {
    latestValueRef.current = value
  }, [value])

  React.useEffect(() => {
    latestDefaultColorRef.current = defaultColor
  }, [defaultColor])

  React.useEffect(() => {
    setSelectedColor(value ?? null)

    const picker = pickerRef.current
    const parsed = parseOklch(value ?? defaultColor)
    if (!picker || !parsed) {
      return
    }

    isInitializingRef.current = true
    picker.setColor(parsed.l, parsed.c, parsed.h)
    isInitializingRef.current = false
  }, [value, defaultColor])

  React.useEffect(() => {
    onColorChangeRef.current = onColorChange
  }, [onColorChange])

  const syncPickerColor = React.useCallback(() => {
    const picker = pickerRef.current
    const parsed = parseOklch(
      latestValueRef.current ?? latestDefaultColorRef.current
    )

    if (!picker || !parsed) {
      return
    }

    isInitializingRef.current = true
    picker.setColor(parsed.l, parsed.c, parsed.h)
    isInitializingRef.current = false
  }, [])

  React.useEffect(() => {
    if (!compactPickerContainerRef.current || !hiddenTriggerRef.current) {
      return
    }

    const picker = new Oklume(compactPickerContainerRef.current, {
      mode: "compact",
      trigger: hiddenTriggerRef.current,
      showFormats: ["oklch", "hex"],
      onChange: (color) => {
        if (isInitializingRef.current) {
          return
        }

        setSelectedColor(color.oklch)
        onColorChangeRef.current?.(color.oklch)
      },
    })

    const parsed = parseOklch(
      latestValueRef.current ?? latestDefaultColorRef.current
    )
    if (parsed) {
      picker.setColor(parsed.l, parsed.c, parsed.h)
    }

    pickerRef.current = picker
    isInitializingRef.current = false

    return () => {
      isInitializingRef.current = true
      picker.destroy()
      pickerRef.current = null
    }
  }, [])

  return (
    <div className="sticky bottom-0 -mx-1.5 bg-neutral-800/80 px-1.5 pb-1 dark:bg-neutral-800/90">
      <PickerSeparator />
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          syncPickerColor()
          pickerRef.current?.togglePicker()
        }}
        onPointerDown={(event) => {
          // Prevent parent picker menu close-on-select behavior.
          event.stopPropagation()
        }}
        className={cn(
          "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-left text-sm font-medium text-neutral-100 outline-hidden transition-colors hover:bg-neutral-600 focus-visible:bg-neutral-600 dark:hover:bg-neutral-700/80 dark:focus-visible:bg-neutral-700/80",
          "pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base"
        )}
      >
        <span>Custom</span>
        {selectedColor ? (
          <span
            className="absolute right-2 size-4 rounded-full"
            style={{ backgroundColor: selectedColor }}
            aria-hidden
          />
        ) : null}
      </button>
      <button
        ref={hiddenTriggerRef}
        type="button"
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
      <div ref={compactPickerContainerRef} className="sr-only" aria-hidden />
    </div>
  )
}

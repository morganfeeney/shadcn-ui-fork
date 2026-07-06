"use client"

import * as React from "react"

import {
  PickerItem,
  PickerSeparator,
} from "@/app/(app)/create/components/picker"

export function ColorPickerStickyItem() {
  const colorInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="sticky bottom-0 -mx-1.5 bg-neutral-950/95 px-1.5 pb-1 backdrop-blur-xl dark:bg-neutral-800/95">
      <PickerSeparator />
      <PickerItem
        onClick={() => {
          colorInputRef.current?.click()
        }}
        className="cursor-pointer pr-8 pl-2"
      >
        <span className="text-neutral-400">+</span>
        <span>Color Picker</span>
      </PickerItem>
      <input
        ref={colorInputRef}
        type="color"
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
    </div>
  )
}

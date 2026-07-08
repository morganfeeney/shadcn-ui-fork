"use client"

import * as React from "react"

import { useMounted } from "@/hooks/use-mounted"
import {
  BASE_COLORS,
  type BaseColorName,
} from "@/registry/config"
import { LockButton } from "@/app/(app)/create/components/lock-button"
import {
  Picker,
  PickerContent,
  PickerGroup,
  PickerRadioGroup,
  PickerRadioItem,
  PickerTrigger,
} from "@/app/(app)/create/components/picker"
import {
  ColorPickerStickyItem,
  shouldKeepPickerOpenForOklume,
} from "@/app/(app)/create/components/color-picker-sticky-item"
import {
  buildBaseCustomColorUpdate,
  buildNamedBaseColorUpdate,
  CUSTOM_COLOR_SET_OPTIONS,
} from "@/app/(app)/create/lib/custom-color-params"
import { useDesignSystemSearchParams } from "@/app/(app)/create/lib/search-params"

const CUSTOM_BASE_VALUE = "__custom_base__"

export function BaseColorPicker({
  isMobile,
  anchorRef,
}: {
  isMobile: boolean
  anchorRef: React.RefObject<HTMLDivElement | null>
}) {
  const mounted = useMounted()
  const [params, setParams] = useDesignSystemSearchParams()
  const customBaseColor = params.baseCustomColor || null

  const currentBaseColor = React.useMemo(
    () => BASE_COLORS.find((baseColor) => baseColor.name === params.baseColor),
    [params.baseColor]
  )

  return (
    <div className="group/picker relative">
      <Picker
        onOpenChange={(_open, eventDetails) => {
          if (shouldKeepPickerOpenForOklume(eventDetails)) {
            eventDetails.cancel()
          }
        }}
      >
        <PickerTrigger>
          <div className="flex flex-col justify-start text-left">
            <div className="text-xs text-muted-foreground">Base Color</div>
            <div className="text-sm font-medium text-foreground">
              {customBaseColor ? "Custom" : currentBaseColor?.title}
            </div>
          </div>
          {mounted && (
            <div
              style={
                {
                  "--color":
                    customBaseColor ??
                    currentBaseColor?.cssVars?.dark?.["muted-foreground"],
                } as React.CSSProperties
              }
              className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full bg-(--color) select-none md:right-2.5"
            />
          )}
        </PickerTrigger>
        <PickerContent
          anchor={isMobile ? anchorRef : undefined}
          side={isMobile ? "top" : "right"}
          align={isMobile ? "center" : "start"}
          className="pb-0"
        >
          <PickerRadioGroup
            value={customBaseColor ? CUSTOM_BASE_VALUE : (currentBaseColor?.name ?? "")}
            onValueChange={(value) => {
              if (value === CUSTOM_BASE_VALUE) {
                return
              }

              setParams((previous) => buildNamedBaseColorUpdate(value as BaseColorName, previous))
            }}
          >
            <PickerGroup>
              {BASE_COLORS.map((baseColor) => (
                <PickerRadioItem
                  key={baseColor.name}
                  value={baseColor.name}
                  closeOnClick={isMobile}
                >
                  {baseColor.title}
                </PickerRadioItem>
              ))}
            </PickerGroup>
          </PickerRadioGroup>
          <ColorPickerStickyItem
            value={customBaseColor}
            onColorChange={(color) => {
              setParams(
                (previous) => buildBaseCustomColorUpdate(color, previous),
                CUSTOM_COLOR_SET_OPTIONS
              )
            }}
          />
        </PickerContent>
      </Picker>
      <LockButton
        param="baseColor"
        className="absolute top-1/2 right-8 -translate-y-1/2"
      />
    </div>
  )
}

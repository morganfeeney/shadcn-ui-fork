"use client"

import * as React from "react"

import { useMounted } from "@/hooks/use-mounted"
import { BASE_COLORS, type Theme, type ThemeName } from "@/registry/config"
import { LockButton } from "@/app/(app)/(create)/components/lock-button"
import {
  Picker,
  PickerContent,
  PickerGroup,
  PickerRadioGroup,
  PickerRadioItem,
  PickerSeparator,
  PickerTrigger,
} from "@/app/(app)/(create)/components/picker"
import { usePreviewOverride } from "@/app/(app)/(create)/components/preview-override"
import { useDesignSystemSearchParams } from "@/app/(app)/(create)/lib/search-params"
import {
  ColorPickerStickyItem,
  shouldKeepPickerOpenForOklume,
} from "@/app/(app)/create/components/color-picker-sticky-item"
import {
  buildNamedThemeUpdate,
  buildThemeCustomColorUpdate,
  CUSTOM_COLOR_SET_OPTIONS,
} from "@/app/(app)/create/lib/custom-color-params"

const CUSTOM_THEME_VALUE = "__custom_theme__"

export function ThemePicker({
  themes,
  isMobile,
  anchorRef,
}: {
  themes: readonly Theme[]
  isMobile: boolean
  anchorRef: React.RefObject<HTMLDivElement | null>
}) {
  const mounted = useMounted()
  const [params, setParams] = useDesignSystemSearchParams()
  const { setOverride, clearOverride } = usePreviewOverride()
  const customThemeColor = params.themeCustomColor || null

  const currentTheme = React.useMemo(
    () => themes.find((theme) => theme.name === params.theme),
    [themes, params.theme]
  )

  const currentThemeIsBaseColor = React.useMemo(
    () => BASE_COLORS.find((baseColor) => baseColor.name === params.theme),
    [params.theme]
  )
  const currentThemeSwatchColor = React.useMemo(
    () =>
      currentTheme?.cssVars?.dark?.[
        currentThemeIsBaseColor ? "muted-foreground" : "primary"
      ],
    [currentTheme, currentThemeIsBaseColor]
  )

  return (
    <div className="group/picker relative">

      <Picker
        onOpenChange={(_open, eventDetails) => {
          if (shouldKeepPickerOpenForOklume(eventDetails)) {
            eventDetails.cancel()
          }
          if (!_open) {
            clearOverride()
          }
        }}
      >
        <PickerTrigger>
          <div className="flex flex-col justify-start text-left">
            <div className="text-xs text-muted-foreground">Theme</div>
            <div className="text-sm font-medium text-foreground">
              {customThemeColor ? "Custom" : currentTheme?.title}
            </div>
          </div>
          {mounted && (
            <div
              style={
                {
                  "--color": customThemeColor ?? currentThemeSwatchColor,
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
          className="max-h-92 pb-0"
          onMouseLeave={clearOverride}
        >
          <PickerRadioGroup
            value={
              customThemeColor ? CUSTOM_THEME_VALUE : (currentTheme?.name ?? "")
            }
            onValueChange={(value) => {
              if (value === CUSTOM_THEME_VALUE) {
                return
              }
              setParams((previous) =>
                buildNamedThemeUpdate(value as ThemeName, previous)
              )
            }}
            onItemPreview={
              isMobile
                ? undefined
                : (value) => setOverride({ theme: value as ThemeName })
            }
          >
            <PickerGroup>
              {themes
                .filter((theme) =>
                  BASE_COLORS.find((baseColor) => baseColor.name === theme.name)
                )
                .map((theme) => {
                  return (
                    <PickerRadioItem
                      key={theme.name}
                      value={theme.name}
                      closeOnClick={isMobile}
                    >
                      {theme.title}
                    </PickerRadioItem>
                  )
                })}
            </PickerGroup>
            <PickerSeparator />
            <PickerGroup>
              {themes
                .filter(
                  (theme) =>
                    !BASE_COLORS.find(
                      (baseColor) => baseColor.name === theme.name
                    )
                )
                .map((theme) => {
                  return (
                    <PickerRadioItem
                      key={theme.name}
                      value={theme.name}
                      closeOnClick={isMobile}
                    >
                      {theme.title}
                    </PickerRadioItem>
                  )
                })}
            </PickerGroup>
          </PickerRadioGroup>
          <ColorPickerStickyItem
            value={customThemeColor}
            defaultColor={currentThemeSwatchColor}
            onColorChange={(color) => {
              setParams(
                buildThemeCustomColorUpdate(color),
                CUSTOM_COLOR_SET_OPTIONS
              )
            }}
          />
        </PickerContent>
      </Picker>
      <LockButton
        param="theme"
        className="absolute top-1/2 right-8 -translate-y-1/2"
      />
    </div>
  )
}

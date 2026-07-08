"use client"

import * as React from "react"

import { useMounted } from "@/hooks/use-mounted"
import {
  BASE_COLORS,
  getThemesForBaseColor,
  type ChartColorName,
} from "@/registry/config"
import { LockButton } from "@/app/(app)/create/components/lock-button"
import {
  Picker,
  PickerContent,
  PickerGroup,
  PickerRadioGroup,
  PickerRadioItem,
  PickerSeparator,
  PickerTrigger,
} from "@/app/(app)/create/components/picker"
import {
  ColorPickerStickyItem,
  shouldKeepPickerOpenForOklume,
} from "@/app/(app)/create/components/color-picker-sticky-item"
import {
  buildChartCustomColorUpdate,
  buildNamedChartColorUpdate,
  CUSTOM_COLOR_SET_OPTIONS,
} from "@/app/(app)/create/lib/custom-color-params"
import { useDesignSystemSearchParams } from "@/app/(app)/create/lib/search-params"

const CUSTOM_CHART_VALUE = "__custom_chart__"

export function ChartColorPicker({
  isMobile,
  anchorRef,
}: {
  isMobile: boolean
  anchorRef: React.RefObject<HTMLDivElement | null>
}) {
  const mounted = useMounted()
  const [params, setParams] = useDesignSystemSearchParams()
  const customChartColor = params.chartCustomColor || null

  const availableChartColors = React.useMemo(
    () => getThemesForBaseColor(params.baseColor),
    [params.baseColor]
  )

  const currentChartColor = React.useMemo(
    () =>
      availableChartColors.find((theme) => theme.name === params.chartColor),
    [availableChartColors, params.chartColor]
  )

  const currentChartColorIsBaseColor = React.useMemo(
    () => BASE_COLORS.find((baseColor) => baseColor.name === params.chartColor),
    [params.chartColor]
  )
  const currentChartSwatchColor = React.useMemo(
    () =>
      currentChartColor?.cssVars?.dark?.[
        currentChartColorIsBaseColor ? "muted-foreground" : "primary"
      ],
    [currentChartColor, currentChartColorIsBaseColor]
  )

  React.useEffect(() => {
    if (!currentChartColor && availableChartColors.length > 0) {
      setParams({ chartColor: availableChartColors[0].name })
    }
  }, [currentChartColor, availableChartColors, setParams])

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
            <div className="text-xs text-muted-foreground">Chart Color</div>
            <div className="text-sm font-medium text-foreground">
              {customChartColor ? "Custom" : currentChartColor?.title}
            </div>
          </div>
          {mounted && (
            <div
              style={
                {
                  "--color":
                    customChartColor ??
                    currentChartColor?.cssVars?.dark?.[
                      currentChartColorIsBaseColor
                        ? "muted-foreground"
                        : "primary"
                    ],
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
        >
          <PickerRadioGroup
            value={
              customChartColor ? CUSTOM_CHART_VALUE : (currentChartColor?.name ?? "")
            }
            onValueChange={(value) => {
              if (value === CUSTOM_CHART_VALUE) {
                return
              }
              setParams((previous) =>
                buildNamedChartColorUpdate(value as ChartColorName, previous)
              )
            }}
          >
            <PickerGroup>
              {availableChartColors
                .filter((theme) =>
                  BASE_COLORS.find((baseColor) => baseColor.name === theme.name)
                )
                .map((theme) => (
                  <PickerRadioItem
                    key={theme.name}
                    value={theme.name}
                    closeOnClick={isMobile}
                  >
                    {theme.title}
                  </PickerRadioItem>
                ))}
            </PickerGroup>
            <PickerSeparator />
            <PickerGroup>
              {availableChartColors
                .filter(
                  (theme) =>
                    !BASE_COLORS.find(
                      (baseColor) => baseColor.name === theme.name
                    )
                )
                .map((theme) => (
                  <PickerRadioItem
                    key={theme.name}
                    value={theme.name}
                    closeOnClick={isMobile}
                  >
                    {theme.title}
                  </PickerRadioItem>
                ))}
            </PickerGroup>
          </PickerRadioGroup>
          <ColorPickerStickyItem
            value={customChartColor}
            defaultColor={currentChartSwatchColor}
            onColorChange={(color) => {
              setParams(
                buildChartCustomColorUpdate(color),
                CUSTOM_COLOR_SET_OPTIONS
              )
            }}
          />
        </PickerContent>
      </Picker>
      <LockButton
        param="chartColor"
        className="absolute top-1/2 right-8 -translate-y-1/2"
      />
    </div>
  )
}

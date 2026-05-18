"use client"

import * as React from "react"
import { cjk } from "@streamdown/cjk"
import { code } from "@streamdown/code"
import type { ComponentProps } from "react"
import { Streamdown } from "streamdown"

import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import { InfoIcon } from "@phosphor-icons/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatPresetCardDescription } from "@/lib/preset-card-description"

type PresetThemeExtractorProps = {
  code: string
}

const DETAIL_FIELDS: ReadonlyArray<{
  key: string
  label: string
  getValue: (
    bundle: NonNullable<ReturnType<typeof getPresetThemeCssBundle>>
  ) => string
}> = [
  { key: "code", label: "Code", getValue: (bundle) => bundle.resolved.code },
  { key: "style", label: "Style", getValue: (bundle) => bundle.resolved.style },
  {
    key: "baseColor",
    label: "Base color",
    getValue: (bundle) => bundle.resolved.baseColor,
  },
  { key: "theme", label: "Theme", getValue: (bundle) => bundle.resolved.theme },
  {
    key: "chartColor",
    label: "Chart color",
    getValue: (bundle) => bundle.resolved.effectiveChartColor,
  },
  {
    key: "font",
    label: "Body font",
    getValue: (bundle) => bundle.resolved.font,
  },
  {
    key: "fontHeading",
    label: "Heading font",
    getValue: (bundle) =>
      bundle.resolved.fontHeading === "inherit"
        ? `${bundle.resolved.font} (inherits body font)`
        : bundle.resolved.fontHeading,
  },
  {
    key: "icons",
    label: "Icons",
    getValue: (bundle) => bundle.resolved.iconLibrary,
  },
  {
    key: "radius",
    label: "Radius",
    getValue: (bundle) => bundle.resolved.effectiveRadius,
  },
  {
    key: "menuColor",
    label: "Menu color",
    getValue: (bundle) => bundle.resolved.menuColor,
  },
  {
    key: "menuAccent",
    label: "Menu accent",
    getValue: (bundle) => bundle.resolved.menuAccent,
  },
]

type StreamdownProps = ComponentProps<typeof Streamdown>

const streamdownPlugins = { cjk, code } as unknown as NonNullable<
  StreamdownProps["plugins"]
>

function CssOutputBlock({ value }: { value: string }) {
  const markdown = `\`\`\`css\n${value}\n\`\`\``

  return (
    <div className="min-h-140">
      <Streamdown
        key={value}
        plugins={streamdownPlugins}
        // className="**:data-[streamdown='code-block']:rounded-none"
      >
        {markdown}
      </Streamdown>
    </div>
  )
}

export function PresetThemeExtractor({ code }: PresetThemeExtractorProps) {
  const normalizedCode = code.trim()

  const bundle = React.useMemo(
    () => getPresetThemeCssBundle(normalizedCode),
    [normalizedCode]
  )

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="grid items-start gap-6 lg:sticky lg:top-6">
        {bundle ? (
          <PresetStyleOverviewCard
            className="max-2xl:order-1"
            code={bundle.resolved.code}
            title={bundle.resolved.code}
            previewVariant="v4-iframe"
            virtualWidth={2000}
            virtualHeight={1000}
            description={formatPresetCardDescription(bundle.resolved)}
          />
        ) : null}
      </div>
      <div className="grid items-start gap-6">
        {!bundle ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            This preset code could not be decoded.
          </div>
        ) : (
          <CssOutputBlock value={bundle.combinedCss} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              About preset{" "}
              <span className="truncate font-mono text-sm">{code}</span>
            </CardTitle>
            <CardDescription>
              Decoded data for the current preset code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!bundle ? (
              <Alert variant="destructive">
                <InfoIcon />
                <AlertTitle>This preset code could not be decoded.</AlertTitle>
                <AlertDescription>Try a different code.</AlertDescription>
              </Alert>
            ) : (
              <dl className="grid gap-3">
                {DETAIL_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="grid gap-0.5 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      {field.label}
                    </dt>
                    <dd className="text-sm break-all">
                      {field.getValue(bundle)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

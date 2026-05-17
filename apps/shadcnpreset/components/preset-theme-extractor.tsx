"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Copy } from "lucide-react"

import { copyToClipboardWithMeta } from "@/components/copy-button"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
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

function CssOutputBlock({
  value,
  copyLabel,
  copyKey,
  copiedKey,
  onCopy,
}: {
  value: string
  copyLabel: string
  copyKey: string
  copiedKey: string | null
  onCopy: (value: string, key: string) => void
}) {
  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="icon-sm"
        className="absolute top-3 right-3 z-10"
        onClick={() => onCopy(value, copyKey)}
        aria-label={copiedKey === copyKey ? "Copied" : copyLabel}
        title={copiedKey === copyKey ? "Copied" : copyLabel}
      >
        {copiedKey === copyKey ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
      </Button>
      <Textarea
        readOnly
        value={value}
        className="min-h-140 font-mono text-xs"
      />
    </div>
  )
}

export function PresetThemeExtractor({ code }: PresetThemeExtractorProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)
  const normalizedCode = code.trim()

  const bundle = React.useMemo(
    () => getPresetThemeCssBundle(normalizedCode),
    [normalizedCode]
  )

  React.useEffect(() => {
    if (!copiedKey) return
    const timeout = window.setTimeout(() => setCopiedKey(null), 1500)
    return () => window.clearTimeout(timeout)
  }, [copiedKey])

  async function handleCopy(value: string, key: string) {
    const hasCopied = await copyToClipboardWithMeta(value, {
      name: "preset_theme_copy",
      properties: { key, code: normalizedCode },
    })

    if (hasCopied) {
      setCopiedKey(key)
    }
  }

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
        <Card>
          <CardHeader>
            <CardTitle>Theme custom properties</CardTitle>
            <CardDescription>
              Copy and paste into your{" "}
              <code className="text-[13px]">globals.css</code> file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!bundle ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                This preset code could not be decoded.
              </div>
            ) : (
              <CssOutputBlock
                value={bundle.combinedCss}
                copyLabel="Copy code"
                copyKey="combined"
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />
            )}
          </CardContent>
        </Card>
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

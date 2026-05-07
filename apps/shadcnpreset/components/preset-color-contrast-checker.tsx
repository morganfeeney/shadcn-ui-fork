"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { CheckIcon, XIcon, SunIcon, MoonIcon } from "@phosphor-icons/react"
import {
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PRESET_COLOR_CONTRAST_TOOL } from "@/app/tools/tools"
import { trackEvent } from "@/lib/analytics-events"
import { generateRandomCompatiblePreset } from "@/lib/random-preset"
import {
  PRESET_CONTRAST_AA_NORMAL_RATIO,
  PRESET_CONTRAST_AAA_NORMAL_RATIO,
  getOverallContrastScore,
  type OverallContrastScore,
  type PresetColorContrastModeReport,
  type PresetColorContrastReport,
  type ThemeMode,
} from "@/lib/preset-color-contrast-report"
import { cn, toSentenceCase } from "@/lib/utils"

function dialProgressStrokeClass(percent: number | null) {
  if (percent === null) return "stroke-muted-foreground"
  if (percent >= 85) return "stroke-emerald-500"
  if (percent >= 60) return "stroke-amber-500"
  return "stroke-red-500"
}

function dialLabelTextClass(percent: number | null) {
  if (percent === null) return "text-muted-foreground"
  if (percent >= 85) return "text-emerald-600 dark:text-emerald-400"
  if (percent >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function ContrastRatingDial({
  surface,
  score,
  variant = "default",
  showSurfaceLabel = true,
}: {
  surface: ThemeMode
  score: OverallContrastScore
  variant?: "default" | "compact"
  showSurfaceLabel?: boolean
}) {
  const size = variant === "compact" ? 30 : 76
  const stroke = variant === "compact" ? 3 : 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = score.percent ?? 0
  const dashOffset = c - (p / 100) * c
  const progressStroke = dialProgressStrokeClass(score.percent)
  const labelTextClass = dialLabelTextClass(score.percent)

  const tooltipBody =
    score.percent === null ? (
      <p>No pairs evaluated for {surface}.</p>
    ) : (
      <div className="space-y-1">
        <p className="font-medium">
          {score.percent}% pass at {PRESET_CONTRAST_AA_NORMAL_RATIO}:1 ·{" "}
          {surface}
        </p>
        <p className="text-background/80">
          {score.passCount} / {score.evaluatedCount} pairs ·{" "}
          {score.unresolvedCount > 0
            ? `${score.unresolvedCount} unresolved`
            : "0 unresolved"}
        </p>
      </div>
    )

  const gapClass = variant === "compact" ? "gap-3" : "gap-4"

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "inline-flex items-center rounded-lg text-left",
          gapClass,
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        )}
      >
        <span className="sr-only">
          {surface} contrast rating{" "}
          {score.percent === null
            ? "not available"
            : `${score.percent} percent`}
        </span>
        <div
          className="relative inline-flex shrink-0 items-center justify-center"
          style={{ width: size, height: size }}
          aria-hidden
        >
          <svg
            width={size}
            height={size}
            className="absolute inset-0 -rotate-90"
            viewBox={`0 0 ${size} ${size}`}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              className="stroke-muted-foreground/25"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={score.percent === null ? c : dashOffset}
              className={cn("transition-[stroke-dashoffset]", progressStroke)}
            />
          </svg>
          <span
            className={cn(
              "relative leading-none tabular-nums",
              labelTextClass,
              variant === "compact"
                ? "text-[10px] font-semibold tracking-tight"
                : "flex flex-col items-center text-xl font-semibold tracking-tight"
            )}
          >
            {score.percent === null ? (
              "—"
            ) : variant === "compact" ? (
              `${score.percent}`
            ) : (
              <>
                <span>{score.percent}</span>
                <span className="text-[10px] font-medium">%</span>
              </>
            )}
          </span>
        </div>
        {showSurfaceLabel ? (
          <div className="grid min-w-0 gap-0.5">
            <span className="text-sm font-semibold capitalize">{surface}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {PRESET_CONTRAST_AA_NORMAL_RATIO}:1
            </span>
          </div>
        ) : null}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {tooltipBody}
      </TooltipContent>
    </Tooltip>
  )
}

function TooltipColorSwatch({
  tokenName,
  raw,
}: {
  tokenName: string
  raw: string
}) {
  const missing = !raw || raw === "(missing)"
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "inline-flex shrink-0 rounded-sm border border-transparent",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        )}
      >
        <span className="sr-only">
          {tokenName}: {raw}
        </span>
        <span
          className={cn(
            "inline-block size-6 rounded-sm border border-border",
            missing ? "border-dashed bg-muted" : "shadow-sm"
          )}
          style={missing ? undefined : { backgroundColor: raw }}
          aria-hidden
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-md">
        <p className="text-xs text-background/80">{tokenName}</p>
        <p className="font-mono text-xs break-all">{raw}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function formatRatio(ratio: number | null) {
  if (ratio === null) return "—"
  return `${ratio.toFixed(2)}:1`
}

function ConformanceIcon({
  pass,
  labelPass,
  labelFail,
}: {
  pass: boolean | null
  labelPass: string
  labelFail: string
}) {
  if (pass === null) {
    return (
      <span
        className="text-sm text-muted-foreground"
        title="Could not evaluate"
      >
        —
      </span>
    )
  }
  if (pass) {
    return (
      <CheckIcon
        className="text-emerald-600 dark:text-emerald-400"
        size={16}
        weight="bold"
        aria-label={labelPass}
      />
    )
  }
  return (
    <XIcon
      className="text-red-600 dark:text-red-400"
      size={16}
      weight="bold"
      aria-label={labelFail}
    />
  )
}

function ContrastTable({ data }: { data: PresetColorContrastModeReport }) {
  return (
    <Table className="**:text-xs">
      <TableHeader className="**:font-normal">
        <TableRow>
          <TableHead>Pair</TableHead>
          <TableHead>Colors</TableHead>
          <TableHead className="text-right">Ratio</TableHead>
          <TableHead
            className="text-right"
            title={`WCAG 2.x AA · normal text · ${PRESET_CONTRAST_AA_NORMAL_RATIO}:1`}
          >
            AA
          </TableHead>
          <TableHead
            className="text-right"
            title={`WCAG 2.x AAA · enhanced · normal text · ${PRESET_CONTRAST_AAA_NORMAL_RATIO}:1`}
          >
            AAA
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.pairs.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="text-sm font-medium">
              {toSentenceCase(row.backgroundKey)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <TooltipColorSwatch
                  tokenName={row.foregroundKey}
                  raw={row.foregroundRaw}
                />
                <TooltipColorSwatch
                  tokenName={row.backgroundKey}
                  raw={row.backgroundRaw}
                />
              </div>
            </TableCell>
            <TableCell className="text-right">
              {formatRatio(row.ratio)}
            </TableCell>
            <TableCell className="text-right">
              <div className="inline-flex flex-col items-end gap-1">
                <span className="inline-flex justify-end">
                  <ConformanceIcon
                    pass={row.passAaNormal}
                    labelPass={`Passes AA (${PRESET_CONTRAST_AA_NORMAL_RATIO}:1)`}
                    labelFail={`Below AA (${PRESET_CONTRAST_AA_NORMAL_RATIO}:1)`}
                  />
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <span className="inline-flex justify-end">
                <ConformanceIcon
                  pass={row.passAaaNormal}
                  labelPass={`Passes AAA (${PRESET_CONTRAST_AAA_NORMAL_RATIO}:1)`}
                  labelFail={`Below AAA (${PRESET_CONTRAST_AAA_NORMAL_RATIO}:1)`}
                />
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

type PresetColorContrastHeaderProps = {
  defaultCode: string
}

export function PresetColorContrastHeader({
  defaultCode,
}: PresetColorContrastHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = React.useState(defaultCode)

  React.useEffect(() => {
    setValue(defaultCode)
  }, [defaultCode])

  function updateCode(nextCode: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (nextCode) {
      params.set("code", nextCode)
    } else {
      params.delete("code")
    }
    const nextSearch = params.toString()
    router.push(nextSearch ? `${pathname}?${nextSearch}` : pathname)
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextCode = value.trim()
    if (nextCode) {
      trackEvent("preset_color_contrast_check_submit", {
        page_path: pathname,
        preset_code: nextCode,
      })
    }
    updateCode(nextCode)
  }

  function onRandomize() {
    const nextCode = generateRandomCompatiblePreset()
    setValue(nextCode)
    updateCode(nextCode)
  }

  return (
    <>
      <PageHeaderHeading>{PRESET_COLOR_CONTRAST_TOOL.title}</PageHeaderHeading>
      <PageHeaderDescription className="text-muted-foreground">
        {PRESET_COLOR_CONTRAST_TOOL.description}
      </PageHeaderDescription>
      <form className="w-full max-w-2xl" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="preset-color-contrast-code">
          Preset code
        </label>
        <InputGroup>
          <InputGroupInput
            id="preset-color-contrast-code"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste preset code"
            autoComplete="off"
            spellCheck={false}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              variant="ghost"
              onClick={onRandomize}
            >
              Random
            </InputGroupButton>
            <InputGroupButton variant="secondary" type="submit">
              Check contrast
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </>
  )
}

function WcagLozenge({
  mode,
  report,
}: {
  mode: ThemeMode
  report: PresetColorContrastReport
}) {
  const lightScore = getOverallContrastScore(report.light)
  const darkScore = getOverallContrastScore(report.dark)
  return (
    <div className="grid grid-cols-[auto_auto] items-center justify-start gap-2">
      <ContrastRatingDial
        surface={mode}
        score={mode === "light" ? lightScore : darkScore}
        variant="compact"
        showSurfaceLabel={false}
      />
      <div>
        <p className="text-sm font-normal">WCAG 2.1</p>
        <p className="-mt-0.5 text-xs font-normal text-muted-foreground">
          Normal text
        </p>
      </div>
    </div>
  )
}

export function PresetColorContrastResults({
  report,
}: {
  report: PresetColorContrastReport | null
}) {
  if (!report) {
    return (
      <p className="text-sm text-muted-foreground">
        Enter a valid preset code to see contrast results.
      </p>
    )
  }

  return (
    <div className="grid items-start gap-8 xl:grid-cols-2">
      <PresetStyleOverviewCard
        className="xl:sticky xl:top-6"
        code={report.code}
        description={report.overviewDescription}
        previewVariant="v4-iframe"
        title={report.code}
        virtualWidth={2000}
        virtualHeight={1000}
      />
      <section
        className="grid gap-4"
        aria-labelledby="contrast-details-heading"
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
          <div className="grid gap-3">
            <Card size="sm">
              <CardHeader className="flex justify-between">
                <CardTitle className="grid gap-1">
                  <SunIcon className="text-muted-foreground" /> Light
                </CardTitle>
                <WcagLozenge mode="light" report={report} />
              </CardHeader>

              <CardContent className="grid gap-2 px-1!">
                <ContrastTable data={report.light} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-3">
            <Card size="sm">
              <CardHeader className="flex justify-between">
                <CardTitle className="grid gap-1">
                  <MoonIcon className="text-muted-foreground" /> Dark
                </CardTitle>
                <WcagLozenge mode="dark" report={report} />
              </CardHeader>
              <CardContent className="grid gap-2 px-1!">
                <ContrastTable data={report.dark} />
              </CardContent>
            </Card>
          </div>
        </div>
        <footer>
          <p className="mt-2 max-w-prose text-xs leading-relaxed text-muted-foreground">
            WCAG 2.x{" "}
            <abbr title="Success Criterion" className="no-underline">
              SC
            </abbr>{" "}
            <span className="whitespace-nowrap">1.4.3</span> (Contrast Minimum)
            requires{" "}
            <span className="whitespace-nowrap">
              {PRESET_CONTRAST_AA_NORMAL_RATIO}:1
            </span>{" "}
            for normal text at Level AA.{" "}
            <span className="whitespace-nowrap">SC 1.4.6</span> (Contrast
            Enhanced) requires{" "}
            <span className="whitespace-nowrap">
              {PRESET_CONTRAST_AAA_NORMAL_RATIO}:1
            </span>{" "}
            at Level AAA. <br />
            <br />
            Large text and non-text contrast are not covered here.
          </p>
        </footer>
      </section>
    </div>
  )
}

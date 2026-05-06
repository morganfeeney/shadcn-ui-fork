"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { CheckIcon, XIcon } from "@phosphor-icons/react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { cn } from "@/lib/utils"

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
}: {
  surface: ThemeMode
  score: OverallContrastScore
}) {
  const size = 76
  const stroke = 5
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

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "inline-flex items-center gap-4 rounded-lg text-left",
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
              "relative flex flex-col items-center leading-none tabular-nums",
              labelTextClass
            )}
          >
            <span className="text-xl font-semibold tracking-tight">
              {score.percent === null ? "—" : score.percent}
            </span>
            {score.percent !== null ? (
              <span className="text-[10px] font-medium">%</span>
            ) : null}
          </span>
        </div>
        <div className="grid min-w-0 gap-0.5">
          <span className="text-sm font-semibold">{surface}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {PRESET_CONTRAST_AA_NORMAL_RATIO}:1
          </span>
        </div>
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
            "inline-block size-7 rounded-sm border border-border",
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
        size={20}
        weight="bold"
        aria-label={labelPass}
      />
    )
  }
  return (
    <XIcon
      className="text-red-600 dark:text-red-400"
      size={20}
      weight="bold"
      aria-label={labelFail}
    />
  )
}

function ContrastTable({ data }: { data: PresetColorContrastModeReport }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[7rem] text-xs font-normal">
            Pair
          </TableHead>
          <TableHead className="text-xs font-normal">Colors</TableHead>
          <TableHead className="text-right text-xs font-normal">
            Ratio
          </TableHead>
          <TableHead
            className="text-right text-xs font-normal"
            title={`WCAG 2.x AA · normal text · ${PRESET_CONTRAST_AA_NORMAL_RATIO}:1`}
          >
            AA
          </TableHead>
          <TableHead
            className="text-right text-xs font-normal"
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
              {row.backgroundKey}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
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
            <TableCell className="text-right text-sm">
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
                {row.note ? (
                  <span className="max-w-[12rem] text-right text-xs text-muted-foreground">
                    {row.note}
                  </span>
                ) : null}
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
      <PageHeaderHeading className="max-w-4xl">
        {PRESET_COLOR_CONTRAST_TOOL.title}
      </PageHeaderHeading>
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
            <InputGroupButton type="submit">Check contrast</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </>
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

  const lightScore = getOverallContrastScore(report.light)
  const darkScore = getOverallContrastScore(report.dark)

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <PresetStyleOverviewCard
        className="lg:sticky lg:top-6"
        code={report.code}
        title={report.code}
        description={report.overviewDescription}
      />
      <div className="grid min-w-0 gap-6 text-left">
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-4">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <ContrastRatingDial surface="light" score={lightScore} />
            <ContrastRatingDial surface="dark" score={darkScore} />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          WCAG 2.x{" "}
          <abbr title="Success Criterion" className="no-underline">
            SC
          </abbr>{" "}
          <span className="whitespace-nowrap">1.4.3</span> (Contrast Minimum)
          sets{" "}
          <span className="whitespace-nowrap">
            {PRESET_CONTRAST_AA_NORMAL_RATIO}:1
          </span>{" "}
          for normal text at Level AA.{" "}
          <span className="whitespace-nowrap">SC 1.4.6</span> (Contrast
          Enhanced) sets{" "}
          <span className="whitespace-nowrap">
            {PRESET_CONTRAST_AAA_NORMAL_RATIO}:1
          </span>{" "}
          for normal text at Level AAA. The AA and AAA columns use those
          thresholds; large text and non-text contrast are not evaluated here.
        </p>
        <Tabs defaultValue="light">
          <TabsList>
            <TabsTrigger value="light">Light</TabsTrigger>
            <TabsTrigger value="dark">Dark</TabsTrigger>
          </TabsList>
          <TabsContent value="light" className="mt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Pass: {report.light.passCount} · Fail: {report.light.failCount} ·
              Could not evaluate: {report.light.unresolvedCount}
            </p>
            <ContrastTable data={report.light} />
          </TabsContent>
          <TabsContent value="dark" className="mt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Pass: {report.dark.passCount} · Fail: {report.dark.failCount} ·
              Could not evaluate: {report.dark.unresolvedCount}
            </p>
            <ContrastTable data={report.dark} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

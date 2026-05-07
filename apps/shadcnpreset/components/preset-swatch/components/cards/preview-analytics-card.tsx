"use client"

import { Area, AreaChart } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/poc/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

/** Monthly visitor series — v4 `registry/bases/radix/blocks/preview/cards/analytics-card.tsx`. */
const ANALYTICS_CHART_DATA = [
  { month: "January", visitors: 186 },
  { month: "February", visitors: 305 },
  { month: "March", visitors: 237 },
  { month: "April", visitors: 73 },
  { month: "May", visitors: 209 },
  { month: "June", visitors: 214 },
]

const analyticsChartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

/**
 * Area-chart analytics preview from the v4 preview registry, themed by {@link PresetThemeSurface}.
 */
export function PreviewAnalyticsCard({ className }: { className?: string }) {
  return (
    <Card className={cn("mx-auto w-full pb-0", className)} size="sm">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base">Analytics</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
              <span>418.2K Visitors</span>
              <Badge variant="secondary">+10%</Badge>
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            View Analytics
          </Button>
        </div>
      </CardHeader>
      <ChartContainer
        config={analyticsChartConfig}
        className="aspect-[1/0.35] w-full max-w-full px-2 pb-2"
        initialDimension={{ width: 320, height: 112 }}
      >
        <AreaChart
          accessibilityLayer
          data={ANALYTICS_CHART_DATA}
          margin={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" hideLabel />}
            defaultIndex={2}
          />
          <Area
            dataKey="visitors"
            type="linear"
            fill="var(--color-visitors)"
            fillOpacity={0.4}
            stroke="var(--color-visitors)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}

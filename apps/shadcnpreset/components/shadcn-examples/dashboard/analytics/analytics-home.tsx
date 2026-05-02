"use client";

import * as React from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart2,
  Check,
  ChevronDown,
  ChevronRight,
  Funnel,
  Globe2,
  Goal,
  LayoutDashboard,
  MousePointerClick,
  PieChart,
  Radio,
  ShoppingCart,
  Smartphone,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type OverviewDayRow = {
  day: string;
  current: number;
  previous: number;
  movingAvg: number;
  target: number;
};

type OverviewTabId =
  | "active-users"
  | "event-count"
  | "key-events"
  | "purchases";

/** Distinct curve shapes per metric so tab switches visibly move the lines. */
const overviewLineDataByTab: Record<OverviewTabId, OverviewDayRow[]> = {
  "active-users": [
    {
      day: "Mon",
      current: 5480,
      previous: 5020,
      movingAvg: 5340,
      target: 6260,
    },
    {
      day: "Tue",
      current: 7020,
      previous: 5360,
      movingAvg: 6020,
      target: 6480,
    },
    {
      day: "Wed",
      current: 6120,
      previous: 5480,
      movingAvg: 5880,
      target: 6380,
    },
    {
      day: "Thu",
      current: 7640,
      previous: 6020,
      movingAvg: 6660,
      target: 7010,
    },
    {
      day: "Fri",
      current: 6580,
      previous: 5900,
      movingAvg: 6440,
      target: 6790,
    },
    {
      day: "Sat",
      current: 7210,
      previous: 5660,
      movingAvg: 6720,
      target: 6920,
    },
    {
      day: "Sun",
      current: 5890,
      previous: 5340,
      movingAvg: 6240,
      target: 6610,
    },
  ],
  "event-count": [
    {
      day: "Mon",
      current: 398_000,
      previous: 371_000,
      movingAvg: 390_000,
      target: 431_000,
    },
    {
      day: "Tue",
      current: 486_000,
      previous: 404_000,
      movingAvg: 438_000,
      target: 462_000,
    },
    {
      day: "Wed",
      current: 431_000,
      previous: 423_000,
      movingAvg: 424_000,
      target: 451_000,
    },
    {
      day: "Thu",
      current: 556_000,
      previous: 442_000,
      movingAvg: 486_000,
      target: 509_000,
    },
    {
      day: "Fri",
      current: 472_000,
      previous: 459_000,
      movingAvg: 458_000,
      target: 493_000,
    },
    {
      day: "Sat",
      current: 358_000,
      previous: 308_000,
      movingAvg: 403_000,
      target: 456_000,
    },
    {
      day: "Sun",
      current: 334_000,
      previous: 287_000,
      movingAvg: 368_000,
      target: 438_000,
    },
  ],
  "key-events": [
    {
      day: "Mon",
      current: 17_900,
      previous: 17_500,
      movingAvg: 17_700,
      target: 18_950,
    },
    {
      day: "Tue",
      current: 22_400,
      previous: 18_200,
      movingAvg: 20_300,
      target: 20_150,
    },
    {
      day: "Wed",
      current: 19_700,
      previous: 18_900,
      movingAvg: 19_100,
      target: 19_850,
    },
    {
      day: "Thu",
      current: 27_800,
      previous: 19_600,
      movingAvg: 22_100,
      target: 22_450,
    },
    {
      day: "Fri",
      current: 21_100,
      previous: 20_700,
      movingAvg: 21_000,
      target: 21_950,
    },
    {
      day: "Sat",
      current: 16_900,
      previous: 15_400,
      movingAvg: 18_600,
      target: 20_500,
    },
    {
      day: "Sun",
      current: 15_300,
      previous: 14_900,
      movingAvg: 16_900,
      target: 19_700,
    },
  ],
  purchases: [
    { day: "Mon", current: 590, previous: 542, movingAvg: 562, target: 622 },
    { day: "Tue", current: 780, previous: 602, movingAvg: 668, target: 658 },
    { day: "Wed", current: 655, previous: 618, movingAvg: 648, target: 642 },
    { day: "Thu", current: 972, previous: 648, movingAvg: 742, target: 706 },
    { day: "Fri", current: 786, previous: 714, movingAvg: 734, target: 698 },
    { day: "Sat", current: 566, previous: 526, movingAvg: 640, target: 666 },
    { day: "Sun", current: 472, previous: 458, movingAvg: 556, target: 634 },
  ],
};

const overviewChartConfig = {
  current: {
    label: "This period",
    color: "var(--chart-1)",
  },
  previous: {
    label: "Previous period",
    color: "var(--muted-foreground)",
  },
  movingAvg: {
    label: "Moving average",
    color: "var(--chart-3)",
  },
  target: {
    label: "Target",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

/** One bar per minute — deterministic “busy” traffic curve for SSR. */
const realtimeBars = Array.from({ length: 30 }, (_, i) => {
  const wave = Math.sin((i / 29) * Math.PI * 2) * 52;
  const ramp = i * 2.4;
  const jitter = ((i * 17) % 31) + ((i * i * 3) % 19);
  const total = Math.round(
    Math.min(238, Math.max(72, 118 + wave + ramp * 0.35 + jitter)),
  );
  const desktopShare = 0.48 + (((i * 11) % 7) - 3) * 0.015;
  const mobileShare = 0.34 + (((i * 13) % 9) - 4) * 0.01;
  const desktop = Math.max(0, Math.round(total * desktopShare));
  const mobile = Math.max(0, Math.round(total * mobileShare));
  const tablet = Math.max(0, total - desktop - mobile);

  return {
    m: String(i + 1),
    total,
    desktop,
    mobile,
    tablet,
  };
});

const realtimeBarConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  tablet: { label: "Tablet", color: "var(--chart-3)" },
} satisfies ChartConfig;

const countryHairlineConfig = {
  users: { label: "Active users", color: "var(--chart-2)" },
} satisfies ChartConfig;

const channelHairlineConfig = {
  sessions: { label: "Sessions", color: "var(--chart-2)" },
} satisfies ChartConfig;

const channelSessions = [
  { channel: "Direct", sessions: 284_200, change: 5.2, pct: 100 },
  { channel: "Referral", sessions: 118_400, change: 2.1, pct: 50 },
  { channel: "Organic Search", sessions: 412_800, change: 8.4, pct: 76 },
  { channel: "Organic Social", sessions: 96_200, change: 3.7, pct: 22 },
  { channel: "Paid Search", sessions: 74_600, change: 1.9, pct: 12 },
  { channel: "Unassigned", sessions: 28_140, change: -0.4, pct: 8 },
];

const rateChartData = [
  { date: "13 Mar", rate: 2.31 },
  { date: "14 Mar", rate: 2.48 },
  { date: "15 Mar", rate: 2.62 },
  { date: "16 Mar", rate: 2.44 },
  { date: "17 Mar", rate: 2.71 },
  { date: "18 Mar", rate: 2.58 },
  { date: "19 Mar", rate: 2.84 },
];

const rateChartConfig = {
  rate: { label: "Rate", color: "var(--chart-2)" },
} satisfies ChartConfig;

const purchaserChartData = [
  { date: "13 Mar", total: 1840, firstTime: 920 },
  { date: "14 Mar", total: 2110, firstTime: 1080 },
  { date: "15 Mar", total: 1980, firstTime: 990 },
  { date: "16 Mar", total: 2340, firstTime: 1210 },
  { date: "17 Mar", total: 2190, firstTime: 1140 },
  { date: "18 Mar", total: 2480, firstTime: 1320 },
  { date: "19 Mar", total: 2260, firstTime: 1180 },
];

const purchaserChartConfig = {
  total: { label: "Total purchasers", color: "var(--chart-1)" },
  firstTime: { label: "First time purchasers", color: "var(--chart-3)" },
} satisfies ChartConfig;

const overviewTabs = [
  {
    id: "active-users",
    label: "Active users",
    value: "128.4k",
    delta: 6.8,
    up: true,
  },
  {
    id: "event-count",
    label: "Event count",
    value: "4.82M",
    delta: 12.4,
    up: true,
  },
  {
    id: "key-events",
    label: "Key events",
    value: "284k",
    delta: 4.1,
    up: true,
  },
  {
    id: "purchases",
    label: "Purchases",
    value: "18,940",
    delta: 3.2,
    up: true,
  },
] as const;

const realtimeActiveLast30Min = 2847;

const realtimeByCountry = [
  { country: "United States", users: 842 },
  { country: "United Kingdom", users: 624 },
  { country: "Germany", users: 311 },
  { country: "France", users: 198 },
  { country: "Canada", users: 176 },
  { country: "India", users: 128 },
] as const;

const maxRealtimeCountryUsers = Math.max(
  ...realtimeByCountry.map((c) => c.users),
);

const recentItems = [
  { title: "Realtime overview", time: "today", icon: Radio },
  { title: "Traffic acquisition", time: "today", icon: Activity },
  { title: "Pages and screens", time: "today", icon: LayoutDashboard },
  { title: "Events", time: "today", icon: BarChart2 },
  { title: "Engagement overview", time: "yesterday", icon: MousePointerClick },
  { title: "Demographics detail", time: "this week", icon: Users },
  { title: "Geography", time: "today", icon: Globe2 },
  { title: "Tech details", time: "yesterday", icon: Smartphone },
  { title: "Conversions", time: "today", icon: Goal },
  { title: "Ecommerce purchases", time: "this week", icon: ShoppingCart },
  { title: "Audience overview", time: "today", icon: PieChart },
  { title: "Funnel exploration", time: "yesterday", icon: Funnel },
];

const maxSessions = Math.max(...channelSessions.map((c) => c.sessions));

const rechartsBase =
  "block aspect-auto w-full [&_.recharts-responsive-container]:!h-full [&_.recharts-responsive-container]:!max-h-full";

/** Bars only: clip; line chart uses overflow-visible so ticks aren’t eaten by a huge bottom margin. */
const rechartsClippedShell = `${rechartsBase} overflow-hidden`;

/** Overview line — visible overflow; keep Recharts margins tight (margin shrinks the plot area). */
const homeOverviewLineChartClassName = `${rechartsBase} overflow-visible h-full min-h-[220px]`;

/** Realtime bar chart — fixed height strip; bar density via Recharts defaults + mild maxBarSize only. */
const homeRealtimeBarChartClassName =
  `${rechartsClippedShell} ` +
  "h-[100px] min-h-[100px] max-h-[100px] " +
  "sm:h-[104px] sm:min-h-[104px] sm:max-h-[104px] " +
  "lg:h-[112px] lg:min-h-[112px] lg:max-h-[112px]";

const homeTopCardHeaderClassName = "pb-3";

export function AnalyticsHome() {
  const [overviewTab, setOverviewTab] =
    React.useState<OverviewTabId>("active-users");
  const overviewChartData = overviewLineDataByTab[overviewTab];
  const normalizeTooltipLabel = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return "Value";
    const looksGenerated = /[_-]|[a-z0-9][A-Z]/.test(trimmed);
    if (!looksGenerated) {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }

    const expanded = trimmed
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    return expanded.charAt(0).toUpperCase() + expanded.slice(1);
  };
  const sharedTooltipFormatter: React.ComponentProps<
    typeof ChartTooltipContent
  >["formatter"] = (value, name, item) => {
    const indicatorColor =
      item.color ?? item.payload?.fill ?? "hsl(var(--muted-foreground))";
    const text =
      typeof value === "number" ? value.toLocaleString() : String(value ?? "");
    const label = normalizeTooltipLabel(
      String(name ?? item.name ?? item.dataKey ?? "Value"),
    );

    return (
      <div className="flex min-w-0 flex-1 items-center gap-2.5 text-xs">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)"
          style={
            {
              "--color-bg": indicatorColor,
              "--color-border": indicatorColor,
            } as React.CSSProperties
          }
        />
        <span className="text-muted-foreground min-w-0 flex-1 truncate">
          {label}
        </span>
        <span className="text-foreground shrink-0 font-sans font-medium tabular-nums whitespace-nowrap tracking-normal">
          {text}
        </span>
      </div>
    );
  };
  const renderSharedTooltip = (
    labelFormatter?: React.ComponentProps<
      typeof ChartTooltipContent
    >["labelFormatter"],
  ) => (
    <ChartTooltipContent
      labelFormatter={labelFormatter}
      formatter={sharedTooltipFormatter}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8 py-4 md:py-6">
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-row lg:items-stretch lg:gap-4">
          <Card className="flex min-h-0 w-full min-w-0 flex-col overflow-visible lg:basis-0 lg:flex-[2]">
            <CardHeader
              className={cn("shrink-0 space-y-0", homeTopCardHeaderClassName)}
            >
              <Tabs
                value={overviewTab}
                onValueChange={(v) => setOverviewTab(v as OverviewTabId)}
                className="w-full gap-6"
              >
                <TabsList
                  variant="line"
                  className="h-auto w-full flex-wrap justify-start gap-x-1 gap-y-0 rounded-none border-0 bg-transparent p-0"
                >
                  {overviewTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="rounded-none border-0 px-2 py-2 text-xs font-medium data-active:bg-transparent sm:text-sm"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {overviewTabs.map((tab) => (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="mt-0 outline-none flex-none data-[state=inactive]:hidden"
                  >
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-4xl font-semibold tabular-nums tracking-tight">
                        {tab.value}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 border-0 bg-transparent px-0 font-medium tabular-nums",
                          tab.up
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {tab.up ? (
                          <TrendingUp className="size-3.5" />
                        ) : (
                          <TrendingDown className="size-3.5" />
                        )}
                        {Math.abs(tab.delta)}%
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      vs. previous 7 days
                    </p>
                  </TabsContent>
                ))}
              </Tabs>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col pt-0 pb-2">
              <div className="flex min-h-0 flex-1 overflow-visible pb-1">
                <ChartContainer
                  config={overviewChartConfig}
                  className={homeOverviewLineChartClassName}
                >
                  <LineChart
                    key={overviewTab}
                    data={overviewChartData}
                    margin={{ left: 0, right: 2, top: 2, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <YAxis
                      hide
                      padding={{ top: 2, bottom: 0 }}
                      domain={["auto", "auto"]}
                    />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={14}
                      interval="preserveStartEnd"
                    />
                    <ChartTooltip content={renderSharedTooltip()} />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      stroke="var(--color-previous)"
                      strokeWidth={1.8}
                      strokeDasharray="5 5"
                      strokeOpacity={0.85}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="var(--color-current)"
                      strokeWidth={2.2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      stroke="var(--color-movingAvg)"
                      strokeWidth={1.7}
                      strokeOpacity={0.9}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="var(--color-target)"
                      strokeWidth={1.6}
                      strokeOpacity={0.78}
                      strokeDasharray="3 4"
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter className="grid py-3">
              <a
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "-me-3.5 inline-flex items-center gap-1 justify-self-end -me-1"
                )}
              >
                View report
                <ArrowRight className="size-4" />
              </a>
            </CardFooter>
          </Card>

          <Card className="flex min-h-0 w-full min-w-0 flex-col lg:basis-0 lg:flex-1">
            <CardHeader
              className={cn("shrink-0 space-y-0", homeTopCardHeaderClassName)}
            >
              <div className="flex flex-row items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <CardDescription className="text-[11px] uppercase tracking-tight">
                    Active users in the last 30 minutes
                  </CardDescription>
                  <div className="text-4xl font-semibold tabular-nums">
                    {realtimeActiveLast30Min.toLocaleString()}
                  </div>
                </div>
                <ButtonGroup>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button type="button" variant="outline" size="sm">
                          <Check
                            className="size-3.5 text-emerald-600 dark:text-emerald-500"
                            aria-hidden
                          />
                          <ChevronDown
                            className="size-3.5 opacity-70"
                            aria-hidden
                          />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Reporting window</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Last 15 minutes</DropdownMenuItem>
                      <DropdownMenuItem>Last 30 minutes</DropdownMenuItem>
                      <DropdownMenuItem>Last 60 minutes</DropdownMenuItem>
                      <DropdownMenuItem>Today</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button type="button" variant="outline" size="sm">
                    <Sparkles className="size-3.5 text-muted-foreground" />
                    <span className="sr-only">Insights</span>
                  </Button>
                </ButtonGroup>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-2">
              <p className="text-muted-foreground text-[11px] tracking-tight uppercase">
                Active users per minute
              </p>
              <div className="shrink-0">
                <ChartContainer
                  config={realtimeBarConfig}
                  className={homeRealtimeBarChartClassName}
                >
                  <BarChart
                    data={realtimeBars}
                    margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
                    barCategoryGap="2%"
                    barGap={0}
                  >
                    <XAxis
                      dataKey="m"
                      tickLine={{
                        stroke: "hsl(var(--muted-foreground) / 0.45)",
                        strokeWidth: 1,
                      }}
                      axisLine={{
                        stroke: "hsl(var(--border))",
                      }}
                      tick={false}
                      interval={0}
                    />
                    <ChartTooltip
                      content={renderSharedTooltip((label) =>
                        label != null && label !== "" ? `Minute ${label}` : "",
                      )}
                      cursor={{
                        fill: "var(--muted)",
                      }}
                    />
                    <Bar
                      dataKey="desktop"
                      name={
                        typeof realtimeBarConfig.desktop.label === "string"
                          ? realtimeBarConfig.desktop.label
                          : "Desktop"
                      }
                      stackId="active-users"
                      fill="var(--color-desktop)"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={12}
                    />
                    <Bar
                      dataKey="mobile"
                      name={
                        typeof realtimeBarConfig.mobile.label === "string"
                          ? realtimeBarConfig.mobile.label
                          : "Mobile"
                      }
                      stackId="active-users"
                      fill="var(--color-mobile)"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={12}
                    />
                    <Bar
                      dataKey="tablet"
                      name={
                        typeof realtimeBarConfig.tablet.label === "string"
                          ? realtimeBarConfig.tablet.label
                          : "Tablet"
                      }
                      stackId="active-users"
                      fill="var(--color-tablet)"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={12}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3.5">
                <div className="text-muted-foreground text-[11px] tracking-tight flex items-baseline justify-between gap-3 uppercase">
                  <span className="inline-flex items-center gap-0.5">
                    Country
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-0.5">
                    Active users
                  </span>
                </div>
                <div role="list" className="pb-3">
                  {realtimeByCountry.map((row, index) => {
                    return (
                      <div
                        key={row.country}
                        role="listitem"
                        className={cn(index > 0 && "mt-3")}
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-foreground min-w-0 truncate text-[13px] font-medium">
                            {row.country}
                          </span>
                          <span className="text-foreground shrink-0 tabular-nums text-[13px] font-medium">
                            {row.users.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-border/60 dark:bg-white/10 mt-1 h-px w-full overflow-hidden">
                          <ChartContainer
                            config={countryHairlineConfig}
                            className="aspect-auto h-full w-full"
                          >
                            <BarChart
                              layout="vertical"
                              data={[{ name: row.country, users: row.users }]}
                              margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                              barCategoryGap="0%"
                              barGap={0}
                            >
                              <XAxis
                                type="number"
                                hide
                                domain={[0, maxRealtimeCountryUsers]}
                              />
                              <YAxis type="category" dataKey="name" hide />
                              <Bar
                                dataKey="users"
                                fill="var(--color-users)"
                                radius={[999, 999, 999, 999]}
                                maxBarSize={1}
                                isAnimationActive
                                animationDuration={650}
                                animationEasing="ease-out"
                              />
                            </BarChart>
                          </ChartContainer>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="grid py-3">
              <a
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "-me-3.5 inline-flex items-center gap-1 justify-self-end -me-1"
                )}
              >
                View breakdown
                <ArrowRight className="size-4" />
              </a>
            </CardFooter>
          </Card>
        </div>
      </div>

      <section className="space-y-3 px-4 lg:px-6">
        <h3 className="text-lg font-display">Recently accessed</h3>
        <ScrollArea className="w-full pb-2">
          <div className="flex w-max gap-3 p-[1px]">
            {recentItems.map((item) => (
              <Card key={item.title} className="w-[230px] shrink-0">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="bg-primary/10 text-primary rounded-md p-2">
                    <item.icon className="size-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium leading-snug">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground text-xs">{item.time}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </section>

      <section className="grid gap-4 px-4 pb-6 xl:grid-cols-3 lg:px-6">
        <Card>
          <div className="flex h-full min-h-0 flex-col gap-3.5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium leading-snug">
                Sessions by Session default channel group
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 pb-2">
              <div className="text-muted-foreground flex items-baseline justify-between gap-3 text-[11px] tracking-tight uppercase">
                <span className="inline-flex items-center gap-0.5">
                  Channel
                </span>
                <span className="inline-flex items-center gap-4">
                  <span>Sessions</span>
                  <span className="w-[4.5rem] text-right">Delta</span>
                </span>
              </div>
              <div role="list">
                {channelSessions.map((row, index) => {
                  const isUp = row.change >= 0;
                  return (
                    <div
                      key={row.channel}
                      role="listitem"
                      className={cn(index > 0 && "mt-3")}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-foreground min-w-0 truncate text-[13px] font-medium">
                          {row.channel}
                        </span>
                        <div className="inline-flex shrink-0 items-center gap-4">
                          <span className="text-foreground tabular-nums text-[13px] font-medium">
                            {row.sessions.toLocaleString()}
                          </span>
                          <span
                            className={cn(
                              "inline-flex w-[4.5rem] items-center justify-end gap-0.5 tabular-nums text-[13px] font-medium",
                              isUp
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400",
                            )}
                          >
                            {isUp ? (
                              <ArrowUp className="size-3.5" />
                            ) : (
                              <ArrowDown className="size-3.5" />
                            )}
                            {Math.abs(row.change)}%
                          </span>
                        </div>
                      </div>
                      <div className="bg-border/60 dark:bg-white/10 mt-1 h-px w-full overflow-hidden">
                        <ChartContainer
                          config={channelHairlineConfig}
                          className="aspect-auto h-full w-full"
                        >
                          <BarChart
                            layout="vertical"
                            data={[
                              { name: row.channel, sessions: row.sessions },
                            ]}
                            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            barCategoryGap="0%"
                            barGap={0}
                          >
                            <XAxis
                              type="number"
                              hide
                              domain={[0, maxSessions]}
                            />
                            <YAxis type="category" dataKey="name" hide />
                            <Bar
                              dataKey="sessions"
                              fill="var(--color-sessions)"
                              radius={[999, 999, 999, 999]}
                              maxBarSize={1}
                              isAnimationActive
                              animationDuration={700}
                              animationEasing="ease-out"
                            />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="mt-auto flex items-center justify-between py-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" variant="ghost" className="-ms-2.5">
                      Last 7 days
                      <ChevronDown className="size-4 opacity-70" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Date range</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Today</DropdownMenuItem>
                  <DropdownMenuItem>Yesterday</DropdownMenuItem>
                  <DropdownMenuItem>This week</DropdownMenuItem>
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 28 days</DropdownMenuItem>
                  <DropdownMenuItem>This month</DropdownMenuItem>
                  <DropdownMenuItem>Last month</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <a
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "-me-3.5 inline-flex items-center gap-1 -me-1"
                )}
              >
                View traffic acquisition
                <ArrowRight className="size-4" />
              </a>
            </CardFooter>
          </div>
        </Card>

        <Card>
          <div className="flex h-full min-h-0 flex-col">
            <CardHeader className="space-y-4 pb-2">
              <Tabs defaultValue="purchaser" className="w-full gap-6">
                <TabsList className="grid w-full grid-cols-2" variant="line">
                  <TabsTrigger value="purchaser">Purchaser rate</TabsTrigger>
                  <TabsTrigger value="ftp">FTP rate</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="purchaser"
                  className="mt-0 outline-none flex-none data-[state=inactive]:hidden"
                >
                  <p className="text-4xl font-semibold tabular-nums">2.84%</p>
                </TabsContent>
                <TabsContent
                  value="ftp"
                  className="mt-0 outline-none flex-none data-[state=inactive]:hidden"
                >
                  <p className="text-4xl font-semibold tabular-nums">1.62%</p>
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <ChartContainer
                config={rateChartConfig}
                className="aspect-auto h-[180px] w-full"
              >
                <LineChart
                  data={rateChartData}
                  margin={{ left: 0, right: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={0}
                    interval="preserveStartEnd"
                    minTickGap={0}
                    scale="point"
                  />
                  <ChartTooltip content={renderSharedTooltip()} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--color-rate)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="mt-auto flex items-center py-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" variant="ghost" className="-ms-2.5">
                      Last 7 days
                      <ChevronDown className="size-4 opacity-70" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Date range</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Today</DropdownMenuItem>
                  <DropdownMenuItem>Yesterday</DropdownMenuItem>
                  <DropdownMenuItem>This week</DropdownMenuItem>
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 28 days</DropdownMenuItem>
                  <DropdownMenuItem>This month</DropdownMenuItem>
                  <DropdownMenuItem>Last month</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </div>
        </Card>

        <Card>
          <div className="flex h-full min-h-0 flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium leading-snug">
                Total purchasers vs First-time purchasers
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col pt-0 pb-3">
              <div className="flex min-h-0 flex-1">
                <ChartContainer
                  config={purchaserChartConfig}
                  className="aspect-auto h-full min-h-[180px] w-full"
                >
                  <LineChart
                    data={purchaserChartData}
                    margin={{ left: 0, right: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={0}
                      interval="preserveStartEnd"
                      minTickGap={0}
                      scale="point"
                    />
                    <ChartTooltip content={renderSharedTooltip()} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--color-total)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="firstTime"
                      stroke="var(--color-firstTime)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter className="mt-auto flex items-center py-3 justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" variant="ghost" className="-ms-2.5">
                      Last 7 days
                      <ChevronDown className="size-4 opacity-70" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Date range</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Today</DropdownMenuItem>
                  <DropdownMenuItem>Yesterday</DropdownMenuItem>
                  <DropdownMenuItem>This week</DropdownMenuItem>
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 28 days</DropdownMenuItem>
                  <DropdownMenuItem>This month</DropdownMenuItem>
                  <DropdownMenuItem>Last month</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <a
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "inline-flex items-center gap-1 justify-self-end -me-1 -me-3.5"
                )}
              >
                View breakdown
                <ArrowRight className="size-4" />
              </a>
            </CardFooter>
          </div>
        </Card>
      </section>
    </div>
  );
}

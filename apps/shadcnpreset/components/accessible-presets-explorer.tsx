"use client"

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { HomePaginationNav } from "@/components/home-pagination-nav"
import { FilterPicker } from "@/components/preset-filter-bar"
import { PresetStyleOverviewCard } from "@/components/preset-style-overview-card"
import { usePresetVoteMapsForItems } from "@/hooks/use-preset-votes-batch"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  accessiblePresetFiltersFromSearchParams,
  applyAccessiblePresetFiltersToSearchParams,
  clearAccessiblePresetFilterParams,
  deriveAccessiblePresetFilterOptions,
  filterAccessiblePresetItems,
  filtersActive,
  type AccessiblePresetExplorerFilters,
} from "@/lib/accessible-preset-filter"
import type { ListViewItem } from "@/lib/list-view"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 24

type AccessiblePresetsExplorerProps = {
  items: ListViewItem[]
}

function FilterSidebarBody({
  options,
  filters,
  setFilter,
  onReset,
  anchorRef,
  isMobile,
  className,
}: {
  options: ReturnType<typeof deriveAccessiblePresetFilterOptions>
  filters: AccessiblePresetExplorerFilters
  setFilter: <K extends keyof AccessiblePresetExplorerFilters>(
    key: K,
    value: AccessiblePresetExplorerFilters[K]
  ) => void
  onReset: () => void
  anchorRef: React.RefObject<HTMLDivElement | null>
  isMobile: boolean
  className?: string
}) {
  return (
    <div
      ref={anchorRef}
      className={cn(
        "flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-2 px-2 pt-2 pb-3">
          <span className="text-sm font-semibold">Filters</span>
          {filtersActive(filters) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 text-muted-foreground hover:text-sidebar-accent-foreground"
              onClick={onReset}
            >
              Reset
            </Button>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Look &amp; theme</SidebarGroupLabel>
          <SidebarGroupContent>
            <FieldGroup className="flex flex-col gap-3 px-1">
              <FilterPicker
                anchorRef={anchorRef}
                isMobile={isMobile}
                label="Style"
                indicator={<span className="indicator-square" />}
                onValueChange={(value) => setFilter("style", value)}
                options={["all", ...options.styles]}
                value={filters.style}
              />
              <FilterPicker
                anchorRef={anchorRef}
                isMobile={isMobile}
                label="Base Color"
                indicator={<span className="indicator-square" />}
                onValueChange={(value) => setFilter("baseColor", value)}
                options={["all", ...options.baseColors]}
                value={filters.baseColor}
              />
              <FilterPicker
                anchorRef={anchorRef}
                isMobile={isMobile}
                label="Theme"
                indicator={<span className="indicator-square" />}
                onValueChange={(value) => setFilter("theme", value)}
                options={["all", ...options.themes]}
                value={filters.theme}
              />
              <FilterPicker
                anchorRef={anchorRef}
                isMobile={isMobile}
                label="Chart"
                indicator={<span className="indicator-square" />}
                onValueChange={(value) => setFilter("chartColor", value)}
                options={["all", ...options.chartColors]}
                value={filters.chartColor}
              />
            </FieldGroup>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Type &amp; icons</SidebarGroupLabel>
          <SidebarGroupContent>
            <FieldGroup className="flex flex-col gap-3 px-1 pb-6">
              <FilterPicker
                anchorRef={anchorRef}
                isMobile={isMobile}
                label="Icons"
                indicator={<span className="indicator-square" />}
                onValueChange={(value) => setFilter("iconLibrary", value)}
                options={["all", ...options.iconLibraries]}
                value={filters.iconLibrary}
              />
              <FilterPicker
                anchorRef={anchorRef}
                isMobile={isMobile}
                label="Heading font"
                indicator={<span className="indicator-square" />}
                onValueChange={(value) => setFilter("fontHeading", value)}
                options={["all", ...options.fontHeadings]}
                value={filters.fontHeading}
              />
              <FilterPicker
                anchorRef={anchorRef}
                isMobile={isMobile}
                label="Body font"
                indicator={<span className="indicator-square" />}
                onValueChange={(value) => setFilter("font", value)}
                options={["all", ...options.fonts]}
                value={filters.font}
              />
            </FieldGroup>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </div>
  )
}

const mobileSheetClass =
  "w-[min(100vw-1rem,20rem)] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"

function buildPaginationHref(
  pathname: string,
  page: number,
  searchParams: URLSearchParams
) {
  const params = new URLSearchParams(searchParams.toString())
  if (page <= 1) {
    params.delete("page")
  } else {
    params.set("page", String(page))
  }
  const q = params.toString()
  return q ? `${pathname}?${q}` : pathname
}

export function AccessiblePresetsExplorer({
  items,
}: AccessiblePresetsExplorerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const desktopAnchorRef = React.useRef<HTMLDivElement | null>(null)
  const sheetAnchorRef = React.useRef<HTMLDivElement | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const options = React.useMemo(
    () => deriveAccessiblePresetFilterOptions(items),
    [items]
  )

  const filters = React.useMemo(
    () => accessiblePresetFiltersFromSearchParams(searchParams, options),
    [searchParams, options]
  )

  const filtered = React.useMemo(
    () => filterAccessiblePresetItems(items, filters),
    [items, filters]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10)
  const safePage = Math.min(
    totalPages,
    Math.max(1, Number.isFinite(rawPage) ? rawPage : 1)
  )

  React.useEffect(() => {
    if (filtered.length === 0) return
    if (rawPage === safePage) return
    const params = new URLSearchParams(searchParams.toString())
    if (safePage <= 1) params.delete("page")
    else params.set("page", String(safePage))
    const q = params.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }, [filtered.length, rawPage, safePage, pathname, router, searchParams])

  const start = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)
  const { votesByCode, hasVotedByCode } = usePresetVoteMapsForItems(pageItems)
  const rangeEnd =
    filtered.length === 0
      ? 0
      : Math.min(start + pageItems.length, filtered.length)

  const previousHref =
    safePage > 1
      ? buildPaginationHref(pathname, safePage - 1, searchParams)
      : undefined
  const nextHref =
    safePage < totalPages
      ? buildPaginationHref(pathname, safePage + 1, searchParams)
      : undefined

  function pushFilters(next: AccessiblePresetExplorerFilters) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    applyAccessiblePresetFiltersToSearchParams(params, next)
    const q = params.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }

  function setFilter<K extends keyof AccessiblePresetExplorerFilters>(
    key: K,
    value: AccessiblePresetExplorerFilters[K]
  ) {
    pushFilters({ ...filters, [key]: value })
  }

  function onReset() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    clearAccessiblePresetFilterParams(params)
    const q = params.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }

  const sheetInner = (
    <FilterSidebarBody
      options={options}
      filters={filters}
      setFilter={setFilter}
      onReset={onReset}
      anchorRef={sheetAnchorRef}
      isMobile
      className="min-h-0"
    />
  )

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col md:flex-row md:items-stretch">
      <aside
        className={cn(
          "hidden w-72 shrink-0 border-sidebar-border bg-sidebar md:sticky md:top-[var(--accessible-sidebar-top,5.5rem)] md:flex md:h-[calc(100svh-var(--accessible-sidebar-top,5.5rem)-6rem)] md:max-h-[calc(100svh-var(--accessible-sidebar-top,5.5rem)-6rem)] md:flex-col md:self-start md:overflow-hidden md:border-r"
        )}
      >
        <FilterSidebarBody
          options={options}
          filters={filters}
          setFilter={setFilter}
          onReset={onReset}
          anchorRef={desktopAnchorRef}
          isMobile={false}
          className="min-h-0"
        />
      </aside>

      <div className="min-h-0 min-w-0 flex-1">
        <div className="top-0 z-[1] flex flex-wrap items-center gap-3 border-b bg-background/95 px-2 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:top-[var(--accessible-sidebar-top,5.5rem)] md:px-4">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 md:hidden"
                />
              }
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Filters
            </SheetTrigger>
            <SheetContent side="left" className={mobileSheetClass}>
              <SheetHeader className="sr-only">
                <SheetTitle>Preset filters</SheetTitle>
              </SheetHeader>
              {sheetInner}
            </SheetContent>
          </Sheet>

          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            of {items.length} presets
            {filtered.length > 0 ? (
              <>
                {" "}
                ·{" "}
                <span className="tabular-nums">
                  {start + 1}–{rangeEnd} on this page
                </span>
              </>
            ) : null}
            {filtered.length === 0 ? (
              <span className="mt-1 block text-amber-600 dark:text-amber-400">
                No presets match — adjust filters.
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-col gap-6 px-2 py-6 md:px-4">
          {pageItems.length > 0 ? (
            <>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))] gap-6">
                {pageItems.map((item) => (
                  <li key={item.code}>
                    <PresetStyleOverviewCard
                      code={item.code}
                      title={item.code}
                      description={formatPresetCardDescription(item)}
                      initialVoteCount={votesByCode[item.code] ?? 0}
                      initialHasVoted={hasVotedByCode[item.code] ?? false}
                    />
                  </li>
                ))}
              </ul>
              {totalPages > 1 ? (
                <HomePaginationNav
                  previousHref={previousHref}
                  nextHref={nextHref}
                  safePage={safePage}
                  totalPages={totalPages}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

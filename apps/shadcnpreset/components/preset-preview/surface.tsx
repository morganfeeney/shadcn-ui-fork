"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"
import { CheckIcon, ChevronDownIcon, Settings2 } from "lucide-react"

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { Spinner } from "@/components/ui/spinner"
import { trackEvent } from "@/lib/analytics-events"
import { getPresetPreviewUrl } from "@/lib/preset"
import {
  PRESET_PREVIEW_VIEWS,
  type PresetPreviewPageName,
} from "@/lib/preset-preview"
import { cn } from "@/lib/utils"

import {
  type PresetPreviewStepItem,
  usePresetPreviewStep,
} from "@/components/preset-preview/step"

export type PresetPreviewSurfaceVariant = "dialog" | "embed"

export type PresetPreviewSurfaceProps = {
  variant: PresetPreviewSurfaceVariant
  /** Mirrors dialog open state — false lets layout-step keyboard shortcuts rest. */
  open: boolean
  code: string
  title: string
  description?: string
  previewStepOrder?: readonly PresetPreviewStepItem[]
  /** Dialog close control (typically `DialogTrigger` with an X icon). Omit in embed variant. */
  headerActionsSlot?: React.ReactNode
}

function PreviewIframeLayer({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = React.useState(false)
  return (
    <>
      <PresetV4Frame
        title={title}
        src={src}
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => setLoaded(true)}
      />
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Spinner />
        </div>
      ) : null}
    </>
  )
}

export function PresetPreviewSurface({
  variant,
  open,
  code,
  title,
  description,
  previewStepOrder,
  headerActionsSlot,
}: PresetPreviewSurfaceProps) {
  const pathname = usePathname()
  const [previewGen, setPreviewGen] = React.useState(0)
  const [previewPage, setPreviewPage] =
    React.useState<PresetPreviewPageName>("preview")
  const [previewPickerOpen, setPreviewPickerOpen] = React.useState(false)

  const afterPreviewStep = React.useCallback(() => {
    setPreviewPage("preview")
    setPreviewGen((g) => g + 1)
    setPreviewPickerOpen(false)
  }, [])

  const {
    viewCode,
    displayTitle,
    displayDesc,
    canStep,
    canPrev,
    canNext,
    stepPreset,
  } = usePresetPreviewStep({
    open,
    fromCard: { code, title, description },
    previewStepOrder,
    afterStep: afterPreviewStep,
  })

  React.useEffect(() => {
    if (!open) return
    setPreviewPage("preview")
    setPreviewGen((g) => g + 1)
    setPreviewPickerOpen(false)
  }, [open, code])

  const basePreviewUrl = getPresetPreviewUrl(viewCode)
  if (!basePreviewUrl) return null

  const previewSrc = getPresetPreviewUrl(viewCode, previewPage)!
  const titleClass =
    variant === "dialog"
      ? "font-mono text-sm tracking-tight md:text-xl"
      : "font-mono text-sm tracking-tight"
  const descriptionClass =
    variant === "dialog" ? "line-clamp-2 text-xs" : "text-xs"

  return (
    <>
      {variant === "dialog" ? (
        <DialogHeader className="gap-0 pb-4">
          <div className="flex justify-between">
            <div className="min-w-0">
              <DialogTitle className={titleClass}>{displayTitle}</DialogTitle>
              {displayDesc ? (
                <DialogDescription className={descriptionClass}>
                  {displayDesc}
                </DialogDescription>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <PresetVoteButton code={viewCode} enabled={open} />
              <Link
                href={`/preset/${viewCode}`}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "gap-2"
                )}
              >
                Edit
                <Settings2 aria-hidden />
              </Link>
              {headerActionsSlot}
            </div>
          </div>
        </DialogHeader>
      ) : (
        <CardHeader className="gap-0 border-b pb-4">
          <div className="flex justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className={titleClass}>{displayTitle}</CardTitle>
              {displayDesc ? (
                <CardDescription className={cn(descriptionClass, "mt-1")}>
                  {displayDesc}
                </CardDescription>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <PresetVoteButton code={viewCode} enabled={open} />
              <Link
                href={`/preset/${viewCode}`}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "sm",
                  }),
                  "gap-2"
                )}
              >
                Edit
                <Settings2 aria-hidden />
              </Link>
              {headerActionsSlot}
            </div>
          </div>
        </CardHeader>
      )}
      <div
        className={cn(
          "relative min-h-0",
          variant === "dialog" && "-mx-4",
          variant === "embed" && "min-h-[min(65dvh,560px)]"
        )}
      >
        {canStep ? (
          <Button
            type="button"
            size="icon"
            aria-label="Previous preset"
            disabled={!canPrev}
            className={cn(
              "absolute top-1/2 z-10 -translate-y-1/2",
              "hover:opacity-100",
              variant === "dialog" ? "-left-4 lg:-left-12 lg:size-10" : "-left-1",
              "transition-none active:translate-y-[calc(-50%+1px)]!"
            )}
            onClick={() => stepPreset(-1)}
          >
            <CaretLeftIcon className="size-4" weight="bold" />
          </Button>
        ) : null}
        <PreviewIframeLayer
          key={`${viewCode}-${previewPage}-${previewGen}`}
          src={previewSrc}
          title={`Preset preview ${viewCode} ${previewPage}`}
        />
        {canStep ? (
          <Button
            type="button"
            size="icon"
            aria-label="Next preset"
            disabled={!canNext}
            className={cn(
              "absolute top-1/2 z-10 -translate-y-1/2",
              "hover:opacity-100",
              variant === "dialog"
                ? "-right-4 lg:-right-12 lg:size-10"
                : "-right-1",
              "transition-none active:translate-y-[calc(-50%+1px)]!"
            )}
            onClick={() => stepPreset(1)}
          >
            <CaretRightIcon className="size-4" weight="bold" />
          </Button>
        ) : null}
      </div>
      {variant === "dialog" ? (
        <DialogFooter>
          <LayoutPickerPopover
            pathname={pathname}
            previewPickerOpen={previewPickerOpen}
            setPreviewPickerOpen={setPreviewPickerOpen}
            previewPage={previewPage}
            setPreviewPage={setPreviewPage}
            viewCode={viewCode}
          />
        </DialogFooter>
      ) : (
        <CardFooter className="border-t pb-4">
          <LayoutPickerPopover
            pathname={pathname}
            previewPickerOpen={previewPickerOpen}
            setPreviewPickerOpen={setPreviewPickerOpen}
            previewPage={previewPage}
            setPreviewPage={setPreviewPage}
            viewCode={viewCode}
            align="start"
          />
        </CardFooter>
      )}
    </>
  )
}

function LayoutPickerPopover({
  pathname,
  previewPickerOpen,
  setPreviewPickerOpen,
  previewPage,
  setPreviewPage,
  viewCode,
  align,
}: {
  pathname: string
  previewPickerOpen: boolean
  setPreviewPickerOpen: React.Dispatch<React.SetStateAction<boolean>>
  previewPage: PresetPreviewPageName
  setPreviewPage: React.Dispatch<React.SetStateAction<PresetPreviewPageName>>
  viewCode: string
  align?: "start" | "end"
}) {
  return (
    <Popover open={previewPickerOpen} onOpenChange={setPreviewPickerOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            type="button"
            aria-label="Choose preview layout"
            className="h-8 w-full min-w-42 justify-between gap-2 px-3 text-xs font-normal sm:w-auto"
          />
        }
      >
        <span className="truncate">{previewLayoutLabel(previewPage)}</span>
        <ChevronDownIcon className="size-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        side="top"
        align={align ?? "end"}
        sideOffset={8}
      >
        <Command>
          <CommandInput placeholder="Search previews…" />
          <CommandList>
            <CommandEmpty>No preview found.</CommandEmpty>
            <CommandGroup heading="Layouts">
              {PRESET_PREVIEW_VIEWS.map(({ page, label }) => (
                <CommandItem
                  key={page}
                  value={page}
                  keywords={[label, page]}
                  className="[&>svg:last-child]:hidden"
                  onSelect={() => {
                    const previous = previewPage
                    setPreviewPage(page)
                    setPreviewPickerOpen(false)
                    if (page !== previous) {
                      trackEvent("preset_demo_view_select", {
                        page_path: pathname,
                        preset_code: viewCode,
                        demo_view: page,
                      })
                    }
                  }}
                >
                  <span className="truncate">{label}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4 shrink-0",
                      previewPage === page ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function previewLayoutLabel(page: PresetPreviewPageName) {
  return PRESET_PREVIEW_VIEWS.find((v) => v.page === page)?.label ?? page
}

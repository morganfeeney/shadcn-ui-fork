"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  CheckIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  SlidersHorizontalIcon,
  XIcon,
  InfoIcon,
} from "@phosphor-icons/react"
import { useCallback, useMemo, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
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

export type { PresetPreviewStepItem }

export type PresetPreviewDialogProps = {
  code: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  previewStepOrder?: readonly PresetPreviewStepItem[]
}

function DialogPreviewIframe({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false)
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

export function PresetPreviewDialog({
  code,
  open,
  onOpenChange,
  title,
  description,
  previewStepOrder,
}: PresetPreviewDialogProps) {
  const pathname = usePathname()
  const [loadGen, setLoadGen] = useState(0)
  const [previewPage, setPreviewPage] =
    useState<PresetPreviewPageName>("preview")
  const [previewPickerOpen, setPreviewPickerOpen] = useState(false)

  const afterPreviewStep = useCallback(() => {
    setPreviewPage("preview")
    setLoadGen((g) => g + 1)
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

  const currentPreviewLabel = useMemo(
    () =>
      PRESET_PREVIEW_VIEWS.find((v) => v.page === previewPage)?.label ??
      previewPage,
    [previewPage]
  )

  const basePreviewUrl = getPresetPreviewUrl(viewCode)
  if (!basePreviewUrl) return null

  const previewSrc = getPresetPreviewUrl(viewCode, previewPage)!

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setLoadGen((g) => g + 1)
          setPreviewPage("preview")
          setPreviewPickerOpen(false)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent
        className="grid h-[90dvh] w-full max-w-[90dvw]! grid-rows-[auto_1fr_auto] gap-0"
        showCloseButton={false}
      >
        <DialogHeader className="gap-0 pb-4">
          <div className="flex justify-between">
            <div className="min-w-0">
              <DialogTitle className="font-mono text-sm tracking-tight md:text-xl">
                {displayTitle}
              </DialogTitle>
              {displayDesc ? (
                <DialogDescription className="line-clamp-2 text-xs">
                  {displayDesc}
                </DialogDescription>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <PresetVoteButton code={viewCode} enabled={open} />
              <Link
                href={`/pdp/${viewCode}`}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  })
                )}
              >
                Details <InfoIcon />
              </Link>
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
                <SlidersHorizontalIcon aria-hidden />
              </Link>
              <DialogTrigger
                render={
                  <Button variant="outline">
                    <XIcon />
                  </Button>
                }
              />
            </div>
          </div>
        </DialogHeader>
        <div className="relative -mx-4">
          {canStep ? (
            <Button
              type="button"
              size="icon"
              aria-label="Previous preset"
              disabled={!canPrev}
              className={cn(
                "absolute top-1/2 z-10 -translate-y-1/2",
                "hover:opacity-100",
                "-left-4",
                "lg:-left-12 lg:size-10",
                "transition-none active:translate-y-[calc(-50%+1px)]!"
              )}
              onClick={() => stepPreset(-1)}
            >
              <CaretLeftIcon className="size-4" weight="bold" />
            </Button>
          ) : null}
          <DialogPreviewIframe
            key={`${viewCode}-${previewPage}-${loadGen}`}
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
                "-right-4",
                "lg:-right-12 lg:size-10",
                "transition-none active:translate-y-[calc(-50%+1px)]!"
              )}
              onClick={() => stepPreset(1)}
            >
              <CaretRightIcon className="size-4" weight="bold" />
            </Button>
          ) : null}
        </div>
        <DialogFooter>
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
              <span className="truncate">{currentPreviewLabel}</span>
              <CaretDownIcon className="size-3.5 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent
              className="w-72 p-0"
              side="top"
              align="end"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import Link from "next/link"
import { CheckIcon, ChevronDownIcon, Settings2, X } from "lucide-react"
import { useMemo, useState } from "react"

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { PresetV4Frame } from "@/components/preset-v4-frame"
import { PresetVoteButton } from "@/components/preset-vote-button"
import { Spinner } from "@/components/ui/spinner"
import {
  getPresetPreviewUrl,
  PRESET_PREVIEW_VIEWS,
  type PresetPreviewPageName,
} from "@/lib/preset"

export type PresetPreviewDialogProps = {
  code: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
}

/** Isolated so `key` remount resets loading state without effects. */
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
}: PresetPreviewDialogProps) {
  const [loadGen, setLoadGen] = useState(0)
  const [previewPage, setPreviewPage] =
    useState<PresetPreviewPageName>("preview")
  const [previewPickerOpen, setPreviewPickerOpen] = useState(false)

  const currentPreviewLabel = useMemo(
    () =>
      PRESET_PREVIEW_VIEWS.find((v) => v.page === previewPage)?.label ??
      previewPage,
    [previewPage]
  )

  const basePreviewUrl = getPresetPreviewUrl(code)
  if (!basePreviewUrl) return null

  const previewSrc = getPresetPreviewUrl(code, previewPage)!

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
        className="grid h-[90dvh] w-full max-w-[90dvw]! grid-rows-[auto_1fr_auto] gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="gap-0 pb-4">
          <div className="flex justify-between">
            <div>
              <DialogTitle className="font-mono text-sm tracking-tight md:text-xl">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="line-clamp-2 text-xs">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
            <div className="flex gap-2">
              <PresetVoteButton code={code} enabled={open} />
              <Link
                href={`/preset/${code}`}
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
              <DialogTrigger
                render={
                  <Button variant="outline">
                    <X />
                  </Button>
                }
              />
            </div>
          </div>
        </DialogHeader>
        <div className="relative -mx-4">
          <DialogPreviewIframe
            key={`${code}-${previewPage}-${loadGen}`}
            src={previewSrc}
            title={`Preset preview ${code} ${previewPage}`}
          />
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
                  className="h-8 w-full min-w-[10.5rem] justify-between gap-2 px-3 text-xs font-normal sm:w-auto"
                />
              }
            >
              <span className="truncate">{currentPreviewLabel}</span>
              <ChevronDownIcon className="size-3.5 shrink-0 opacity-50" />
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
                          setPreviewPage(page)
                          setPreviewPickerOpen(false)
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

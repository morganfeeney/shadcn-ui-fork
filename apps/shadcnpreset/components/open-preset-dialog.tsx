"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parsePresetInput } from "@/lib/parse-preset-input"
import { resolvePresetFromCode } from "@/lib/preset"

export function OpenPresetDialog({
  className,
  children = "Open Preset",
  open: openControlled,
  onOpenChange,
}: {
  className?: string
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const controlled = openControlled !== undefined
  const open = controlled ? openControlled : internalOpen
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [controlled, onOpenChange]
  )
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const parsed = React.useMemo(() => parsePresetInput(value), [value])
  const canOpen = Boolean(parsed && resolvePresetFromCode(parsed))

  React.useEffect(() => {
    if (!open) {
      setValue("")
      setError(null)
    }
  }, [open])

  function tryOpen() {
    setError(null)
    const code = parsePresetInput(value)
    if (!code) {
      setError("Enter a valid preset code or `--preset …` command.")
      return
    }
    const preset = resolvePresetFromCode(code)
    if (!preset) {
      setError("That preset code is not recognized.")
      return
    }
    setOpen(false)
    router.push(`/preset/${encodeURIComponent(preset.code)}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlled ? (
        <DialogTrigger render={<button type="button" className={className} />}>
          {children}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open Preset</DialogTitle>
          <DialogDescription>
            Paste a preset code to load a saved configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                tryOpen()
              }
            }}
            placeholder="b2D0wqNxT or --preset b2D0wqNxT"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!error}
          />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="button" disabled={!canOpen} onClick={tryOpen}>
            Open
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

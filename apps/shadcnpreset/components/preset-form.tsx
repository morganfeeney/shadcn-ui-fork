"use client"

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import * as React from "react"
import { ChevronDownIcon, SparklesIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { trackEvent } from "@/lib/analytics-events"
import {
  clearAiSearchContext,
  readAiSearchContextForRoute,
} from "@/lib/search/ai/session"
import {
  buildSearchHref,
  isSearchMode,
  parseSearchRouteFromLocation,
} from "@/lib/search/route"
import { cn } from "@/lib/utils"

export function PresetForm({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const routeParams = useParams()
  const searchParams = useSearchParams()

  const [mode, setMode] = React.useState<"code" | "smart">("code")
  const [query, setQuery] = React.useState("")
  const [aiUserDescription, setAiUserDescription] = React.useState<
    string | null
  >(null)

  const routeMode = routeParams.mode
  const routeQuery = routeParams.query

  React.useEffect(() => {
    const parsed = parseSearchRouteFromLocation(pathname, {
      mode: routeMode as string | string[] | undefined,
      query: routeQuery as string | string[] | undefined,
    })
    if (parsed) {
      setMode(parsed.mode)
      setQuery(parsed.query)
      if (parsed.mode === "smart" && parsed.query) {
        const ctx = readAiSearchContextForRoute(parsed.query)
        setAiUserDescription(ctx?.userSummary ?? null)
      } else {
        setAiUserDescription(null)
      }
      return
    }
    if (pathname === "/") {
      setQuery("")
      setAiUserDescription(null)
      const modeParam = searchParams.get("mode")
      if (modeParam && isSearchMode(modeParam)) {
        setMode(modeParam)
      } else {
        setMode("code")
      }
    }
  }, [pathname, routeMode, routeQuery, searchParams])

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = query.trim()

    if (!normalized) {
      router.push("/")
      return
    }

    trackEvent("search_submit", {
      page_path: pathname,
      search_mode: mode,
      search_term: normalized,
    })

    if (mode === "code") {
      router.push(`/preset/${encodeURIComponent(normalized)}`)
      return
    }

    clearAiSearchContext()
    setAiUserDescription(null)
    router.push(buildSearchHref(mode, normalized))
  }

  return (
    <>
    <form className={cn("grid gap-2.5", className)} onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="preset-query">
        Search presets
      </label>
      {mode === "smart" && aiUserDescription ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/90">
            From your AI description:
          </span>{" "}
          {aiUserDescription}
          <span className="mt-1 block text-[0.7rem] text-muted-foreground/90">
            The field below is the keyword phrase used for matching—you can edit
            it and search again.
          </span>
        </p>
      ) : null}
      <InputGroup className="h-9">
        <InputGroupAddon align="inline-start">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <InputGroupButton
                  variant="ghost"
                  className="pr-1.5! text-xs"
                  aria-label="Search mode"
                >
                  {mode === "code" ? "Preset code" : "Smart search"}
                  <ChevronDownIcon className="size-3" />
                </InputGroupButton>
              }
            />
            <DropdownMenuContent align="start" sideOffset={8} className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setMode("code")}>
                  Preset code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("smart")}>
                  Smart search
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/assistant")
                  }}
                >
                  <SparklesIcon className="size-3.5 opacity-70" />
                  AI preset finder
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
        <InputGroupInput
          id="preset-query"
          autoComplete="off"
          placeholder={
            mode === "code"
              ? "Enter preset code (example: b4aRK5K0fb)"
              : "Describe what you want (e.g. vibrant dashboard, rounded cards)"
          }
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" variant="secondary">
            {mode === "code" ? "Open preset" : "Search"}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
    </>
  )
}

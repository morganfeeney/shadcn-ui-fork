"use client"

import { lazy, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { SquareIcon } from "lucide-react"
import type { IconLibraryName } from "shadcn/icons"
import { decodePreset, isPresetCode } from "shadcn/preset"

import { useDesignSystemSearchParams } from "@/app/(create)/lib/search-params"

const IconLucide = lazy(() =>
  import("@/registry/icons/icon-lucide").then((mod) => ({
    default: mod.IconLucide,
  }))
)

const IconTabler = lazy(() =>
  import("@/registry/icons/icon-tabler").then((mod) => ({
    default: mod.IconTabler,
  }))
)

const IconHugeicons = lazy(() =>
  import("@/registry/icons/icon-hugeicons").then((mod) => ({
    default: mod.IconHugeicons,
  }))
)

const IconPhosphor = lazy(() =>
  import("@/registry/icons/icon-phosphor").then((mod) => ({
    default: mod.IconPhosphor,
  }))
)

const IconRemixicon = lazy(() =>
  import("@/registry/icons/icon-remixicon").then((mod) => ({
    default: mod.IconRemixicon,
  }))
)

// Preload all icon renderer modules so switching libraries is instant.
// These warm the browser module cache; React.lazy resolves immediately
// for modules that are already loaded.
void import("@/registry/icons/icon-lucide")
void import("@/registry/icons/icon-tabler")
void import("@/registry/icons/icon-hugeicons")
void import("@/registry/icons/icon-phosphor")
void import("@/registry/icons/icon-remixicon")

type IconPlaceholderProps = {
  [K in IconLibraryName]: string
} & React.ComponentProps<"svg"> & {
  /**
   * When set (e.g. preset swatch), ignores the create-page URL. Otherwise the
   * active library comes from `useDesignSystemSearchParams` (e.g. /create).
   */
  iconLibrary?: IconLibraryName
}

export function IconPlaceholder({
  iconLibrary: iconLibraryFromProps,
  lucide,
  tabler,
  hugeicons,
  phosphor,
  remixicon,
  ...rest
}: IconPlaceholderProps) {
  const searchParams = useSearchParams()
  const [{ iconLibrary: iconLibraryFromUrl }] = useDesignSystemSearchParams()

  const iconLibraryFromPreset = useMemo(() => {
    const preset = searchParams.get("preset")
    if (!preset || !isPresetCode(preset)) {
      return null
    }

    const decoded = decodePreset(preset)
    return decoded?.iconLibrary ?? null
  }, [searchParams])

  const iconLibrary =
    iconLibraryFromProps ?? iconLibraryFromPreset ?? iconLibraryFromUrl

  const nameByLib: Record<IconLibraryName, string> = {
    lucide,
    tabler,
    hugeicons,
    phosphor,
    remixicon,
  }
  const iconName = nameByLib[iconLibrary]

  if (!iconName) {
    return null
  }

  return (
    <Suspense fallback={<SquareIcon {...rest} />}>
      {iconLibrary === "lucide" && (
        <IconLucide name={lucide} {...rest} />
      )}
      {iconLibrary === "tabler" && (
        <IconTabler name={tabler} {...rest} />
      )}
      {iconLibrary === "hugeicons" && (
        <IconHugeicons name={hugeicons} {...rest} />
      )}
      {iconLibrary === "phosphor" && (
        <IconPhosphor name={phosphor} {...rest} />
      )}
      {iconLibrary === "remixicon" && (
        <IconRemixicon name={remixicon} {...rest} />
      )}
    </Suspense>
  )
}

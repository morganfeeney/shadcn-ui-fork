"use client"

import type { IconLibraryName } from "shadcn/icons"

import { IconPlaceholder } from "@/components/icon-placeholder"
import { Card, CardContent } from "@/components/poc/ui/card"

/** Same icon set as v4 `blocks/preview/cards/icon-preview-grid`. */
export const PREVIEW_ICON_NAMES: Array<Record<IconLibraryName, string>> = [
  {
    lucide: "CopyIcon",
    tabler: "IconCopy",
    hugeicons: "Copy01Icon",
    phosphor: "CopyIcon",
    remixicon: "RiFileCopyLine",
  },
  {
    lucide: "CircleAlertIcon",
    tabler: "IconExclamationCircle",
    hugeicons: "AlertCircleIcon",
    phosphor: "WarningCircleIcon",
    remixicon: "RiErrorWarningLine",
  },
  {
    lucide: "TrashIcon",
    tabler: "IconTrash",
    hugeicons: "Delete02Icon",
    phosphor: "TrashIcon",
    remixicon: "RiDeleteBinLine",
  },
  {
    lucide: "ShareIcon",
    tabler: "IconShare",
    hugeicons: "Share03Icon",
    phosphor: "ShareIcon",
    remixicon: "RiShareLine",
  },
  {
    lucide: "ShoppingBagIcon",
    tabler: "IconShoppingBag",
    hugeicons: "ShoppingBag01Icon",
    phosphor: "BagIcon",
    remixicon: "RiShoppingBagLine",
  },
  {
    lucide: "MoreHorizontalIcon",
    tabler: "IconDots",
    hugeicons: "MoreHorizontalCircle01Icon",
    phosphor: "DotsThreeIcon",
    remixicon: "RiMoreLine",
  },
  {
    lucide: "Loader2Icon",
    tabler: "IconLoader",
    hugeicons: "Loading03Icon",
    phosphor: "SpinnerIcon",
    remixicon: "RiLoaderLine",
  },
  {
    lucide: "PlusIcon",
    tabler: "IconPlus",
    hugeicons: "PlusSignIcon",
    phosphor: "PlusIcon",
    remixicon: "RiAddLine",
  },
  {
    lucide: "MinusIcon",
    tabler: "IconMinus",
    hugeicons: "MinusSignIcon",
    phosphor: "MinusIcon",
    remixicon: "RiSubtractLine",
  },
  {
    lucide: "ArrowLeftIcon",
    tabler: "IconArrowLeft",
    hugeicons: "ArrowLeft02Icon",
    phosphor: "ArrowLeftIcon",
    remixicon: "RiArrowLeftLine",
  },
  {
    lucide: "ArrowRightIcon",
    tabler: "IconArrowRight",
    hugeicons: "ArrowRight02Icon",
    phosphor: "ArrowRightIcon",
    remixicon: "RiArrowRightLine",
  },
  {
    lucide: "CheckIcon",
    tabler: "IconCheck",
    hugeicons: "Tick02Icon",
    phosphor: "CheckIcon",
    remixicon: "RiCheckLine",
  },
  {
    lucide: "ChevronDownIcon",
    tabler: "IconChevronDown",
    hugeicons: "ArrowDown01Icon",
    phosphor: "CaretDownIcon",
    remixicon: "RiArrowDownSLine",
  },
  {
    lucide: "ChevronRightIcon",
    tabler: "IconChevronRight",
    hugeicons: "ArrowRight01Icon",
    phosphor: "CaretRightIcon",
    remixicon: "RiArrowRightSLine",
  },
  {
    lucide: "SearchIcon",
    tabler: "IconSearch",
    hugeicons: "Search01Icon",
    phosphor: "MagnifyingGlassIcon",
    remixicon: "RiSearchLine",
  },
  {
    lucide: "SettingsIcon",
    tabler: "IconSettings",
    hugeicons: "Settings01Icon",
    phosphor: "GearIcon",
    remixicon: "RiSettingsLine",
  },
]

export type PreviewIconGridProps = {
  iconLibrary: IconLibraryName
}

/** Port of v4 `icon-preview-grid` (card-wrapped tiles to match PoC). */
export function PreviewIconGrid({ iconLibrary }: PreviewIconGridProps) {
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-8 place-items-center gap-4">
          {PREVIEW_ICON_NAMES.map((names) => (
            <Card
              key={names.lucide}
              className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4"
            >
              <IconPlaceholder iconLibrary={iconLibrary} {...names} />
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PreviewIconGridLg({ iconLibrary }: PreviewIconGridProps) {
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-5 place-items-center gap-4">
          {PREVIEW_ICON_NAMES.slice(0, 15).map((names) => (
            <Card
              key={names.lucide}
              className="flex size-16 items-center justify-center p-0 shadow-none *:[svg]:size-7"
            >
              <IconPlaceholder iconLibrary={iconLibrary} {...names} />
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

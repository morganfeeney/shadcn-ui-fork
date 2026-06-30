"use client"

import React, { PropsWithChildren, ReactNode } from "react"
import { usePathname } from "next/navigation"

import isPathActive from "@/lib/is-path-active"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  CaretDownIcon,
  CircleHalfIcon,
  FolderOpenIcon,
  GaugeIcon,
  HeartIcon,
  PaintBrushIcon,
  WrenchIcon,
  ListIcon,
} from "@phosphor-icons/react"

import {
  PRESET_COLOR_CONTRAST_TOOL,
  PRESET_THEME_GENERATOR_TOOL,
  TOOLS_PAGE,
} from "@/app/tools/tools"

import { Link } from "@/components/zippystarter/link"
import { Container } from "@/components/zippystarter/container"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/zippystarter/logo"
import { ModeSwitcher } from "@/components/mode-switcher"
import { GitHubLink } from "@/components/github-link"
import { UserMenu } from "@/components/user-menu"
import { OpenPresetDialog } from "@/components/open-preset-dialog"
import { Button } from "@/components/ui/button"

export type NavChildLink =
  | {
      label: string
      href: string
      description?: string
      icon: React.ElementType
      openInNewTab?: boolean
    }
  | {
      label: string
      description?: string
      icon: React.ElementType
      action: "open-preset"
    }

/** Top-level entry: flat link, or parent with `children` mega-menu (parent `href` is for keys only). */
export type ComponentLink = {
  href: string
  label: string
  openInNewTab?: boolean
  children?: NavChildLink[]
}

type ComponentLinkWithChildren = ComponentLink

const HEADER_LINKS: ComponentLink[] = [
  { href: "/assistant", label: "Ask AI" },
  { href: "/community", label: "Community" },
  {
    href: "presets",
    label: "Presets",
    children: [
      {
        label: "High contrast",
        href: "/high-contrast-presets",
        description: "Presets with a 100% color contrast score",
        icon: CircleHalfIcon,
      },
      {
        label: "My presets",
        href: "/my-presets",
        description: "Configurations you’ve saved.",
        icon: HeartIcon,
      },
      {
        label: "Open Preset",
        description: "Load a preset from its code.",
        icon: FolderOpenIcon,
        action: "open-preset",
      },
    ],
  },
  {
    href: "tools",
    label: "Tools",
    children: [
      {
        label: TOOLS_PAGE.title,
        href: TOOLS_PAGE.href,
        description: TOOLS_PAGE.description,
        icon: WrenchIcon,
      },
      {
        label: PRESET_THEME_GENERATOR_TOOL.title,
        href: PRESET_THEME_GENERATOR_TOOL.href,
        description: PRESET_THEME_GENERATOR_TOOL.cardDescription,
        icon: PaintBrushIcon,
      },
      {
        label: PRESET_COLOR_CONTRAST_TOOL.title,
        href: PRESET_COLOR_CONTRAST_TOOL.href,
        description: PRESET_COLOR_CONTRAST_TOOL.cardDescription,
        icon: GaugeIcon,
      },
    ],
  },
]

interface NavItemProps extends PropsWithChildren {
  href: string
  isActive: boolean
  openInNewTab?: boolean
}

function NavItemMobile({
  isActive,
  href,
  children,
  openInNewTab,
}: NavItemProps) {
  return (
    <Link
      className={cn(
        "inline-grid h-10 items-center px-4 py-2 text-sm font-medium transition",
        {
          "text-header-foreground": isActive,
          "text-foreground hover:text-header-foreground": !isActive,
        }
      )}
      href={href}
      {...(openInNewTab && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
    >
      {children}
    </Link>
  )
}

type NavItemMobileRow =
  | {
      kind: "link"
      href: string
      label: string
      openInNewTab?: boolean
    }
  | { kind: "open-preset"; label: string }

function isOpenPresetChild(
  child: NavChildLink
): child is Extract<NavChildLink, { action: "open-preset" }> {
  return "action" in child && child.action === "open-preset"
}

function flattenMobileLinks(links: ComponentLink[]): NavItemMobileRow[] {
  return links.flatMap((link): NavItemMobileRow[] => {
    if (!link.children) {
      return [
        {
          kind: "link",
          href: link.href,
          label: link.label,
          openInNewTab: link.openInNewTab,
        },
      ]
    }
    return link.children.map((child): NavItemMobileRow => {
      if (isOpenPresetChild(child)) {
        return { kind: "open-preset", label: child.label }
      }
      return {
        kind: "link",
        href: child.href,
        label: child.label,
        openInNewTab: child.openInNewTab,
      }
    })
  })
}

interface DesktopNavProps {
  links: ComponentLinkWithChildren[]
  actions: ReactNode
  pathname: string
  className?: string
  onOpenPreset: () => void
}

function submenuParentActive(
  pathname: string,
  children: NavChildLink[]
): boolean {
  return children.some(
    (child) => "href" in child && isPathActive(pathname, child.href)
  )
}

function DesktopNav({
  links,
  actions,
  pathname,
  className,
  onOpenPreset,
}: DesktopNavProps) {
  const [openMenuHref, setOpenMenuHref] = React.useState<string | null>(null)

  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-between gap-8",
        className
      )}
    >
      <NavigationMenu>
        <NavigationMenuList className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {links.map(({ href, label, children, openInNewTab }) => {
            if (children?.length) {
              const active = submenuParentActive(pathname, children)
              return (
                <NavigationMenuItem key={href}>
                  <Popover
                    open={openMenuHref === href}
                    onOpenChange={(nextOpen) => {
                      setOpenMenuHref(nextOpen ? href : null)
                    }}
                  >
                    <PopoverTrigger
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "group max-w-full text-header-foreground/90 data-popup-open:bg-accent/30",
                        active && "bg-muted/50"
                      )}
                    >
                      {label}{" "}
                      <CaretDownIcon
                        weight="bold"
                        className="relative top-px ml-1 size-4 shrink-0 transition duration-300 group-data-popup-open:rotate-180"
                        aria-hidden="true"
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[320px] max-w-full border-0 bg-transparent p-0 pt-1 shadow-none ring-0"
                      align="start"
                      sideOffset={8}
                    >
                      <ul className="grid gap-1 rounded-[1rem] border border-border/60 bg-popover p-2 shadow-md ring-1 ring-border/40">
                        {children.map((component) =>
                          isOpenPresetChild(component) ? (
                            <MegaMenuPresetRow
                              key={component.label}
                              label={component.label}
                              description={component.description}
                              icon={component.icon}
                              onOpen={() => {
                                setOpenMenuHref(null)
                                onOpenPreset()
                              }}
                            />
                          ) : (
                            <ListItem
                              key={component.label}
                              title={component.label}
                              href={component.href}
                              icon={component.icon}
                              openInNewTab={component.openInNewTab}
                              onClick={() => setOpenMenuHref(null)}
                            >
                              {component.description}
                            </ListItem>
                          )
                        )}
                      </ul>
                    </PopoverContent>
                  </Popover>
                </NavigationMenuItem>
              )
            }
            return (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink
                  active={isPathActive(pathname, href)}
                  render={
                    <Link
                      href={href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "text-header-foreground/80 hover:text-header-foreground"
                      )}
                      {...(openInNewTab && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                    />
                  }
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex min-w-0 flex-wrap items-center gap-6 xl:gap-12">
        <div className="grid items-center gap-1 md:flex">{actions}</div>
      </div>
    </div>
  )
}

function MegaMenuPresetRow({
  label,
  description,
  icon: Icon,
  onOpen,
}: {
  label: string
  description?: string
  icon: React.ElementType
  onOpen: () => void
}) {
  return (
    <li className="list-none">
      <button
        type="button"
        className={cn(
          "grid w-full grid-cols-[auto_1fr] items-start gap-2.5 rounded-3xl p-2 text-left transition-colors",
          "hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={onOpen}
      >
        <div className="grid size-9 place-items-center rounded-xl bg-accent/60 p-1">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="mt-0.5 grid gap-1">
          <div className="text-sm leading-none font-medium">{label}</div>
          {description ? (
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </button>
    </li>
  )
}

interface MobileNavProps {
  links: ComponentLink[]
  actions: ReactNode
  pathname: string
  className?: string
  onOpenPreset: () => void
}

function MobileNav({
  links,
  pathname,
  className,
  actions,
  onOpenPreset,
}: MobileNavProps) {
  const [isOpen, setOpen] = React.useState(false)
  const flat = React.useMemo(() => flattenMobileLinks(links), [links])

  React.useEffect(() => {
    if (pathname) {
      setOpen(false)
    }
  }, [pathname])

  return (
    <div className={className}>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger
          render={<Button size="icon" variant="outline" className="size-8" />}
        >
          <ListIcon weight="bold" className="size-5" aria-hidden />
        </SheetTrigger>
        <SheetContent className="pt-2">
          <SheetHeader className="sr-only text-start">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Choose your destination</SheetDescription>
          </SheetHeader>
          <nav className="grid py-1">
            {flat.map((entry) =>
              entry.kind === "open-preset" ? (
                <button
                  key={`open:${entry.label}`}
                  type="button"
                  className="inline-grid h-10 items-center px-4 py-2 text-left text-sm font-medium transition hover:text-header-foreground"
                  onClick={() => {
                    setOpen(false)
                    onOpenPreset()
                  }}
                >
                  {entry.label}
                </button>
              ) : (
                <NavItemMobile
                  key={entry.href}
                  href={entry.href}
                  isActive={isPathActive(pathname, entry.href)}
                  openInNewTab={entry.openInNewTab}
                >
                  {entry.label}
                </NavItemMobile>
              )
            )}

            <div className="grid gap-2 px-4 pt-4">
              <hr className="-mx-4 my-2 border-border/60" />
              {actions}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function ListItem({
  title,
  children,
  href,
  icon,
  openInNewTab,
  onClick,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string
  icon: React.ElementType
  openInNewTab?: boolean
  onClick?: () => void
}) {
  const Icon = icon
  return (
    <li {...props}>
      <NavigationMenuLink
        render={
          <Link
            href={href}
            className="grid grid-cols-[auto_1fr] items-start gap-2.5 rounded-3xl p-2 transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={onClick}
            {...(openInNewTab && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
          />
        }
      >
        <div className="grid size-9 place-items-center rounded-xl bg-accent/60 p-1">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="mt-0.5 grid gap-1">
          <div className="text-sm leading-none font-medium">{title}</div>
          {children ? (
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {children}
            </p>
          ) : null}
        </div>
      </NavigationMenuLink>
    </li>
  )
}

export interface Header1Props {
  logo?: ReactNode
  links?: ComponentLink[]
  actions?: ReactNode
  pathname?: string
  className?: string
  wrapperClassName?: string
}

function LogoLink() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-sm font-medium tracking-tighter"
    >
      <Logo className="size-5" />
      shadcnpreset
    </Link>
  )
}

const defaultToolbar = (
  <>
    <ModeSwitcher />
    <GitHubLink />
    <Separator
      orientation="vertical"
      className="mx-1 mt-1 mr-3 hidden h-6 sm:inline-flex"
    />
    <UserMenu />
  </>
)

export function Header1({
  logo = <LogoLink />,
  links = HEADER_LINKS,
  actions = defaultToolbar,
  pathname: pathnameProp,
  className,
  wrapperClassName,
}: Header1Props) {
  const pathnameFromRouter = usePathname()
  const pathname = pathnameProp ?? pathnameFromRouter ?? ""
  const [presetDialogOpen, setPresetDialogOpen] = React.useState(false)
  const onOpenPreset = React.useCallback(() => setPresetDialogOpen(true), [])

  const mobileActions = React.useMemo(
    () => (
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {actions}
      </div>
    ),
    [actions]
  )

  return (
    <>
      <div className={cn("bg-header", wrapperClassName)}>
        <Container
          component="header"
          className={cn(
            "grid max-w-[unset]! items-center gap-6 py-2 text-header-foreground",
            className
          )}
          wrapperClassName="bg-transparent"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-6 lg:gap-12">
            {logo}

            <div className="col-start-2 row-start-1 flex min-w-0 justify-end lg:justify-between">
              <DesktopNav
                // Force remount on navigation to avoid transient popover state flicker on history back/forward.
                key={pathname}
                links={links}
                actions={actions}
                pathname={pathname}
                onOpenPreset={onOpenPreset}
                className="hidden min-w-0 md:flex lg:justify-between"
              />

              <MobileNav
                links={links}
                actions={mobileActions}
                pathname={pathname}
                onOpenPreset={onOpenPreset}
                className="md:hidden"
              />
            </div>
          </div>
        </Container>
      </div>

      <OpenPresetDialog
        open={presetDialogOpen}
        onOpenChange={setPresetDialogOpen}
      />
    </>
  )
}

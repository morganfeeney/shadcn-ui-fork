"use client"

import React, { PropsWithChildren, ReactNode } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MenuIcon } from "lucide-react"
import type { VariantProps } from "class-variance-authority"
import { Link } from "@/components/zippystarter/link"
import { Container } from "@/components/zippystarter/container"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/zippystarter/logo"
import { ModeSwitcher } from "@/components/mode-switcher"
import { GitHubLink } from "@/components/github-link"
import { UserMenu } from "@/components/user-menu"
import { OpenPresetDialog } from "@/components/open-preset-dialog"

const HEADER_LINKS: ComponentLink[] = [
  { type: "link", href: "/assistant", label: "Ask AI" },
  { type: "link", href: "/community", label: "Community" },
  { type: "link", href: "/tools", label: "Tools" },
  { type: "link", href: "/my-presets", label: "My presets" },
  { type: "action", action: "open-preset", label: "Open Preset" },
]

const isPathActive = (pathname: string, href: string) => {
  const regex = new RegExp(`^${href}`)
  return regex.test(pathname)
}

type ComponentLink =
  | {
      type: "link"
      href: string
      label: string
      button?: VariantProps<typeof buttonVariants>["variant"]
    }
  | {
      type: "action"
      action: "open-preset"
      label: string
      button?: VariantProps<typeof buttonVariants>["variant"]
    }

interface NavItemProps extends PropsWithChildren {
  href: string
  isActive?: boolean
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

function NavItemDesktop({ isActive, href, children }: NavItemProps) {
  return (
    <Link
      className={cn(
        "relative inline-grid h-8 items-center text-sm font-medium text-header-foreground/60 transition hover:text-header-foreground",
        {
          "text-header-foreground": isActive,
        }
      )}
      href={href}
      key={href}
    >
      {children}
    </Link>
  )
}

function NavItemMobile({ isActive, href, children }: NavItemProps) {
  return (
    <Link
      className={cn(
        "inline-grid h-10 items-center px-4 py-2 text-sm font-medium text-header-foreground/60 transition hover:text-header-foreground",
        {
          "text-foreground": isActive,
        }
      )}
      href={href}
      key={href}
    >
      {children}
    </Link>
  )
}

interface DesktopNavProps {
  links: ComponentLink[]
  pathname: string
  className?: string
}

function DesktopNav({ links, pathname, className }: DesktopNavProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-6 md:flex md:flex-1 md:justify-end",
        className
      )}
    >
      <nav className="flex items-center gap-6">
        {links.map((link) => {
          if (link.type === "link") {
            return (
              <NavItemDesktop
                key={link.href}
                href={link.href}
                isActive={isPathActive(pathname, link.href)}
              >
                {link.label}
              </NavItemDesktop>
            )
          }

          return (
            <OpenPresetDialog
              key={link.action}
              className="relative inline-grid h-8 items-center text-sm font-medium text-header-foreground/60 transition hover:text-header-foreground"
            >
              {link.label}
            </OpenPresetDialog>
          )
        })}
      </nav>
      <div className="flex items-center gap-2">
        <Separator orientation="vertical" className="h-6 self-center!" />
        <GitHubLink />
        <Separator orientation="vertical" className="h-6 self-center!" />
        <ModeSwitcher />
        <Separator orientation="vertical" className="h-6 self-center!" />
        <UserMenu />
      </div>
    </div>
  )
}

interface MobileNavProps {
  logo: ReactNode
  links: ComponentLink[]
  pathname: string
  className?: string
}

function MobileNav({ logo, links, pathname, className }: MobileNavProps) {
  const [isOpen, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (pathname) {
      setOpen(false)
    }
  }, [pathname])

  return (
    <div className={className}>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <div className="flex items-center gap-2">
          <UserMenu variant="sm" />
          <SheetTrigger render={<Button size="icon" variant="outline" />}>
            <MenuIcon />
          </SheetTrigger>
        </div>
        <SheetContent className="pt-2">
          <SheetHeader className="text-start">
            {logo}
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Choose your destination
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-2">
            <nav className="grid">
              {links.map((link) => {
                if (link.type === "link") {
                  return (
                    <NavItemMobile
                      key={link.href}
                      href={link.href}
                      isActive={isPathActive(pathname, link.href)}
                    >
                      {link.label}
                    </NavItemMobile>
                  )
                }

                return (
                  <OpenPresetDialog
                    key={link.action}
                    className="inline-grid h-10 w-full items-center px-4 py-2 text-left text-sm font-medium text-header-foreground/60 transition hover:text-header-foreground"
                  >
                    {link.label}
                  </OpenPresetDialog>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export interface Header1Props {
  logo?: ReactNode
  links?: ComponentLink[]
  pathname?: string
  className?: string
  wrapperClassName?: string
}

export function Header1({
  logo = <LogoLink />,
  links = HEADER_LINKS,
  pathname: pathnameProp,
  className,
  wrapperClassName,
}: Header1Props) {
  const pathnameFromRouter = usePathname()
  const pathname = pathnameProp ?? pathnameFromRouter ?? ""

  return (
    <Container
      component="header"
      className={cn("flex items-center justify-between py-4", className)}
      wrapperClassName={cn(wrapperClassName, "bg-header")}
    >
      {logo}
      <MobileNav
        logo={logo}
        links={links}
        pathname={pathname}
        className="md:hidden"
      />
      <DesktopNav
        links={links}
        pathname={pathname}
        className="hidden md:flex"
      />
    </Container>
  )
}

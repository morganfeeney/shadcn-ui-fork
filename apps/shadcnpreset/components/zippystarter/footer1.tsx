import { cn } from "@/lib/utils"
import { Link } from "@/components/zippystarter/link"
import { Container } from "@/components/zippystarter/container"
import { IconGroup } from "@/components/zippystarter/icon-group"
import { Logo } from "@/components/zippystarter/logo"
import { ICON_LINKS } from "@/data/icon-lists"
import React from "react"
import { siteConfig } from "@/lib/config"
import { OpenPresetDialog } from "@/components/open-preset-dialog"
import { CurrentYear } from "@/components/current-year"

const COLUMNS = [
  {
    header: "Tools",
    links: [
      {
        label: "Preset Theme CSS Generator",
        href: "/tools/preset-theme-generator",
      },
      {
        label: "Preset color contrast checker",
        href: "/tools/color-contrast-checker",
      },
      {
        label: "shadcn theme generator",
        href: "https://zippystarter.com/tools/shadcn-ui-theme-generator",
      },
      { label: "shadcn themes", href: "https://zippystarter.com/themes" },
      { label: "OG image debugger", href: "https://ogimage.info" },
    ],
  },
  {
    header: "Navigation",
    links: [
      { label: "Ask AI", href: "/assistant" },
      { label: "Community", href: "/community" },
      { type: "link", href: "/tools", label: "Tools" },
    ],
  },
  {
    header: "Presets",
    links: [
      { label: "High contrast presets", href: "/high-contrast-presets" },
      { label: "Open Preset", action: "open-preset" as const },
      { label: "My presets", href: "/my-presets" },
    ],
  },
  {
    header: "Support",
    links: [
      {
        type: "link",
        href: "https://x.com/morganfeeney",
        label: "Get in touch",
      },
    ],
  },
]

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

export interface FooterColumn {
  header: string
  links: Array<
    | {
        label: string
        href: string
      }
    | {
        label: string
        action: "open-preset"
      }
  >
}

function FooterColumn({ header, links }: FooterColumn) {
  return (
    <div className="grid gap-5 text-sm">
      <p className="inline-grid font-display text-foreground">{header}</p>
      <ul className="grid gap-4">
        {links.map((link) => (
          <li key={link.label}>
            {"href" in link ? (
              <Link
                href={link.href}
                className="text-footer-foreground/60 hover:text-footer-foreground transition hover:underline"
              >
                {link.label}
              </Link>
            ) : (
              <OpenPresetDialog className="text-footer-foreground/60 hover:text-footer-foreground transition hover:underline">
                {link.label}
              </OpenPresetDialog>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface Footer1Props {
  className?: string
}

export function Footer1({ className }: Footer1Props) {
  return (
    <Container
      component="footer"
      className="mx-auto max-w-7xl gap-4 gap-y-8 pt-10 pb-8 text-sm md:pt-20"
      wrapperClassName={cn("bg-footer", className)}
    >
      <div className="grid grid-cols-12 gap-4 gap-y-16">
        <div className="text-footer-foreground col-span-12 grid content-start justify-items-start gap-8 md:col-span-3">
          <LogoLink />
          <p>{siteConfig.description}</p>
          <IconGroup
            links={ICON_LINKS}
            className="[&_svg]:fill-footer-foreground"
          />
        </div>
        <div className="@container col-span-12 md:col-span-8 md:col-start-5">
          <div className="grid grid-cols-2 items-start gap-4 gap-y-12 @xl:grid-cols-4">
            {COLUMNS.map((column) => (
              <FooterColumn key={column.header} {...column} />
            ))}
          </div>
        </div>
        <p className="text-footer-foreground/60 col-span-12 pt-6 text-xs">
          &copy; <CurrentYear /> shadcnpreset. All rights reserved.
        </p>
      </div>
    </Container>
  )
}

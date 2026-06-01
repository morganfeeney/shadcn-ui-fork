"use client"
import { cn } from "@/lib/utils"
import { ArrowRightIcon } from "@phosphor-icons/react"
import Link from "next/link"

function SplitMedia({
  className,
  children,
  ...props
}: React.ComponentProps<"article">) {
  return (
    <div className="@container">
      <article
        className={cn("grid bg-muted @2xl:grid-cols-2", className)}
        {...props}
      >
        {children}
      </article>
    </div>
  )
}

function SplitMediaHeading({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-xl font-medium tracking-tighter text-foreground @6xl:text-3xl @6xl:font-normal",
        className
      )}
      {...props}
    />
  )
}

function SplitMediaSubHeading({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "-mt-0.5 text-xl font-medium tracking-tighter text-muted-foreground @6xl:text-3xl @6xl:font-normal",
        className
      )}
      {...props}
    />
  )
}

function SplitMediaDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "max-w-[50ch] text-sm text-muted-foreground @6xl:text-base",
        className
      )}
      {...props}
    />
  )
}

function SplitMediaHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header className={cn("grid", className)} {...props}>
      {children}
    </header>
  )
}

function SplitMediaContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid gap-5 p-6 @2xl:place-content-center @2xl:p-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SplitMediaLink({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "flex items-center gap-2 justify-self-start text-sm @6xl:text-base",
        className
      )}
      {...props}
    >
      {children}
      <ArrowRightIcon size={16} />
    </Link>
  )
}

export {
  SplitMedia,
  SplitMediaHeading,
  SplitMediaSubHeading,
  SplitMediaDescription,
  SplitMediaHeader,
  SplitMediaContent,
  SplitMediaLink,
}

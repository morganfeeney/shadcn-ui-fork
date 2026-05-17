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
        className={cn("grid bg-muted @xl:grid-cols-2", className)}
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
        "text-2xl font-medium tracking-tighter text-foreground",
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
        "-mt-0.5 text-2xl font-medium tracking-tighter text-muted-foreground",
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
      className={cn("text-sm text-balance text-muted-foreground", className)}
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
    <div className={cn("grid content-center gap-5 p-10", className)} {...props}>
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
      className={cn("flex items-center gap-2 text-sm", className)}
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

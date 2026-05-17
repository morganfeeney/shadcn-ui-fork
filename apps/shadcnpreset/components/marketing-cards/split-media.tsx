import { cn } from "@/lib/utils"
import Link, { LinkProps } from "next/link"

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
        "text-2xl font-medium tracking-tighter text-muted-foreground",
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
    <header
      className={cn("grid place-content-center gap-4 p-10", className)}
      {...props}
    >
      {children}
    </header>
  )
}

function SplitMediaLink({
  className,
  children,
  ...props
}: React.ComponentProps<"LinkProps">) {
  return (
    <Link className={cn("grid", className)} {...props}>
      {children}
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
}

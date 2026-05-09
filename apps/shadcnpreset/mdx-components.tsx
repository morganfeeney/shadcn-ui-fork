import type { MDXComponents } from "mdx/types"
import Link from "next/link"

import { cn } from "@/lib/utils"

/** Map used by `@next/mdx` and by Content Collections `<MDXContent />` on the server. */
export const mdxDocumentationComponents = {
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          "mt-10 scroll-m-20 text-3xl font-semibold tracking-tight text-foreground first:mt-0 lg:text-4xl",
          className
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          "mt-10 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight text-foreground first:mt-0",
          className
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn(
          "mt-8 scroll-m-20 text-xl font-semibold tracking-tight text-foreground",
          className
        )}
        {...props}
      />
    ),
    p: ({ className, ...props }) => (
      <p
        className={cn("mt-4 leading-7 text-muted-foreground [&+p]:mt-3", className)}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={cn("my-4 ml-6 list-disc text-muted-foreground marker:text-muted-foreground/80", className)}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn("my-4 ml-6 list-decimal text-muted-foreground marker:text-muted-foreground/80", className)}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("mt-2 pl-1", className)} {...props} />
    ),
    a: ({ href, className, children, ...props }) => {
      const base = cn(
        "font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )
      if (href?.startsWith("/") || href?.startsWith("#")) {
        return (
          <Link href={href} className={base} {...props}>
            {children}
          </Link>
        )
      }
      return (
        <a href={href} className={base} target="_blank" rel="noreferrer" {...props}>
          {children}
        </a>
      )
    },
    code: ({ className, ...props }) => (
      <code
        className={cn(
          "relative rounded-md bg-muted px-[0.25rem] py-px font-mono text-[0.875em] text-foreground",
          className
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          "mt-6 overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground [&_code]:bg-transparent [&_code]:p-0",
          className
        )}
        {...props}
      />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          "mt-6 border-l-2 border-primary/40 pl-4 text-muted-foreground italic [&>p]:mt-0",
          className
        )}
        {...props}
      />
    ),
    hr: ({ className, ...props }) => (
      <hr className={cn("my-10 border-border", className)} {...props} />
    ),
} satisfies MDXComponents

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxDocumentationComponents,
    ...components,
  }
}

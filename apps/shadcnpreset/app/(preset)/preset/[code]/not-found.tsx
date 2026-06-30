"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code2 } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { buttonVariants } from "@/components/ui/button"

export default function PresetNotFound() {
  const pathname = usePathname()
  const segment = pathname?.split("/").filter(Boolean).pop() ?? ""

  return (
    <main className="mx-auto grid w-full max-w-450 gap-4 px-safe">
      <Empty className="border border-border">
        <EmptyMedia variant="icon">
          <Code2 className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle className="text-2xl">Invalid preset code</EmptyTitle>
          <EmptyDescription>
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-foreground">
              &quot;{segment}&quot;
            </code>{" "}
            is not a valid shadcn preset. Try another preset code from the
            create page.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ul className="flex flex-wrap justify-center gap-2">
            <li>
              <Link href="/" className={buttonVariants({ variant: "outline" })}>
                Back to code input
              </Link>
            </li>
          </ul>
        </EmptyContent>
      </Empty>
    </main>
  )
}

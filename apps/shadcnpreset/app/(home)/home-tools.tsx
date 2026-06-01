"use client"
import { HomeSection } from "@/app/(home)/home-section"
import { TOOLS } from "@/app/tools/tools"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowRightIcon } from "@phosphor-icons/react"

export function HomeTools() {
  return (
    <HomeSection title="Powerful free tools" subTitle="To help you ship">
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))] gap-4">
        {TOOLS.map((tool) => (
          <article key={tool.title} className="grid gap-5 bg-muted p-6">
            <div className="grid gap-2 self-start">
              <p className="text-lg font-display text-foreground">
                {tool.title}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tool.cardDescription}
              </p>
            </div>
            <Link
              href={tool.href}
              className={cn(
                "flex items-center gap-2 self-end justify-self-start text-sm"
              )}
            >
              Start using now
              <ArrowRightIcon size={16} />
            </Link>
          </article>
        ))}
      </div>
    </HomeSection>
  )
}

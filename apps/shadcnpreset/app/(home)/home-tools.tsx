"use client"
import { HomeSection } from "@/app/(home)/home-section"
import {
  ToolCard,
  ToolCardDescription,
  ToolCardFooter,
  ToolCardHeader,
  ToolCardTitle,
} from "@/components/tool-card"
import { TOOLS } from "@/app/tools/tools"
import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react"

export function HomeTools() {
  return (
    <HomeSection title="Powerful free tools" subTitle="To help you ship">
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))] gap-4">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.title}>
            <ToolCardHeader>
              <ToolCardTitle>{tool.title}</ToolCardTitle>
              <ToolCardDescription>
                {tool.cardDescription}
              </ToolCardDescription>
            </ToolCardHeader>
            <ToolCardFooter>
              <Link
                href={tool.href}
                className="flex items-center gap-2 text-sm"
              >
                Start using now
                <ArrowRightIcon size={16} />
              </Link>
            </ToolCardFooter>
          </ToolCard>
        ))}
      </div>
    </HomeSection>
  )
}

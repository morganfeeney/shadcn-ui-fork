"use client"

import Link from "next/link"

import {
  ToolCard,
  ToolCardDescription,
  ToolCardFooter,
  ToolCardHeader,
  ToolCardTitle,
} from "@/components/tool-card"

import { ArrowRightIcon } from "@phosphor-icons/react"

type ToolListItem = {
  href: string
  title: string
  description: string
}

export function ToolsList({ tools }: { tools: readonly ToolListItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.href}>
          <ToolCardHeader>
            <ToolCardTitle>{tool.title}</ToolCardTitle>
            <ToolCardDescription>{tool.description}</ToolCardDescription>
          </ToolCardHeader>
          <ToolCardFooter>
            <Link href={tool.href} className="flex items-center gap-2 text-sm">
              Open tool
              <ArrowRightIcon size={16} />
            </Link>
          </ToolCardFooter>
        </ToolCard>
      ))}
    </div>
  )
}

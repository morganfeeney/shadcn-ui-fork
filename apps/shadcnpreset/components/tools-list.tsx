"use client"

import Link from "next/link"

import {
  ToolCard,
  ToolCardDescription,
  ToolCardHeader,
  ToolCardTitle,
} from "@/components/tool-card"

type ToolListItem = {
  href: string
  title: string
  description: string
}

export function ToolsList({ tools }: { tools: readonly ToolListItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.href} render={<Link href={tool.href} />}>
          <ToolCardHeader>
            <ToolCardTitle>{tool.title}</ToolCardTitle>
            <ToolCardDescription>{tool.description}</ToolCardDescription>
          </ToolCardHeader>
        </ToolCard>
      ))}
    </div>
  )
}

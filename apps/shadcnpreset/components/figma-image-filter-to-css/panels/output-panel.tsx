"use client"

import { cjk } from "@streamdown/cjk"
import { code } from "@streamdown/code"
import type { ComponentProps } from "react"
import { Streamdown } from "streamdown"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FigmaImageFilterToolModel } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"

type OutputPanelProps = {
  model: FigmaImageFilterToolModel
}

type StreamdownProps = ComponentProps<typeof Streamdown>

const streamdownPlugins = { cjk, code } as unknown as NonNullable<
  StreamdownProps["plugins"]
>

function SnippetBlock({
  value,
  language,
}: {
  value: string
  language: "html" | "tsx"
}) {
  const markdown = `\`\`\`${language}\n${value}\n\`\`\``

  return (
    <Streamdown key={`${language}:${value}`} plugins={streamdownPlugins}>
      {markdown}
    </Streamdown>
  )
}

export function OutputPanel({ model }: OutputPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Output</CardTitle>
        <CardDescription>
          Copy image block output in Tailwind or CSS form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tailwind">
          <TabsList>
            <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
          </TabsList>
          <TabsContent value="tailwind">
            <SnippetBlock value={model.tailwindImageSnippet} language="html" />
          </TabsContent>
          <TabsContent value="css">
            <SnippetBlock value={model.cssImageSnippet} language="html" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

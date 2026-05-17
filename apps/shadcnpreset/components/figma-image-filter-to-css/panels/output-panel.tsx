"use client"

import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { FigmaImageFilterToolModel } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"

type OutputPanelProps = {
  model: FigmaImageFilterToolModel
}

function CopyValueButton({
  value,
  copyKey,
  copiedKey,
  onCopy,
  label,
}: {
  value: string
  copyKey: string
  copiedKey: string | null
  onCopy: (value: string, key: string) => void
  label: string
}) {
  const copied = copiedKey === copyKey

  return (
    <div className="absolute top-3 right-3 z-10">
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={() => onCopy(value, copyKey)}
        aria-label={copied ? "Copied" : label}
        title={copied ? "Copied" : label}
      >
        {copied ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Copy className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  )
}

export function OutputPanel({ model }: OutputPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Output</CardTitle>
        <CardDescription>Copy direct CSS or Tailwind utility classes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="relative">
            <CopyValueButton
              value={model.cssSnippet}
              copyKey="css"
              copiedKey={model.copiedKey}
              onCopy={model.handleCopy}
              label="Copy CSS"
            />
            <Textarea readOnly value={model.cssSnippet} />
          </div>
          <div className="relative">
            <CopyValueButton
              value={model.tailwindSnippet}
              copyKey="tailwind"
              copiedKey={model.copiedKey}
              onCopy={model.handleCopy}
              label="Copy Tailwind classes"
            />
            <Textarea readOnly value={model.tailwindSnippet} />
          </div>
          <div className="relative">
            <CopyValueButton
              value={model.layeredJsxSnippet}
              copyKey="layered-jsx"
              copiedKey={model.copiedKey}
              onCopy={model.handleCopy}
              label="Copy layered JSX snippet"
            />
            <Textarea readOnly value={model.layeredJsxSnippet} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

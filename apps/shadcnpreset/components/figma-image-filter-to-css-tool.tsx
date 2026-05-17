"use client"
import "chromakit-react/chromakit.css"

import { FiltersPanel } from "@/components/figma-image-filter-to-css/panels/filters-panel"
import { OutputPanel } from "@/components/figma-image-filter-to-css/panels/output-panel"
import { PreviewPanel } from "@/components/figma-image-filter-to-css/panels/preview-panel"
import { useFigmaImageFilterTool } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"

export function FigmaImageFilterToCssTool() {
  const model = useFigmaImageFilterTool()

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <FiltersPanel model={model} />

      <div className="grid gap-6">
        <PreviewPanel model={model} />
        <OutputPanel model={model} />
      </div>
    </div>
  )
}

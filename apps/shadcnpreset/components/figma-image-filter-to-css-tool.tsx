"use client"
import "chromakit-react/chromakit.css"
import { InfoIcon } from "@phosphor-icons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FiltersPanel } from "@/components/figma-image-filter-to-css/panels/filters-panel"
import { OutputPanel } from "@/components/figma-image-filter-to-css/panels/output-panel"
import { PresetsPanel } from "@/components/figma-image-filter-to-css/panels/presets-panel"
import { PreviewPanel } from "@/components/figma-image-filter-to-css/panels/preview-panel"
import { useFigmaImageFilterTool } from "@/components/figma-image-filter-to-css/use-figma-image-filter-tool"

export function FigmaImageFilterToCssTool() {
  const model = useFigmaImageFilterTool()

  return (
    <div className="grid gap-6">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-6">
          <PresetsPanel model={model} />
          <FiltersPanel model={model} />
          <Alert>
            <InfoIcon />
            <AlertTitle>How these values relate to Figma</AlertTitle>
            <AlertDescription>
              Exposure maps to CSS <code>brightness()</code>, Contrast maps to{" "}
              <code>contrast()</code>, and Saturation maps to{" "}
              <code>saturate()</code>.
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid gap-6">
          <PreviewPanel model={model} />
          <OutputPanel model={model} />
        </div>
      </div>
    </div>
  )
}

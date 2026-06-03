import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/page-header"
import { FigmaImageFilterToCssTool } from "@/components/figma-image-filter-to-css-tool"
import { FIGMA_FILTER_CSS_TOOL } from "@/app/tools/tools"

export default function FigmaImageFilterToCssPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>{FIGMA_FILTER_CSS_TOOL.title}</PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          {FIGMA_FILTER_CSS_TOOL.description}
        </PageHeaderDescription>
      </PageHeader>
      <main className="grid gap-4">
        <FigmaImageFilterToCssTool />
      </main>
    </>
  )
}

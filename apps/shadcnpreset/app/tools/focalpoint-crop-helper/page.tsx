import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/page-header"
import { FocalpointCropTool } from "@/components/focalpoint-crop-tool"
import { FOCALPOINT_CROP_TOOL } from "@/app/tools/tools"

export default function FocalpointCropHelperPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>{FOCALPOINT_CROP_TOOL.title}</PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          {FOCALPOINT_CROP_TOOL.description}
        </PageHeaderDescription>
      </PageHeader>
      <main className="grid gap-4">
        <FocalpointCropTool />
      </main>
    </>
  )
}

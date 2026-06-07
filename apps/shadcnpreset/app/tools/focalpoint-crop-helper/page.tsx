import { FocalpointCropTool } from "@/components/focalpoint-crop-tool"
import { FOCALPOINT_CROP_TOOL } from "@/app/tools/tools"

export default function FocalpointCropHelperPage() {
  return (
    <main>
      <FocalpointCropTool
        title={FOCALPOINT_CROP_TOOL.title}
        description={FOCALPOINT_CROP_TOOL.description}
      />
    </main>
  )
}

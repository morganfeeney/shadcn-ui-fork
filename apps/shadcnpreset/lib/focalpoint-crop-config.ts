export const FOCALPOINT_SAMPLE_PHOTO_ID = "1691435828932-911a7801adfb"

export const FOCALPOINT_TOOL_DEFAULT_TITLE = "Unsplash focalpoint crop helper"
export const FOCALPOINT_TOOL_DEFAULT_DESCRIPTION =
  "Tune focal point placement and zoom to generate Unsplash crop params."

export const FOCALPOINT_COPY_LABEL = "Copy URL"

export const FOCALPOINT_CROP_DEFAULTS = {
  photoId: FOCALPOINT_SAMPLE_PHOTO_ID,
  outputWidth: 1200,
  outputHeight: 1200,
  fpXPercent: 72,
  fpYPercent: 62,
  zoom: 1.9,
  aspectPresetId: "1:1",
} as const

export type FocalpointCropStateSnapshot = {
  photoId: string
  outputWidth: number
  outputHeight: number
  fpXPercent: number
  fpYPercent: number
  zoom: number
  selectedAspectPreset: string
}

export function isFocalpointCropAtDefaults(
  state: FocalpointCropStateSnapshot
) {
  return (
    state.photoId === FOCALPOINT_CROP_DEFAULTS.photoId &&
    state.outputWidth === FOCALPOINT_CROP_DEFAULTS.outputWidth &&
    state.outputHeight === FOCALPOINT_CROP_DEFAULTS.outputHeight &&
    state.fpXPercent === FOCALPOINT_CROP_DEFAULTS.fpXPercent &&
    state.fpYPercent === FOCALPOINT_CROP_DEFAULTS.fpYPercent &&
    state.zoom === FOCALPOINT_CROP_DEFAULTS.zoom &&
    state.selectedAspectPreset === FOCALPOINT_CROP_DEFAULTS.aspectPresetId
  )
}

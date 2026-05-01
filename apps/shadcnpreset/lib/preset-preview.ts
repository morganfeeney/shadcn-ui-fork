export type PresetPreviewPageName = "preview" | "preview-02" | "dashboard"

type PresetPreviewTarget =
  | {
      kind: "v4"
      pageName: "preview" | "preview-02"
    }
  | {
      kind: "local"
      example: LocalPresetPreviewExample
    }

export const PRESET_PREVIEW_VIEWS: ReadonlyArray<{
  page: PresetPreviewPageName
  label: string
  target: PresetPreviewTarget
}> = [
  {
    page: "preview",
    label: "View 1",
    target: {
      kind: "v4",
      pageName: "preview",
    },
  },
  {
    page: "preview-02",
    label: "View 2",
    target: {
      kind: "v4",
      pageName: "preview-02",
    },
  },
  {
    page: "dashboard",
    label: "Dashboard",
    target: {
      kind: "local",
      example: "dashboard",
    },
  },
] as const

export type LocalPresetPreviewExample =
  (typeof LOCAL_PRESET_PREVIEW_EXAMPLES)[number]

export const LOCAL_PRESET_PREVIEW_EXAMPLES = [
  "dashboard",
  "style-overview-1",
  "style-overview-2",
] as const

export function getPresetPreviewView(page: PresetPreviewPageName) {
  return PRESET_PREVIEW_VIEWS.find((item) => item.page === page) ?? null
}

export function isLocalPresetPreviewExample(
  value: string
): value is LocalPresetPreviewExample {
  return (LOCAL_PRESET_PREVIEW_EXAMPLES as readonly string[]).includes(value)
}

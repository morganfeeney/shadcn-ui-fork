export const ASPECT_RATIO_PRESETS = [
  { id: "1:1", label: "Square (1:1)", width: 1200, height: 1200 },
  { id: "4:3", label: "Standard (4:3)", width: 1200, height: 900 },
  { id: "3:2", label: "Photo (3:2)", width: 1200, height: 800 },
  { id: "16:9", label: "Widescreen (16:9)", width: 1600, height: 900 },
  { id: "21:9", label: "Ultrawide (21:9)", width: 2100, height: 900 },
  { id: "9:16", label: "Portrait (9:16)", width: 900, height: 1600 },
] as const

export function toFixed(value: number, decimals = 3) {
  return value.toFixed(decimals)
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function buildUnsplashImageUrl(photoId: string) {
  const raw = photoId.trim()
  if (!raw) return ""

  let candidate = raw

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw)
      candidate = parsed.pathname.replace(/^\/+/, "")
    } catch {
      return ""
    }
  }

  candidate = candidate.split("?")[0]?.split("#")[0] ?? ""
  if (candidate.startsWith("photo-")) {
    candidate = candidate.slice("photo-".length)
  }

  if (/\s/.test(candidate)) return ""
  if (!candidate) return ""
  return `https://images.unsplash.com/photo-${candidate}`
}

export function buildFocalpointUrl(
  imageUrl: string,
  fpX: number,
  fpY: number,
  fpZ: number,
  width: number,
  height: number
) {
  try {
    const url = new URL(imageUrl)
    url.searchParams.set("auto", "format")
    url.searchParams.set("fit", "crop")
    url.searchParams.set("crop", "focalpoint")
    url.searchParams.set("w", String(width))
    url.searchParams.set("h", String(height))
    url.searchParams.set("fp-x", toFixed(fpX))
    url.searchParams.set("fp-y", toFixed(fpY))
    url.searchParams.set("fp-z", toFixed(fpZ, 2))
    url.searchParams.set("q", "80")
    return url.toString()
  } catch {
    return ""
  }
}

export function findAspectPresetByRatio(width: number, height: number) {
  if (!width || !height) return null
  const ratio = width / height
  const ratioTolerance = 0.002
  return (
    ASPECT_RATIO_PRESETS.find((preset) => {
      const presetRatio = preset.width / preset.height
      return Math.abs(presetRatio - ratio) <= ratioTolerance
    }) ?? null
  )
}

export function getSliderSingleValue(
  value: number | readonly number[],
  fallback: number
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback
  }
  return value
}

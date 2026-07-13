export type ParsedOklch = {
  l: number
  c: number
  h: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function parseOklch(value?: string | null): ParsedOklch | null {
  if (!value) {
    return null
  }

  // Query strings encode spaces as "+". Commas are common in pasted CSS.
  const sanitized = value.trim().replace(/\+/g, " ").replace(/,\s*/g, " ")

  const match = sanitized.match(
    /^oklch\(\s*([0-9]*\.?[0-9]+)[\s+]+([0-9]*\.?[0-9]+)[\s+]+([0-9]*\.?[0-9]+)\s*\)$/i
  )

  if (!match) {
    return null
  }

  const l = Number(match[1])
  const c = Number(match[2])
  const h = Number(match[3])

  if (Number.isNaN(l) || Number.isNaN(c) || Number.isNaN(h)) {
    return null
  }

  return {
    l: clamp(l, 0, 1),
    c: clamp(c, 0, 0.4),
    h: ((h % 360) + 360) % 360,
  }
}

export function formatOklch(color: ParsedOklch) {
  return `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(2)})`
}

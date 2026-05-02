import { FONT_DEFINITIONS, type FontName } from "@/lib/font-definitions"

/** Derived from `FONT_DEFINITIONS` — single source of truth is `font-definitions.ts`. */
export const GOOGLE_FONT_QUERY_BY_VALUE = Object.fromEntries(
  FONT_DEFINITIONS.map((d) => [d.name, d.googleFontQuery])
) as Record<FontName, string>

/**
 * Stylesheet URLs for preset body + heading tokens (deduped). Empty when the
 * preset only uses fonts already bundled (e.g. next/font on the host).
 */
export function getPresetGoogleFontStylesheetHrefs(
  fontValues: readonly string[]
): string[] {
  const uniqueTokens = new Set(
    fontValues.filter((value) => value && value !== "inherit")
  )
  const hrefs = new Set<string>()

  for (const token of uniqueTokens) {
    const familyQuery = GOOGLE_FONT_QUERY_BY_VALUE[token as FontName]
    if (!familyQuery) {
      continue
    }
    hrefs.add(
      `https://fonts.googleapis.com/css2?family=${familyQuery}&display=swap`
    )
  }

  return Array.from(hrefs)
}

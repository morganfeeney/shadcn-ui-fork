import {
  PRESET_BASE_COLORS,
  PRESET_FONT_HEADINGS,
  PRESET_FONTS,
  PRESET_ICON_LIBRARIES,
  PRESET_MENU_ACCENTS,
  PRESET_MENU_COLORS,
  PRESET_RADII,
  PRESET_STYLES,
  encodePreset,
  type PresetConfig,
} from "shadcn/preset"

import type { ResolvedPreset } from "@/lib/preset"
import { getThemesForBaseColor } from "@/registry/config"

const FACET_WEIGHTS = {
  style: 4,
  baseColor: 6,
  theme: 5,
  chartColor: 4,
  font: 2,
  fontHeading: 2,
  iconLibrary: 1,
  radius: 1,
  menuColor: 1,
  menuAccent: 1,
} as const

const FACET_KEYS = [
  "style",
  "baseColor",
  "theme",
  "chartColor",
  "font",
  "fontHeading",
  "iconLibrary",
  "radius",
  "menuColor",
  "menuAccent",
] as const

type FacetKey = (typeof FACET_KEYS)[number]

type FacetOptions = Record<FacetKey, readonly string[]>

type Candidate = {
  code: string
  score: number
  hash: number
}

const V4_BASE_COLORS = PRESET_BASE_COLORS.filter((color) => color !== "gray")

function neighbors<T extends string>(values: readonly T[], current: T): T[] {
  if (!values.length) return []
  const index = values.indexOf(current)
  if (index < 0) return [values[0]!]
  if (values.length === 1) return [values[0]!]

  const next = values[(index + 1) % values.length]!
  const prev = values[(index - 1 + values.length) % values.length]!
  return Array.from(new Set([next, prev])).filter((value) => value !== current)
}

function hashString(input: string) {
  // Deterministic shuffle key for stable ordering within same score.
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function sanitizeConfig(config: PresetConfig): PresetConfig {
  const themeOptions = getThemesForBaseColor(config.baseColor).map(
    (theme) => theme.name as PresetConfig["theme"]
  )
  const fallbackTheme = themeOptions[0] ?? ("zinc" as PresetConfig["theme"])

  const theme = themeOptions.includes(config.theme) ? config.theme : fallbackTheme
  const chartColor =
    config.chartColor && themeOptions.includes(config.chartColor)
      ? config.chartColor
      : theme

  const translucentMenu =
    config.menuColor === "default-translucent" ||
    config.menuColor === "inverted-translucent"

  return {
    ...config,
    theme,
    chartColor,
    radius: config.style === "lyra" ? "none" : config.radius,
    menuAccent:
      translucentMenu && config.menuAccent === "bold"
        ? "subtle"
        : config.menuAccent,
  }
}

function buildBaseConfig(resolved: ResolvedPreset): PresetConfig {
  return sanitizeConfig({
    style: resolved.style,
    baseColor: resolved.baseColor,
    theme: resolved.theme,
    chartColor: resolved.effectiveChartColor,
    font: resolved.font,
    fontHeading: resolved.fontHeading,
    iconLibrary: resolved.iconLibrary,
    radius: resolved.effectiveRadius,
    menuColor: resolved.menuColor,
    menuAccent: resolved.menuAccent,
  })
}

function buildFacetOptions(baseConfig: PresetConfig): FacetOptions {
  const themeOptions = getThemesForBaseColor(baseConfig.baseColor).map(
    (theme) => theme.name as PresetConfig["theme"]
  )

  return {
    style: PRESET_STYLES,
    baseColor: V4_BASE_COLORS,
    theme: themeOptions,
    chartColor: themeOptions,
    font: PRESET_FONTS,
    fontHeading: PRESET_FONT_HEADINGS,
    iconLibrary: PRESET_ICON_LIBRARIES,
    radius: PRESET_RADII,
    menuColor: PRESET_MENU_COLORS,
    menuAccent: PRESET_MENU_ACCENTS,
  }
}

function scoreForMutations(keys: readonly FacetKey[]) {
  return keys.reduce((sum, key) => sum + FACET_WEIGHTS[key], 0)
}

function makeMutatedConfig(
  baseConfig: PresetConfig,
  mutations: readonly [FacetKey, string][]
) {
  const mutated = { ...baseConfig } as PresetConfig
  for (const [key, value] of mutations) {
    ;(mutated[key] as string) = value
  }
  return sanitizeConfig(mutated)
}

function pushCandidate(
  candidates: Map<string, Candidate>,
  code: string,
  score: number,
  seed: string
) {
  const hash = hashString(`${seed}:${code}`)
  const existing = candidates.get(code)
  if (!existing || score < existing.score) {
    candidates.set(code, { code, score, hash })
  }
}

export function getRelatedPresets(
  resolved: ResolvedPreset,
  limit = 24
): string[] {
  const baseConfig = buildBaseConfig(resolved)
  const facetOptions = buildFacetOptions(baseConfig)
  const candidates = new Map<string, Candidate>()

  for (const key of FACET_KEYS) {
    const currentValue = String(baseConfig[key])
    const keyOptions = facetOptions[key]
    const keyNeighbors = neighbors(keyOptions, currentValue)
    for (const nextValue of keyNeighbors) {
      const config = makeMutatedConfig(baseConfig, [[key, nextValue]])
      const code = encodePreset(config)
      if (code !== resolved.code) {
        pushCandidate(
          candidates,
          code,
          scoreForMutations([key]),
          resolved.code
        )
      }
    }
  }

  for (let i = 0; i < FACET_KEYS.length; i += 1) {
    const first = FACET_KEYS[i]!
    const firstNeighbors = neighbors(
      facetOptions[first],
      String(baseConfig[first])
    )

    for (let j = i + 1; j < FACET_KEYS.length; j += 1) {
      const second = FACET_KEYS[j]!
      const secondNeighbors = neighbors(
        facetOptions[second],
        String(baseConfig[second])
      )

      for (const firstValue of firstNeighbors) {
        for (const secondValue of secondNeighbors) {
          const config = makeMutatedConfig(baseConfig, [
            [first, firstValue],
            [second, secondValue],
          ])
          const code = encodePreset(config)
          if (code !== resolved.code) {
            pushCandidate(
              candidates,
              code,
              scoreForMutations([first, second]),
              resolved.code
            )
          }
        }
      }
    }
  }

  if (candidates.size < limit) {
    for (let i = 0; i < FACET_KEYS.length; i += 1) {
      const first = FACET_KEYS[i]!
      const firstNeighbors = neighbors(
        facetOptions[first],
        String(baseConfig[first])
      )
      for (let j = i + 1; j < FACET_KEYS.length; j += 1) {
        const second = FACET_KEYS[j]!
        const secondNeighbors = neighbors(
          facetOptions[second],
          String(baseConfig[second])
        )
        for (let k = j + 1; k < FACET_KEYS.length; k += 1) {
          const third = FACET_KEYS[k]!
          const thirdNeighbors = neighbors(
            facetOptions[third],
            String(baseConfig[third])
          )

          for (const firstValue of firstNeighbors) {
            for (const secondValue of secondNeighbors) {
              for (const thirdValue of thirdNeighbors) {
                const config = makeMutatedConfig(baseConfig, [
                  [first, firstValue],
                  [second, secondValue],
                  [third, thirdValue],
                ])
                const code = encodePreset(config)
                if (code !== resolved.code) {
                  pushCandidate(
                    candidates,
                    code,
                    scoreForMutations([first, second, third]),
                    resolved.code
                  )
                }
              }
            }
          }
        }
      }
    }
  }

  return Array.from(candidates.values())
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score
      if (a.hash !== b.hash) return a.hash - b.hash
      return a.code.localeCompare(b.code)
    })
    .slice(0, limit)
    .map((candidate) => candidate.code)
}

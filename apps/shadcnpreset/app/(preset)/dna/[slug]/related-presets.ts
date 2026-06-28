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
  config: PresetConfig
  generatedRank: number
  hash: number
}

const V4_BASE_COLORS = PRESET_BASE_COLORS.filter((color) => color !== "gray")
const COLOR_FACETS = ["baseColor", "theme", "chartColor"] as const satisfies readonly FacetKey[]
const NON_COLOR_FACETS = [
  "font",
  "fontHeading",
  "iconLibrary",
  "radius",
  "menuColor",
  "menuAccent",
] as const satisfies readonly FacetKey[]

type MutationPlanStep = {
  key: FacetKey
  alternativeIndex?: number
}

const FACET_DISTANCE_WEIGHTS: Record<FacetKey, number> = {
  style: 2.2,
  baseColor: 1.8,
  theme: 1.5,
  chartColor: 1.2,
  font: 2.6,
  fontHeading: 2.2,
  iconLibrary: 2.1,
  radius: 1.6,
  menuColor: 1.4,
  menuAccent: 1.4,
}

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

function orderedAlternatives<T extends string>(
  values: readonly T[],
  current: string,
  seed: string
): T[] {
  const withoutCurrent = values.filter((value) => value !== current)
  if (!withoutCurrent.length) return []

  const near = neighbors(values, current as T)
  const seen = new Set<T>(near)
  const rest = withoutCurrent.filter((value) => !seen.has(value))
  if (rest.length <= 1) return [...near, ...rest]

  const offset = hashString(seed) % rest.length
  const rotated = rest.slice(offset).concat(rest.slice(0, offset))
  return [...near, ...rotated]
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

function buildAlternatives(baseConfig: PresetConfig, seed: string) {
  const facetOptions = buildFacetOptions(baseConfig)
  return Object.fromEntries(
    FACET_KEYS.map((key) => {
      const currentValue = String(baseConfig[key])
      return [
        key,
        orderedAlternatives(facetOptions[key], currentValue, `${seed}:${key}`).map(
          String
        ),
      ]
    })
  ) as Record<FacetKey, string[]>
}

function distanceBetweenConfigs(
  left: PresetConfig,
  right: PresetConfig,
  facets: readonly FacetKey[] = FACET_KEYS
) {
  return facets.reduce((score, key) => {
    if (left[key] === right[key]) return score
    return score + FACET_DISTANCE_WEIGHTS[key]
  }, 0)
}

function selectDiverseCodes(
  candidates: Candidate[],
  baseConfig: PresetConfig,
  limit: number
): string[] {
  if (!candidates.length || limit <= 0) return []

  const byCode = new Map(candidates.map((candidate) => [candidate.code, candidate]))
  const selectedCodes = new Set<string>()
  const selected: Candidate[] = []

  const ordered = [...candidates].sort((a, b) => {
    if (a.generatedRank !== b.generatedRank) return a.generatedRank - b.generatedRank
    if (a.hash !== b.hash) return a.hash - b.hash
    return a.code.localeCompare(b.code)
  })

  const first = [...ordered].sort((a, b) => {
    const aNonColor = distanceBetweenConfigs(a.config, baseConfig, NON_COLOR_FACETS)
    const bNonColor = distanceBetweenConfigs(b.config, baseConfig, NON_COLOR_FACETS)
    if (aNonColor !== bNonColor) return bNonColor - aNonColor
    const aColor = distanceBetweenConfigs(a.config, baseConfig, COLOR_FACETS)
    const bColor = distanceBetweenConfigs(b.config, baseConfig, COLOR_FACETS)
    if (aColor !== bColor) return aColor - bColor
    if (a.generatedRank !== b.generatedRank) return a.generatedRank - b.generatedRank
    return a.hash - b.hash
  })[0]

  if (!first) return []
  selected.push(first)
  selectedCodes.add(first.code)

  while (selected.length < limit) {
    let bestCode: string | null = null
    let bestScore = Number.NEGATIVE_INFINITY
    const prioritizeTypographyFor = Math.min(limit, 4)

    for (const candidate of ordered) {
      if (selectedCodes.has(candidate.code)) continue
      const minDistanceToSelection = Math.min(
        ...selected.map((item) => distanceBetweenConfigs(candidate.config, item.config))
      )
      const nonColorFromBase = distanceBetweenConfigs(
        candidate.config,
        baseConfig,
        NON_COLOR_FACETS
      )
      const colorFromBase = distanceBetweenConfigs(
        candidate.config,
        baseConfig,
        COLOR_FACETS
      )
      const generationPenalty = candidate.generatedRank * 0.015
      const bodyFontAlreadyUsed = selected.some(
        (item) => item.config.font === candidate.config.font
      )
      const headingFontAlreadyUsed = selected.some(
        (item) => item.config.fontHeading === candidate.config.fontHeading
      )
      const fontPairAlreadyUsed = selected.some(
        (item) =>
          item.config.font === candidate.config.font &&
          item.config.fontHeading === candidate.config.fontHeading
      )

      let typographyNovelty = 0
      if (selected.length < prioritizeTypographyFor) {
        typographyNovelty += bodyFontAlreadyUsed ? -2.4 : 2.2
        typographyNovelty += headingFontAlreadyUsed ? -1.8 : 1.6
        typographyNovelty += fontPairAlreadyUsed ? -2.8 : 1.4
      } else {
        typographyNovelty += bodyFontAlreadyUsed ? -0.6 : 0.6
        typographyNovelty += headingFontAlreadyUsed ? -0.4 : 0.4
      }

      const diversityScore =
        minDistanceToSelection * 1.55 +
        nonColorFromBase * 1.25 +
        colorFromBase * 0.25 -
        generationPenalty +
        typographyNovelty

      if (diversityScore > bestScore) {
        bestScore = diversityScore
        bestCode = candidate.code
      } else if (diversityScore === bestScore && bestCode) {
        const current = byCode.get(bestCode)
        if (!current || candidate.hash < current.hash) {
          bestCode = candidate.code
        }
      }
    }

    if (!bestCode) break
    const picked = byCode.get(bestCode)
    if (!picked) break
    selectedCodes.add(bestCode)
    selected.push(picked)
  }

  return selected.map((candidate) => candidate.code)
}

export function getRelatedPresets(
  resolved: ResolvedPreset,
  limit = 24
): string[] {
  const baseConfig = buildBaseConfig(resolved)
  const alternatives = buildAlternatives(baseConfig, resolved.code)
  const candidates = new Map<string, Candidate>()
  let generatedRank = 0

  function pushMutations(mutations: readonly [FacetKey, string][]) {
    if (!mutations.length) return
    const config = makeMutatedConfig(baseConfig, mutations)
    const code = encodePreset(config)
    if (code === resolved.code || candidates.has(code)) return
    candidates.set(code, {
      code,
      config,
      generatedRank,
      hash: hashString(`${resolved.code}:${code}`),
    })
    generatedRank += 1
  }

  function pushSingleFacet(key: FacetKey, count: number) {
    const values = alternatives[key]
    for (
      let i = 0;
      i < Math.min(count, values.length) && candidates.size < limit * 10;
      i += 1
    ) {
      pushMutations([[key, values[i]!]])
    }
  }

  function pushPlan(plan: readonly MutationPlanStep[]) {
    const mutations: [FacetKey, string][] = []
    for (const step of plan) {
      const values = alternatives[step.key]
      if (!values.length) return
      const idx = step.alternativeIndex ?? 0
      mutations.push([step.key, values[idx % values.length]!])
    }
    pushMutations(mutations)
  }

  // Tier 1: keep palette + style anchored; vary typography and UI traits.
  for (const key of NON_COLOR_FACETS) {
    pushSingleFacet(key, 2)
  }

  const nonColorPlans: ReadonlyArray<readonly MutationPlanStep[]> = [
    [
      { key: "font", alternativeIndex: 0 },
      { key: "iconLibrary", alternativeIndex: 0 },
    ],
    [
      { key: "fontHeading", alternativeIndex: 0 },
      { key: "radius", alternativeIndex: 0 },
    ],
    [
      { key: "menuAccent", alternativeIndex: 0 },
      { key: "font", alternativeIndex: 1 },
    ],
    [
      { key: "menuColor", alternativeIndex: 0 },
      { key: "iconLibrary", alternativeIndex: 1 },
    ],
  ]
  for (const plan of nonColorPlans) {
    pushPlan(plan)
  }

  // Tier 2: mild palette shifts while preserving overall feel.
  pushSingleFacet("chartColor", 2)
  pushSingleFacet("theme", 2)
  pushPlan([
    { key: "theme", alternativeIndex: 0 },
    { key: "chartColor", alternativeIndex: 0 },
  ])
  pushPlan([
    { key: "theme", alternativeIndex: 1 },
    { key: "chartColor", alternativeIndex: 1 },
  ])

  // Tier 3: broader mutations for variety if caller asks for many cards.
  pushSingleFacet("style", 1)
  pushSingleFacet("baseColor", 1)

  const mixedPlans: ReadonlyArray<readonly MutationPlanStep[]> = [
    [
      { key: "baseColor", alternativeIndex: 0 },
      { key: "font", alternativeIndex: 0 },
      { key: "iconLibrary", alternativeIndex: 0 },
    ],
    [
      { key: "style", alternativeIndex: 0 },
      { key: "fontHeading", alternativeIndex: 1 },
      { key: "menuAccent", alternativeIndex: 0 },
    ],
    [
      { key: "theme", alternativeIndex: 0 },
      { key: "menuColor", alternativeIndex: 0 },
      { key: "radius", alternativeIndex: 1 },
    ],
    [
      { key: "chartColor", alternativeIndex: 1 },
      { key: "font", alternativeIndex: 1 },
    ],
    [
      { key: "baseColor", alternativeIndex: 1 },
      { key: "theme", alternativeIndex: 0 },
      { key: "chartColor", alternativeIndex: 0 },
    ],
  ]
  for (const plan of mixedPlans) {
    pushPlan(plan)
  }

  // Fallbacks: still deterministic, but broader sweep when limit is high.
  for (const key of FACET_KEYS) {
    pushSingleFacet(key, alternatives[key].length)
  }

  for (let i = 0; i < FACET_KEYS.length; i += 1) {
    for (let j = i + 1; j < FACET_KEYS.length; j += 1) {
      pushPlan([
        { key: FACET_KEYS[i]!, alternativeIndex: 0 },
        { key: FACET_KEYS[j]!, alternativeIndex: 0 },
      ])
      pushPlan([
        { key: FACET_KEYS[i]!, alternativeIndex: 1 },
        { key: FACET_KEYS[j]!, alternativeIndex: 0 },
      ])
    }
  }

  return selectDiverseCodes(
    Array.from(candidates.values()),
    baseConfig,
    limit
  )
}

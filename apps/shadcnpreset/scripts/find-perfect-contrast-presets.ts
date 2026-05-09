/**
 * Find preset codes where light + dark both show 100% on the contrast checker
 * (AA 4.5:1 for all evaluated semantic pairs; zero unresolved parses).
 *
 * Sequential catalog order hits huge runs with identical theme tokens (font/icon swaps),
 * so `--random` is the practical way to discover varied perfect scores.
 *
 * Run from apps/shadcnpreset:
 *   pnpm exec node --import tsx/esm ./scripts/find-perfect-contrast-presets.ts --random --target 5000
 *   pnpm exec node --import tsx/esm ./scripts/find-perfect-contrast-presets.ts --random --target 2000 --out ./data/high-contrast-presets.json
 */
import fs from "node:fs"
import path from "node:path"

import { generateRandomCompatiblePreset } from "../lib/random-preset"
import {
  getOverallContrastScore,
  getPresetColorContrastReport,
} from "../lib/preset-color-contrast-report"
import { getPresetPage, PRESET_TOTAL_COMBINATIONS } from "../lib/preset-catalog"

function isHundredHundred(
  report: NonNullable<ReturnType<typeof getPresetColorContrastReport>>
) {
  const l = getOverallContrastScore(report.light)
  const d = getOverallContrastScore(report.dark)
  if (report.light.unresolvedCount !== 0 || report.dark.unresolvedCount !== 0) {
    return false
  }
  return l.percent === 100 && d.percent === 100
}

function parseArgs() {
  const argv = process.argv.slice(2)
  const mode = argv.includes("--sequential") ? "sequential" : "random"
  let target = 100
  let maxPages = 50_000
  let maxTries = 2_000_000
  let outPath: string | null = null

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--target" && argv[i + 1]) {
      target = Math.max(1, Number.parseInt(argv[i + 1]!, 10))
    }
    if (argv[i] === "--max-pages" && argv[i + 1]) {
      maxPages = Math.max(1, Number.parseInt(argv[i + 1]!, 10))
    }
    if (argv[i] === "--max-tries" && argv[i + 1]) {
      maxTries = Math.max(1, Number.parseInt(argv[i + 1]!, 10))
    }
    if (argv[i] === "--out" && argv[i + 1]) {
      outPath = path.resolve(process.cwd(), argv[i + 1]!)
    }
  }

  if (target > 10_000) {
    maxTries = Math.max(maxTries, target * 500)
  }

  return { mode, target, maxPages, maxTries, outPath } as const
}

const { mode, target, maxPages, maxTries, outPath } = parseArgs()
const seen = new Set<string>()
const matches: string[] = []

if (mode === "random") {
  console.error(
    `Random search: target ${target}, max tries ${maxTries.toLocaleString()}.`
  )
  let tries = 0
  while (matches.length < target && tries < maxTries) {
    tries++
    const code = generateRandomCompatiblePreset()
    const report = getPresetColorContrastReport(code)
    if (!report) continue
    if (!isHundredHundred(report)) continue
    if (seen.has(report.code)) continue
    seen.add(report.code)
    matches.push(report.code)
    if (tries % 50_000 === 0) {
      console.error(`…tries ${tries.toLocaleString()}, unique ${matches.length}`)
    }
  }
  const payload = {
    generatedAt: new Date().toISOString(),
    criteria:
      "100% AA (4.5:1) on all PRESET_THEME_CONTRAST_PAIRS in light and dark; zero unresolved parses",
    mode,
    tries,
    target,
    found: matches.length,
    codes: matches,
  }
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8")
    console.error(`Wrote ${matches.length} codes to ${outPath}`)
  }
  console.log(JSON.stringify(payload, null, 2))
  if (matches.length < target) process.exitCode = 1
} else {
  const PAGE_SIZE = 100
  console.error(
    `Sequential catalog (first pages only): ~${PRESET_TOTAL_COMBINATIONS.toLocaleString()} total; max ${maxPages} pages × ${PAGE_SIZE}.`
  )

  let examined = 0
  for (let page = 1; page <= maxPages && matches.length < target; page++) {
    const items = getPresetPage(page, PAGE_SIZE)
    if (items.length === 0) break

    for (const { code } of items) {
      examined++
      const report = getPresetColorContrastReport(code)
      if (!report) continue
      if (!isHundredHundred(report)) continue
      if (seen.has(report.code)) continue
      seen.add(report.code)
      matches.push(report.code)
      if (matches.length >= target) break
    }
    if (examined % 50_000 === 0) {
      console.error(
        `…examined ${examined.toLocaleString()}, unique ${matches.length}`
      )
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    criteria:
      "100% AA (4.5:1) on all PRESET_THEME_CONTRAST_PAIRS in light and dark; zero unresolved parses",
    mode,
    examined,
    target,
    found: matches.length,
    codes: matches,
  }
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8")
    console.error(`Wrote ${matches.length} codes to ${outPath}`)
  }
  console.log(JSON.stringify(payload, null, 2))
  if (matches.length < target) process.exitCode = 1
}

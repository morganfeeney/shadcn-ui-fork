#!/usr/bin/env node
/**
 * After merging upstream into this fork, run:
 *   pnpm verify:shadcnpreset-fork
 * See UPSTREAM.md and docs/shadcnpreset-fork-integration.md.
 */

import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const PRESET_MSG = "shadcnpreset:preset-code"

const paths = {
  v4Constants: join(
    root,
    "apps/v4/app/(app)/(create)/components/shadcnpreset-fork/constants.ts"
  ),
  v4Integration: join(
    root,
    "apps/v4/app/(app)/(create)/components/shadcnpreset-fork/shadcnpreset-create-page-integration.tsx"
  ),
  v4CreatePage: join(root, "apps/v4/app/(app)/(create)/create/page.tsx"),
  v4VercelBuild: join(root, "scripts/shadcnpreset-v4-vercel-build.mjs"),
  shPostmessage: join(root, "apps/shadcnpreset/lib/shadcnpreset-postmessage.ts"),
  shHook: join(root, "apps/shadcnpreset/hooks/use-preset-parent-url-sync.ts"),
  presetFrame: join(root, "apps/shadcnpreset/components/preset-v4-frame.tsx"),
}

function fail(message) {
  console.error(`verify-shadcnpreset-fork: ${message}`)
  process.exit(1)
}

function mustExist(label, filePath) {
  if (!existsSync(filePath)) {
    fail(`missing ${label}: ${filePath}`)
  }
}

function mustInclude(label, filePath, needle) {
  const text = readFileSync(filePath, "utf8")
  if (!text.includes(needle)) {
    fail(`${label} must include ${JSON.stringify(needle)}:\n  ${filePath}`)
  }
}

function countOccurrences(haystack, needle) {
  let n = 0
  let i = 0
  while ((i = haystack.indexOf(needle, i)) !== -1) {
    n++
    i += needle.length
  }
  return n
}

for (const [label, filePath] of Object.entries(paths)) {
  mustExist(label, filePath)
}

mustInclude("v4 constants", paths.v4Constants, PRESET_MSG)
mustInclude("shadcnpreset postmessage", paths.shPostmessage, PRESET_MSG)
mustInclude(
  "v4 integration",
  paths.v4Integration,
  "PRESET_CODE_SYNC_MESSAGE_TYPE"
)
mustInclude("v4 create page", paths.v4CreatePage, "ShadcnpresetCreatePageIntegration")
mustInclude(
  "v4 create page",
  paths.v4CreatePage,
  "shadcnpreset-create-page-integration"
)

mustInclude(
  "shadcnpreset hook",
  paths.shHook,
  "SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE"
)
mustInclude("shadcnpreset hook", paths.shHook, "usePresetParentUrlSync")

mustInclude("preset iframe host", paths.presetFrame, "usePresetParentUrlSync")
mustInclude("preset iframe host", paths.presetFrame, "use-preset-parent-url-sync")

mustExist("v4 vercel build script", paths.v4VercelBuild)

const constantsText = readFileSync(paths.v4Constants, "utf8")
const postMsgText = readFileSync(paths.shPostmessage, "utf8")
if (countOccurrences(constantsText, PRESET_MSG) < 1) {
  fail(`expected at least one ${PRESET_MSG} in v4 shadcnpreset-fork/constants.ts`)
}
if (countOccurrences(postMsgText, PRESET_MSG) < 1) {
  fail(`expected at least one ${PRESET_MSG} in shadcnpreset-postmessage.ts`)
}

console.log("verify-shadcnpreset-fork: OK (preset parent URL sync integration present)")

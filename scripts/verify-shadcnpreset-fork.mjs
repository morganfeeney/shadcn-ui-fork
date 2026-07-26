#!/usr/bin/env node
/**
 * After merging upstream into this fork, run:
 *   pnpm verify:shadcnpreset-fork
 * See UPSTREAM.md and docs/shadcnpreset-fork-integration.md.
 *
 * Product host (iframe parent) lives in the separate shadcnpreset repo.
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

for (const [label, filePath] of Object.entries(paths)) {
  mustExist(label, filePath)
}

mustInclude("v4 constants", paths.v4Constants, PRESET_MSG)
mustInclude(
  "v4 integration",
  paths.v4Integration,
  "PRESET_CODE_SYNC_MESSAGE_TYPE"
)
mustInclude(
  "v4 create page",
  paths.v4CreatePage,
  "ShadcnpresetCreatePageIntegration"
)
mustInclude(
  "v4 create page",
  paths.v4CreatePage,
  "shadcnpreset-create-page-integration"
)

mustExist("v4 vercel build script", paths.v4VercelBuild)

console.log(
  "verify-shadcnpreset-fork: OK (create/v4 embed integration present)"
)

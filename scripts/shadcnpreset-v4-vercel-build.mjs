#!/usr/bin/env node
/**
 * Fork-only Vercel build for apps/v4: deploy /create + preview iframes only.
 *
 * Temporarily moves heavy upstream route trees out of app/ before `next build`,
 * then restores them so local dev and upstream merges stay unchanged.
 *
 * See UPSTREAM.md § "Vercel (create-only v4 deploy)".
 */

import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const v4Root = join(root, "apps/v4")
const appDir = join(v4Root, "app")
const stashRoot = join(v4Root, ".vercel-stash")

/** App-router segments to omit from production deploy (paths relative to app/). */
const ROUTES_TO_STASH = [
  "(view)/view",
  "(view)/examples",
  "(view)/preview/typeset",
  "(app)/docs",
  "(app)/blocks",
  "(app)/charts",
  "(app)/colors",
  "(app)/examples",
  "(app)/(typeset)/typeset",
  "(app)/(root)",
  "(app)/(styles)",
  "(app)/llm",
  "typeset.css",
]

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with ${result.status}`)
  }
}

function stashRoutes() {
  mkdirSync(stashRoot, { recursive: true })

  for (const relativePath of ROUTES_TO_STASH) {
    const source = join(appDir, relativePath)
    if (!existsSync(source)) {
      continue
    }

    const target = join(stashRoot, relativePath)
    mkdirSync(dirname(target), { recursive: true })
    renameSync(source, target)
  }
}

function restoreRoutes() {
  for (const relativePath of ROUTES_TO_STASH) {
    const source = join(stashRoot, relativePath)
    if (!existsSync(source)) {
      continue
    }

    const target = join(appDir, relativePath)
    mkdirSync(dirname(target), { recursive: true })
    renameSync(source, target)
  }

  if (existsSync(stashRoot)) {
    rmSync(stashRoot, { recursive: true, force: true })
  }
}

function main() {
  run("pnpm", ["--filter=@shadcn/react", "build"], { cwd: root })
  run("pnpm", ["--filter=shadcn", "build"], { cwd: root })

  stashRoutes()

  try {
    run("pnpm", ["exec", "next", "build"], {
      cwd: v4Root,
      env: {
        ...process.env,
        NODE_OPTIONS: "--max-old-space-size=6144",
      },
    })
  } finally {
    restoreRoutes()
  }
}

main()

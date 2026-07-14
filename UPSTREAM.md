# Merging upstream into this fork

Keep the **shadcnpreset.com** integration (preset page URL staying in sync with the embedded v4 customizer) from turning into a merge headache.

**How the integration works (architecture, postMessage, URL strategy):** see [docs/shadcnpreset-fork-integration.md](docs/shadcnpreset-fork-integration.md).

## After every upstream merge

```bash
pnpm verify:shadcnpreset-fork
```

If this passes, the fork-only wiring is still intact. If it fails, fix the listed file(s) and run again.

## What this fork adds (importable modules)

| Area | Purpose |
|------|--------|
| `apps/v4/.../shadcnpreset-fork/` | Barrel: `ShadcnpresetCreatePageIntegration`, `PRESET_CODE_SYNC_MESSAGE_TYPE`, `constants.ts` |
| `apps/v4/app/(app)/create/page.tsx` | Single line: `<ShadcnpresetCreatePageIntegration />` + one import from `shadcnpreset-fork` |
| `apps/shadcnpreset/lib/shadcnpreset-postmessage.ts` | Shared `SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE` string |
| `apps/shadcnpreset/hooks/use-preset-parent-url-sync.ts` | Parent `message` listener; `PresetPageLiveProvider` callback + `history.replaceState`, else `router.replace` fallback |
| `apps/shadcnpreset/components/preset-v4-frame.tsx` | Wires `usePresetParentUrlSync(iframeRef, live?.onPresetFromIframe)` |
| `apps/shadcnpreset/components/preset-page-live-context.tsx` | Live preset state + `replaceState` |
| `apps/shadcnpreset/lib/sync-preset-social-meta.ts` | Client meta / OG / Twitter sync after URL changes |

The string **`shadcnpreset:preset-code`** must stay identical in `shadcnpreset-fork/constants.ts` and `lib/shadcnpreset-postmessage.ts` (the verify script checks both).

## Typical conflict: `apps/v4/app/(app)/create/page.tsx`

Upstream often edits imports or layout. When you resolve the conflict, **keep**:

- `import { ShadcnpresetCreatePageIntegration } from "@/app/(app)/create/components/shadcnpreset-fork"`
- `<ShadcnpresetCreatePageIntegration />` near `PresetHandler`

## Vercel (create-only v4 deploy)

Production v4 only needs `/create`, `/preview/*`, and `/init/*` for the shadcnpreset iframe. The full upstream site (docs, `/view/*`, blocks, etc.) OOMs on Vercel Hobby.

**Do not delete those routes from git.** Deploy uses a fork-only script:

```bash
node scripts/shadcnpreset-v4-vercel-build.mjs
```

Configured in `apps/v4/vercel.json`. It temporarily moves heavy `app/` segments to `apps/v4/.vercel-stash/` during `next build`, then restores them. Upstream files stay intact for merges.

## Local dev reminder

- v4 on the port in `NEXT_PUBLIC_V4_URL` (default `http://localhost:4000`)
- shadcnpreset with the same `NEXT_PUBLIC_V4_URL` so the iframe hits your local v4

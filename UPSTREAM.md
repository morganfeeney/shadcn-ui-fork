# Merging upstream into this fork

This repo is a **shadcn/ui fork** that hosts the create/customizer used by [shadcnpreset.com](https://shadcnpreset.com). The product app lives in a [separate repo](https://github.com/morganfeeney/shadcnpreset).

Keep the embed integration (iframe `postMessage` when `?embed=1`) from turning into a merge headache.

**How the integration works:** see [docs/shadcnpreset-fork-integration.md](docs/shadcnpreset-fork-integration.md).

## After every upstream merge

```bash
pnpm verify:shadcnpreset-fork
```

If this passes, the fork-only wiring is still intact. If it fails, fix the listed file(s) and run again.

## What this fork adds (create/v4)

| Area | Purpose |
|------|--------|
| `apps/v4/.../shadcnpreset-fork/` | `ShadcnpresetCreatePageIntegration`, `PRESET_CODE_SYNC_MESSAGE_TYPE`, share URL helpers |
| `apps/v4/app/(app)/(create)/create/page.tsx` | Mounts `<ShadcnpresetCreatePageIntegration />` + theme relay for embeds |
| Embed chrome | Hide marketing chrome / welcome dialog when `?embed=1` |

The string **`shadcnpreset:preset-code`** must stay identical here and in the product repo’s `lib/shadcnpreset-postmessage.ts`.

## Typical conflict: create page

Upstream often edits imports or layout. When you resolve the conflict, **keep**:

- `import { ShadcnpresetCreatePageIntegration } from "@/app/(app)/(create)/components/shadcnpreset-fork/shadcnpreset-create-page-integration"`
- `<ShadcnpresetCreatePageIntegration />` near `PresetHandler`

## Vercel (create-only v4 deploy)

Production v4 only needs `/create`, `/preview/*`, and `/init/*` for the product iframe. The full upstream site OOMs on Vercel Hobby.

**Do not delete those routes from git.** Deploy uses:

```bash
node scripts/shadcnpreset-v4-vercel-build.mjs
```

Configured in `apps/v4/vercel.json`.

## Local dev

- v4 on the port in `NEXT_PUBLIC_V4_URL` (default `http://localhost:4000`)
- Product app (`morganfeeney/shadcnpreset`) with the same `NEXT_PUBLIC_V4_URL` so its iframe hits this create instance

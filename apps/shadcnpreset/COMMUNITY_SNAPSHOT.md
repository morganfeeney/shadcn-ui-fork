# Community Snapshot Architecture

This app uses a snapshot-based flow for community ranking so runtime does not
depend on live vote aggregation queries.

## Goal

- Keep `/community` and community sitemap stable.
- Avoid hard failures when Neon is down or quota-limited.
- Keep ranking freshness with scheduled refreshes.
- Keep runtime Neon reads at zero for snapshot consumption.

## Flow

1. A scheduled GitHub Action runs daily (or manually via `workflow_dispatch`).
2. The job queries `preset_votes` in Neon and gets ranked preset codes.
3. Codes are normalized to canonical preset codes.
4. The job writes `data/community-presets-snapshot.json`.
5. A PR is opened automatically when the snapshot file changes.
6. After merge/deploy, consumers read snapshot first:
   - `/community` feed
   - `/sitemaps/community-presets.xml`
   - community membership checks
7. If snapshot is unavailable, deterministic catalog fallback is used.

## Storage

- **Runtime (production):** bundled file `data/community-presets-snapshot.json`.
- **Refresh job only:** reads `preset_votes` from Neon to regenerate the file.
- **Local refresh script:** updates the bundled JSON file.

No Vercel Blob is used.

## Files

- Snapshot service: `lib/community-snapshot.ts`
- Offline refresh workflow: `.github/workflows/community-snapshot-refresh.yml`
- Local refresh script: `scripts/refresh-community-snapshot.ts`
- Local shell wrapper: `scripts/refresh-community-snapshot.sh`
- Community consumer wiring: `lib/community-presets.ts`
- Feed consumer wiring: `lib/preset-feed.ts`
- Community sitemap route: `app/sitemaps/community-presets.xml/route.ts`
- Bundled snapshot: `data/community-presets-snapshot.json`

## Snapshot Format

Stored JSON payload:

```json
{
  "generatedAt": "2026-06-01T07:00:00.000Z",
  "source": "github-cron",
  "codes": ["b1FQfCxG4", "b2abc...", "..."]
}
```

Notes:
- `codes` are canonicalized and deduplicated.
- `source` is `github-cron` (scheduled automation) or `manual-refresh`.

## Required Environment Variables

- `DATABASE_URL` (used by refresh script/workflow to read vote rankings)
- `SHADCNPRESET_DATABASE_URL` GitHub repository secret (workflow input)

## Local Development

### No Neon

- Leave `DATABASE_URL` unset.
- App automatically uses deterministic fallback list.

### Local Opt-Out (Use DB Directly)

If you want local behavior to bypass snapshot-first reads:

- Set `LOCAL_DISABLE_COMMUNITY_SNAPSHOT=1`
- Keep `DATABASE_URL` set

In this mode, community reads query DB directly first (local convenience),
then still fall back to deterministic catalog ordering if DB is unavailable.

### Refresh Snapshot Locally

With `DATABASE_URL` set:

```bash
pnpm --filter shadcnpreset refresh:community-snapshot -- 2000 manual-refresh
```

This updates `data/community-presets-snapshot.json`.

### Run Refresh Automation Manually

```bash
gh workflow run "Community Snapshot Refresh" -f limit=2000
```

### Setup Checklist (GitHub Action)

- Add repository secret `SHADCNPRESET_DATABASE_URL`.
- Ensure the workflow has permission to open PRs.
- Merge snapshot refresh PRs as they appear.

## Failure Behavior

- If refresh fails: previous snapshot file remains deployed; consumers still work.
- If snapshot read fails: deterministic fallback is returned.
- If Neon is unavailable: refresh job is impacted; runtime pages still render from the deployed snapshot/fallback.

## Cost Notes

- Refresh automation: Neon reads only during scheduled/manual refresh job.
- Runtime reads: file-based snapshot only (no Neon `community_snapshot` query path).
- Build/runtime both can operate without Neon when snapshot file exists.

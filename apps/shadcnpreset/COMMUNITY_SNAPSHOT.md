# Community Snapshot Architecture

This app uses a snapshot-based flow for community ranking so build/runtime do not depend on live vote queries on every request.

## Goal

- Keep `/community` and community sitemap stable.
- Avoid hard failures when Neon is down or quota-limited.
- Keep ranking freshness with scheduled refreshes.
- Avoid Vercel Blob operation costs.

## Flow

1. Vercel Cron triggers `GET /api/internal/community-snapshot/refresh` daily (Hobby plan limit).
2. The refresh route queries `preset_votes` in Neon and gets ranked preset codes.
3. Codes are normalized to canonical preset codes.
4. Snapshot JSON is upserted into a single Neon row (`community_snapshot`).
5. Consumers read snapshot first:
   - `/community` feed
   - `/sitemaps/community-presets.xml`
   - community membership checks
6. If snapshot is unavailable, deterministic catalog fallback is used.

## Storage

- **Runtime (production):** one row in Neon table `community_snapshot`, cached for up to 1 hour.
- **Build/offline:** bundled file `data/community-presets-snapshot.json`.
- **Local refresh script:** can update both Neon row and the bundled JSON file.

No Vercel Blob is used.

## Files

- Snapshot service: `lib/community-snapshot.ts`
- Cron endpoint: `app/api/internal/community-snapshot/refresh/route.ts`
- Local refresh script: `scripts/refresh-community-snapshot.ts`
- Cron config: `vercel.json`
- Community consumer wiring: `lib/community-presets.ts`
- Feed consumer wiring: `lib/preset-feed.ts`
- Community sitemap route: `app/sitemaps/community-presets.xml/route.ts`
- Bundled fallback: `data/community-presets-snapshot.json`

## Snapshot Format

Stored JSON payload:

```json
{
  "generatedAt": "2026-06-01T07:00:00.000Z",
  "source": "neon-cron",
  "codes": ["b1FQfCxG4", "b2abc...", "..."]
}
```

Notes:
- `codes` are canonicalized and deduplicated.
- `source` is `neon-cron` (cron) or `manual-refresh` (manual trigger).

## Security

Refresh endpoint authorization:

- Required: `Authorization: Bearer <CRON_SECRET>`

## Required Environment Variables

- `DATABASE_URL` (Neon votes + snapshot row)
- `CRON_SECRET` (protect refresh endpoint)

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
pnpm refresh:community-snapshot
```

This updates:
- Neon `community_snapshot` row
- `data/community-presets-snapshot.json`

### Refresh Snapshot In Production

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" \
  "https://your-domain.com/api/internal/community-snapshot/refresh?limit=2000"
```

Or use:

```bash
CRON_SECRET="..." ./scripts/refresh-community-snapshot.sh https://your-domain.com 2000
```

## Failure Behavior

- If refresh fails: existing snapshot row remains; consumers still work.
- If snapshot read fails: deterministic fallback is returned.
- If Neon is unavailable: only refresh job is impacted; render/build paths remain stable.

## Cost Notes

- Cron refresh: one Neon query + one upsert per day.
- Runtime reads: one cached Neon read per hour at most (not per request).
- Build: reads bundled JSON only; no Neon required.

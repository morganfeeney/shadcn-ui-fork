# Community Snapshot Architecture

This app now uses a snapshot-based flow for community ranking so build/runtime do not depend on live Neon availability.

## Goal

- Keep `/community` and community sitemap stable.
- Avoid hard failures when Neon is down or quota-limited.
- Keep ranking freshness with scheduled refreshes.

## Flow

1. Vercel Cron triggers `GET /api/internal/community-snapshot/refresh` hourly.
2. The refresh route queries `preset_votes` in Neon and gets ranked preset codes.
3. Codes are normalized to canonical preset codes.
4. Snapshot JSON is written to Vercel Blob.
5. Consumers read snapshot first:
   - `/community` feed
   - `/sitemaps/community-presets.xml`
   - community membership checks
6. If snapshot is unavailable, deterministic catalog fallback is used.

## Files

- Snapshot service: `lib/community-snapshot.ts`
- Cron endpoint: `app/api/internal/community-snapshot/refresh/route.ts`
- Cron config: `vercel.json`
- Community consumer wiring: `lib/community-presets.ts`
- Feed consumer wiring: `lib/preset-feed.ts`
- Community sitemap route: `app/sitemaps/community-presets.xml/route.ts`

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

- `BLOB_READ_WRITE_TOKEN` (read/write snapshot in Blob)
- `CRON_SECRET` (protect refresh endpoint)

Optional:

- `COMMUNITY_SNAPSHOT_BLOB_PATH` (default: `community/community-presets-snapshot.json`)

## Local Development

### No Neon / No Blob

- Leave `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` unset.
- App automatically uses deterministic fallback list.

### Local Opt-Out (Use DB Directly)

If you want local behavior to bypass snapshot-first reads:

- Set `LOCAL_DISABLE_COMMUNITY_SNAPSHOT=1`
- Keep `DATABASE_URL` set

In this mode, community reads query DB directly first (local convenience),
then still fall back to deterministic catalog ordering if DB is unavailable.

### Full Snapshot Flow

Set:

- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `CRON_SECRET`

Manually trigger refresh:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" \
  "http://localhost:4010/api/internal/community-snapshot/refresh?limit=2000"
```

Then `/community` and `/sitemaps/community-presets.xml` will read snapshot data.

## Failure Behavior

- If refresh fails: existing snapshot remains; consumers still work.
- If snapshot read fails: deterministic fallback is returned.
- If Neon is unavailable: only refresh job is impacted; render/build paths remain stable.

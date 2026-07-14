# Neon Usage Optimization Notes

This document captures the approach used to reduce unnecessary Neon compute activity in `apps/shadcnpreset`.

## Problem We Observed

- Compute usage was climbing faster than expected.
- The app was generating many small DB-backed API requests (especially vote state checks) that kept waking compute.
- Returning to a browser tab could trigger bursts of refetches.

## Root Cause Pattern

The main pressure came from per-card vote state fetches:

- Each preset card called `useVote(code)`.
- `useVote` performed `GET /api/presets/[code]/vote`.
- That route queried Postgres for count + user vote state.
- Pages with many cards could produce many requests at once.

## Optimization Strategy

### 1) Batch vote counts for list surfaces

Use a single request for many cards:

- Added `usePresetVotesBatch()` in `hooks/use-preset-votes-batch.ts`.
- Calls `/api/presets/votes?codes=...` once for the visible set.
- Applies `staleTime` and disables focus/reconnect refetch.

Wired into:

- `components/list-view.tsx`
- `app/(home)/components.tsx`

Each card receives `initialVoteCount`.

### 2) Make per-card vote-state fetch lazy for anonymous users

Updated `useVote()` in `hooks/use-vote.ts`:

- Added `initialVotes` option.
- If user is anonymous and `initialVotes` exists, skip per-card `/api/presets/[code]/vote` fetch.
- Disabled automatic focus/reconnect refetch for this query.
- Increased freshness window (`staleTime`).

### 3) Dedupe auth session bootstrap calls

Updated `stores/auth-store.ts`:

- Added a shared in-flight promise for `bootstrapSession`.
- Prevents multiple simultaneous session checks from different mounted components.

### 4) Add DB connection fingerprinting

Updated `lib/db.ts`:

- Sets `application_name` for every DB connection.
- Supports explicit override via `DB_APPLICATION_NAME` (or `PGAPPNAME`).
- Falls back to a derived fingerprint including app prefix, runtime source, environment, and branch/project metadata.

This makes `pg_stat_activity` useful for identifying which service/environment keeps compute active.

## Files Changed

- `hooks/use-preset-votes-batch.ts` (new)
- `hooks/use-vote.ts`
- `components/list-view.tsx`
- `app/(home)/components.tsx`
- `components/preset-style-overview-card.tsx`
- `stores/auth-store.ts`
- `lib/db.ts`

## Expected Impact

- Lower request fanout on card-heavy pages.
- Fewer DB hits from anonymous browsing.
- Fewer tab-focus refetch bursts.
- Better chance for Neon compute to remain idle between real user actions.

## How To Verify

1. Open Home and Community pages as anonymous user.
2. In browser network tab:
   - Confirm one batched call to `/api/presets/votes`.
   - Confirm card-level `/api/presets/[code]/vote` calls are reduced/absent on initial load.
3. Switch tabs and return:
   - Confirm no large vote refetch burst on focus.
4. In Neon Monitoring:
   - Compare active/request patterns before vs after.
   - Confirm fewer frequent wake events.

## Follow-up Ideas

- Batch authenticated `hasVoted` state as a separate endpoint for dense surfaces.
- Apply the same batching pattern to any other card-level DB-backed metadata.
- Add lightweight request logging around vote APIs for ongoing visibility.

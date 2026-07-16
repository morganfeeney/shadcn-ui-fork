#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   DATABASE_URL="postgres://..." ./apps/shadcnpreset/scripts/refresh-community-snapshot.sh
#   DATABASE_URL="postgres://..." ./apps/shadcnpreset/scripts/refresh-community-snapshot.sh 2000 github-cron
#
# Notes:
# - Arg1 (optional): limit, defaults to 2000
# - Arg2 (optional): source, defaults to manual-refresh

LIMIT="${1:-${LIMIT:-2000}}"
SOURCE="${2:-${SOURCE:-manual-refresh}}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required."
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "${REPO_ROOT}"

echo "Generating community snapshot JSON (limit=${LIMIT}, source=${SOURCE})..."
pnpm --filter shadcnpreset refresh:community-snapshot -- "${LIMIT}" "${SOURCE}"
echo "Updated apps/shadcnpreset/data/community-presets-snapshot.json"

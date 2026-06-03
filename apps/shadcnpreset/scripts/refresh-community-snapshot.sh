#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   CRON_SECRET="..." ./apps/shadcnpreset/scripts/refresh-community-snapshot.sh https://your-domain.com 2000
#   BASE_URL="https://your-domain.com" CRON_SECRET="..." ./apps/shadcnpreset/scripts/refresh-community-snapshot.sh
#
# Notes:
# - Arg1 or BASE_URL: deployment origin (no trailing slash needed)
# - Arg2 (optional): limit, defaults to 2000

# Optional inline fallback secret for local convenience.
# WARNING: do not commit a real secret value.
SCRIPT_CRON_SECRET=
BASE_URL="https://shadcnpreset.com"

BASE_URL="${1:-${BASE_URL:-}}"
LIMIT="${2:-${LIMIT:-2000}}"

if [[ -z "${BASE_URL}" ]]; then
  echo "Provide BASE_URL as env var or first argument."
  echo 'Example: BASE_URL="https://shadcnpreset.com" ./apps/shadcnpreset/scripts/refresh-community-snapshot.sh'
  exit 1
fi

BASE_URL="${BASE_URL%/}"
ENDPOINT="${BASE_URL}/api/internal/community-snapshot/refresh?limit=${LIMIT}"

if [[ -z "${CRON_SECRET:-}" && -n "${SCRIPT_CRON_SECRET}" ]]; then
  CRON_SECRET="${SCRIPT_CRON_SECRET}"
fi

if [[ -z "${CRON_SECRET:-}" ]]; then
  read -r -s -p "Enter CRON_SECRET: " CRON_SECRET
  echo
fi

if [[ -z "${CRON_SECRET}" ]]; then
  echo "CRON_SECRET is required."
  exit 1
fi

echo "Refreshing community snapshot..."
echo "Endpoint: ${ENDPOINT}"

HTTP_CODE="$(
  curl -sS -o /tmp/community-snapshot-refresh-response.json \
    -w "%{http_code}" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    "${ENDPOINT}"
)"

echo "Status: ${HTTP_CODE}"
echo "Response:"
cat /tmp/community-snapshot-refresh-response.json
echo

if [[ "${HTTP_CODE}" -lt 200 || "${HTTP_CODE}" -ge 300 ]]; then
  echo "Refresh failed."
  exit 1
fi

echo "Refresh succeeded."

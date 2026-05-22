#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   BASE_URL="https://your-domain.com" ./apps/shadcnpreset/scripts/check-cache.sh
# or:
#   ./apps/shadcnpreset/scripts/check-cache.sh https://your-domain.com

BASE_URL="${1:-${BASE_URL:-}}"
if [[ -z "${BASE_URL}" ]]; then
  echo "Provide BASE_URL as env var or first argument."
  echo 'Example: BASE_URL="https://shadcnpreset.com" ./apps/shadcnpreset/scripts/check-cache.sh'
  exit 1
fi

BASE_URL="${BASE_URL%/}"

URLS=(
  "$BASE_URL/"
  "$BASE_URL/community"
  "$BASE_URL/card-catalog"
  "$BASE_URL/high-contrast-presets"
  "$BASE_URL/sitemap.xml"
  "$BASE_URL/sitemaps/static.xml"
  "$BASE_URL/sitemaps/community-presets.xml"
  "$BASE_URL/api/presets/leaderboard?limit=8"
  "$BASE_URL/api/presets/votes?codes=default"
)

print_headers() {
  local url="$1"
  local headers
  headers="$(curl -sSI "$url" | tr -d '\r')"

  local status cache_control x_vercel_cache x_nextjs_cache age
  status="$(echo "$headers" | awk 'NR==1 {print $0}')"
  cache_control="$(echo "$headers" | awk -F': ' 'tolower($1)=="cache-control"{print $2; exit}')"
  x_vercel_cache="$(echo "$headers" | awk -F': ' 'tolower($1)=="x-vercel-cache"{print $2; exit}')"
  x_nextjs_cache="$(echo "$headers" | awk -F': ' 'tolower($1)=="x-nextjs-cache"{print $2; exit}')"
  age="$(echo "$headers" | awk -F': ' 'tolower($1)=="age"{print $2; exit}')"

  echo "URL: $url"
  echo "  $status"
  echo "  cache-control: ${cache_control:-<none>}"
  echo "  x-vercel-cache: ${x_vercel_cache:-<none>}"
  echo "  x-nextjs-cache: ${x_nextjs_cache:-<none>}"
  echo "  age: ${age:-<none>}"
}

echo "Cache header check for: $BASE_URL"
echo

for round in 1 2 3; do
  echo "========== ROUND $round =========="
  for url in "${URLS[@]}"; do
    print_headers "$url"
    echo
  done

  if [[ "$round" -lt 3 ]]; then
    sleep 3
  fi
done

echo "Done."

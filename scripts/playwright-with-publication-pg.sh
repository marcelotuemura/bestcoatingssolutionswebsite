#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

URL="$(
  pnpm exec node --import ./scripts/register-ts-alias.mjs --experimental-strip-types \
    scripts/bootstrap-publication-pg.ts | tee /tmp/bcs-pub-bootstrap.log | tail -n 1
)"

export MEDIA_PUBLICATION_DATABASE_URL="$URL"
export DATABASE_URL="$URL"
export MEDIA_PUBLICATION_REPOSITORY=postgres
# Local Playwright only — durable production/staging must use supabase mode.
export MEDIA_GALLERY_STORAGE_MODE="${MEDIA_GALLERY_STORAGE_MODE:-local}"
export MEDIA_SUPABASE_ENV="${MEDIA_SUPABASE_ENV:-development}"

echo "Using publication DB for e2e webServer" >&2
pnpm build
exec pnpm start

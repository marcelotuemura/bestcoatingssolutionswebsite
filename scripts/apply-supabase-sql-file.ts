/**
 * Apply a SQL file to a non-production Supabase Postgres database.
 *
 *   SUPABASE_DB_URL=postgresql://... \
 *   MEDIA_SUPABASE_ENV=staging \
 *   pnpm exec node --import ./scripts/register-ts-alias.mjs --experimental-strip-types \
 *     scripts/apply-supabase-sql-file.ts supabase/migrations/20260725193000_media_phase5_authz_denials.sql
 *
 * Never prints connection secrets. Refuses production.
 */
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: apply-supabase-sql-file.ts <sql-file>');
    process.exit(2);
  }
  const envName = (process.env.MEDIA_SUPABASE_ENV ?? '').toLowerCase();
  if (envName === 'production' || envName === 'prod') {
    console.error('REFUSED: production');
    process.exit(2);
  }
  const dbUrl =
    process.env.SUPABASE_DB_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    console.error('SKIP: SUPABASE_DB_URL (or DATABASE_URL) is required.');
    process.exit(0);
  }
  if (
    /prod/i.test(dbUrl) &&
    envName !== 'staging' &&
    envName !== 'development'
  ) {
    console.error(
      'REFUSED: connection string looks like production without staging/dev env.',
    );
    process.exit(2);
  }

  const abs = path.resolve(file);
  await fs.access(abs);
  console.warn(`Applying ${path.basename(abs)} via psql (secrets redacted)`);

  const res = spawnSync('psql', [dbUrl, '-v', 'ON_ERROR_STOP=1', '-f', abs], {
    encoding: 'utf8',
  });
  if (res.status !== 0) {
    const err = `${res.stdout ?? ''}\n${res.stderr ?? ''}`
      .replace(dbUrl, '[redacted-db-url]')
      .replace(/postgres(ql)?:\/\/[^@]+@/gi, 'postgres://[redacted]@');
    console.error(err);
    process.exit(1);
  }
  console.warn('OK: migration applied');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

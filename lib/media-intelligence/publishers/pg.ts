/**
 * PostgreSQL access for Phase 6 publication RPCs.
 * Actor is derived via set_config(request.jwt.claim.sub) — never client-trusted.
 */

import { createHash, randomUUID } from 'node:crypto';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import type { MediaAccessRole } from '@/lib/media-intelligence/auth/roles';

const BCS_NS = '6f1c2c3e-5ec4-4a11-9b0d-media-pub-v1';

let pool: Pool | null = null;

export function resolvePublicationDatabaseUrl(): string | null {
  const url =
    process.env.MEDIA_PUBLICATION_DATABASE_URL?.trim() ||
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    null;
  return url || null;
}

export function isPublicationPostgresConfigured(): boolean {
  return Boolean(resolvePublicationDatabaseUrl());
}

export function getPublicationPool(): Pool {
  const url = resolvePublicationDatabaseUrl();
  if (!url) {
    throw new Error(
      'Publication PostgreSQL is required. Set MEDIA_PUBLICATION_DATABASE_URL, SUPABASE_DB_URL, or DATABASE_URL.',
    );
  }
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 8 });
  }
  return pool;
}

export function __resetPublicationPoolForTests(): void {
  const current = pool;
  pool = null;
  void current?.end();
}

/** Stable UUID for temporary-auth actor ids (non-UUID strings). */
export function actorIdToUuid(actorId: string): string {
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      actorId,
    )
  ) {
    return actorId.toLowerCase();
  }
  const hex = createHash('sha256').update(`${BCS_NS}:${actorId}`).digest('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `a${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

function roleToDb(role: MediaAccessRole): string {
  return role === 'administrator' ? 'administrator' : role;
}

export async function ensurePublicationActor(
  client: PoolClient,
  actor: MediaTrustedActor,
): Promise<string> {
  const uid = actorIdToUuid(actor.id);
  const email = `${uid}@media.local`;
  await client.query(
    `insert into auth.users (id, email) values ($1::uuid, $2)
     on conflict (id) do nothing`,
    [uid, email],
  );
  await client.query(
    `insert into public.media_users (id, email, display_name, is_active)
     values ($1::uuid, $2, $3, true)
     on conflict (id) do update
       set is_active = true, archived_at = null, display_name = excluded.display_name`,
    [uid, email, actor.role],
  );
  for (const role of actor.roles) {
    await client.query(
      `insert into public.media_user_roles (user_id, role, assigned_by)
       values ($1::uuid, $2::public.media_role, $1::uuid)
       on conflict (user_id, role) do update set revoked_at = null`,
      [uid, roleToDb(role)],
    );
  }
  return uid;
}

export async function withPublicationActor<T>(
  actor: MediaTrustedActor,
  fn: (client: PoolClient, actorUuid: string) => Promise<T>,
): Promise<T> {
  const client = await getPublicationPool().connect();
  try {
    await client.query('begin');
    const uid = await ensurePublicationActor(client, actor);
    await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [
      uid,
    ]);
    await client.query(
      `select set_config('request.jwt.claim.role', 'authenticated', true)`,
    );
    const result = await fn(client, uid);
    await client.query('commit');
    return result;
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      /* ignore */
    }
    throw error;
  } finally {
    client.release();
  }
}

/** Service-context writes (asset seed sync) — no end-user JWT. */
export async function withPublicationService<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPublicationPool().connect();
  try {
    await client.query('begin');
    await client.query(`select set_config('request.jwt.claim.sub', '', true)`);
    await client.query(
      `select set_config('request.jwt.claim.role', 'service_role', true)`,
    );
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      /* ignore */
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function queryAsActor<T extends QueryResultRow>(
  actor: MediaTrustedActor,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  return withPublicationActor(actor, async (client) => {
    const res = await client.query<T>(sql, params);
    return res.rows;
  });
}

export function newIdempotencyKey(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

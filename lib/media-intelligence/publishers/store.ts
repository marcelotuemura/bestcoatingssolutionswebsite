/**
 * In-memory publication job store for temporary-auth / unit tests.
 * Postgres tables mirror this shape for Supabase cutover.
 *
 * Uses globalThis so Next.js server-action and RSC module graphs share one
 * Map in the same Node process (module-scoped Maps are duplicated otherwise).
 */

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type {
  PublicationEvent,
  PublicationJob,
  PublicationJobStatus,
} from '@/lib/media-intelligence/publishers/types';

type PublicationStoreState = {
  jobs: Map<string, PublicationJob>;
  events: PublicationEvent[];
  idempotencyIndex: Map<string, string>;
};

const GLOBAL_KEY = '__bcs_media_publication_store_v1__';
const PERSIST_DIR = join(tmpdir(), 'bcs-media-publication-store');
const PERSIST_FILE = join(PERSIST_DIR, 'store.json');

function createEmptyState(): PublicationStoreState {
  return {
    jobs: new Map(),
    events: [],
    idempotencyIndex: new Map(),
  };
}

function loadPersistedState(): PublicationStoreState | null {
  try {
    if (!existsSync(PERSIST_FILE)) return null;
    const raw = JSON.parse(readFileSync(PERSIST_FILE, 'utf8')) as {
      jobs?: PublicationJob[];
      events?: PublicationEvent[];
    };
    const state = createEmptyState();
    for (const job of raw.jobs ?? []) {
      state.jobs.set(job.id, job);
      state.idempotencyIndex.set(job.idempotencyKey, job.id);
    }
    state.events.push(...(raw.events ?? []));
    return state;
  } catch {
    return null;
  }
}

function persistState(state: PublicationStoreState): void {
  try {
    mkdirSync(PERSIST_DIR, { recursive: true });
    writeFileSync(
      PERSIST_FILE,
      JSON.stringify({
        jobs: [...state.jobs.values()],
        events: state.events,
      }),
      'utf8',
    );
  } catch {
    // Persistence is best-effort for local/e2e; Postgres is the durable path.
  }
}

function getState(): PublicationStoreState {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: PublicationStoreState;
  };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = loadPersistedState() ?? createEmptyState();
  }
  return g[GLOBAL_KEY];
}

export function resetPublicationStoreForTests(): void {
  const state = getState();
  state.jobs.clear();
  state.events.length = 0;
  state.idempotencyIndex.clear();
  persistState(state);
}

export function listPublicationJobs(): readonly PublicationJob[] {
  return [...getState().jobs.values()].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getPublicationJob(id: string): PublicationJob | undefined {
  return getState().jobs.get(id);
}

export function findJobByIdempotencyKey(
  key: string,
): PublicationJob | undefined {
  const state = getState();
  const id = state.idempotencyIndex.get(key);
  return id ? state.jobs.get(id) : undefined;
}

export function savePublicationJob(job: PublicationJob): PublicationJob {
  const state = getState();
  state.jobs.set(job.id, job);
  state.idempotencyIndex.set(job.idempotencyKey, job.id);
  persistState(state);
  return job;
}

export function appendPublicationEvent(input: {
  readonly jobId: string;
  readonly actorId: string;
  readonly action: string;
  readonly previousStatus?: PublicationJobStatus;
  readonly nextStatus?: PublicationJobStatus;
  readonly target: PublicationJob['target'];
  readonly metadata?: Record<string, unknown>;
}): PublicationEvent {
  const event: PublicationEvent = {
    id: randomUUID(),
    jobId: input.jobId,
    actorId: input.actorId,
    action: input.action,
    previousStatus: input.previousStatus,
    nextStatus: input.nextStatus,
    target: input.target,
    metadata: input.metadata ?? {},
    at: new Date().toISOString(),
  };
  const state = getState();
  state.events.push(event);
  persistState(state);
  return event;
}

export function listPublicationEvents(
  jobId: string,
): readonly PublicationEvent[] {
  return getState().events.filter((e) => e.jobId === jobId);
}

export function newPublicationIds(): { id: string; externalId: string } {
  const id = randomUUID();
  return { id, externalId: `pub_${id.replace(/-/g, '').slice(0, 16)}` };
}

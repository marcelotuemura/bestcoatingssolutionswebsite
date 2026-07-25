/**
 * Audit logging — never log secrets, tokens, signed URL queries, or media bytes.
 */

import type { MediaAccessRole } from '@/lib/media-intelligence/auth/roles';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'role_assigned'
  | 'role_revoked'
  | 'migration_started'
  | 'migration_completed'
  | 'migration_failed'
  | 'upload'
  | 'analysis_run'
  | 'duplicate_decision'
  | 'approval_decision'
  | 'storage_access_failure'
  | 'integrity_conflict'
  | 'session_expired';

export type AuditEventInput = {
  readonly action: AuditAction;
  readonly actorId?: string;
  readonly actorEmail?: string;
  readonly actorRole?: MediaAccessRole;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly success?: boolean;
  readonly ip?: string;
  readonly userAgent?: string;
  readonly metadata?: Record<string, unknown>;
};

const REDACT_KEYS = new Set([
  'password',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'serviceRoleKey',
  'service_role',
  'token',
  'authorization',
  'cookie',
  'signedUrl',
  'signed_url',
]);

export function sanitizeAuditMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!metadata) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (REDACT_KEYS.has(key) || /secret|password|token|key/i.test(key)) {
      out[key] = '[redacted]';
      continue;
    }
    if (typeof value === 'string' && value.includes('token=')) {
      out[key] = '[redacted-url]';
      continue;
    }
    out[key] = value;
  }
  return out;
}

export type AuditSink = (event: AuditEventInput) => Promise<void> | void;

const memoryAuditLog: AuditEventInput[] = [];

let sink: AuditSink = async (event) => {
  memoryAuditLog.push({
    ...event,
    metadata: sanitizeAuditMetadata(event.metadata),
  });
};

export function setAuditSink(next: AuditSink): void {
  sink = next;
}

export async function recordAuditEvent(event: AuditEventInput): Promise<void> {
  await sink({
    ...event,
    success: event.success ?? true,
    metadata: sanitizeAuditMetadata(event.metadata),
  });
}

export function getMemoryAuditLogForTests(): readonly AuditEventInput[] {
  return memoryAuditLog;
}

export function clearMemoryAuditLogForTests(): void {
  memoryAuditLog.length = 0;
}

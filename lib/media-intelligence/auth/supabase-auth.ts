import { createSupabaseServerClient } from '@/lib/media-intelligence/supabase/client';
import {
  evaluateMediaAccessGate,
  isMediaLocalAuthBypass,
} from '@/config/media-intelligence';
import {
  MEDIA_ROLES,
  primaryRole,
  type MediaAccessRole,
} from '@/lib/media-intelligence/auth/roles';
import type { MediaSessionResult } from '@/lib/media-intelligence/auth/session';
import { recordAuditEvent } from '@/lib/media-intelligence/audit/audit';
import { validateSupabaseConfig } from '@/lib/media-intelligence/supabase/config';

function isMediaAccessRole(value: unknown): value is MediaAccessRole {
  return (
    typeof value === 'string' &&
    (MEDIA_ROLES as readonly string[]).includes(value)
  );
}

/**
 * Resolve trusted actor from Supabase Auth session + media_user_roles.
 */
export async function resolveSupabaseMediaActor(): Promise<MediaSessionResult> {
  const gate = evaluateMediaAccessGate();
  if (!gate.ok) {
    return { ok: false, error: gate.reason, status: gate.status };
  }

  // Local bypass still allowed in development only (same rules as Phase 1).
  if (gate.mode === 'local-bypass' || isMediaLocalAuthBypass()) {
    return {
      ok: true,
      actor: {
        id: 'local-dev-owner',
        role: 'owner',
        roles: ['owner'],
        source: 'local-dev-bypass',
      },
    };
  }

  const config = validateSupabaseConfig();
  if (!config.ok) {
    return {
      ok: false,
      error: `Supabase Auth unavailable: ${config.reason}`,
      status: 503,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return {
        ok: false,
        error: 'Authentication required.',
        status: 401,
      };
    }

    const { data: roleRows } = await supabase
      .from('media_user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .is('revoked_at', null);

    const roles = (roleRows ?? [])
      .map((row) => row.role)
      .filter(isMediaAccessRole);

    if (roles.length === 0) {
      return {
        ok: false,
        error: 'Authenticated but no media role assigned.',
        status: 403,
      };
    }

    return {
      ok: true,
      actor: {
        id: data.user.id,
        email: data.user.email,
        role: primaryRole(roles),
        roles,
        source: 'supabase-auth',
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Supabase session validation failed.',
      status: 503,
    };
  }
}

export async function supabaseEmailPasswordLogin(input: {
  readonly email: string;
  readonly password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = validateSupabaseConfig();
  if (!config.ok) return { ok: false, error: config.reason };

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error) {
      await recordAuditEvent({
        action: 'login_failed',
        actorEmail: input.email,
        success: false,
        metadata: { reason: error.message },
      });
      return { ok: false, error: 'Invalid email or password.' };
    }
    await recordAuditEvent({
      action: 'login',
      actorEmail: input.email,
      success: true,
    });
    return { ok: true };
  } catch (error) {
    await recordAuditEvent({
      action: 'login_failed',
      actorEmail: input.email,
      success: false,
      metadata: {
        reason: error instanceof Error ? error.message : 'unknown',
      },
    });
    return { ok: false, error: 'Login failed.' };
  }
}

export async function supabaseLogout(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.auth.signOut();
    await recordAuditEvent({
      action: 'logout',
      actorId: user?.id,
      actorEmail: user?.email,
      success: true,
    });
  } catch {
    // best-effort
  }
}

export async function supabaseRequestPasswordReset(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/media/login?reset=1`,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Reset failed.',
    };
  }
}

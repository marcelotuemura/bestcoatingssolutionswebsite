/**
 * Supabase / Phase 5 environment validation.
 * Fail closed in production when required config is absent.
 */

export type MediaAuthProvider = 'temporary' | 'supabase';

export type SupabaseEnvConfig = {
  readonly url: string;
  readonly anonKey: string;
  readonly serviceRoleKey?: string;
  readonly projectRef: string;
  readonly isProductionTarget: boolean;
};

function trim(value: string | undefined): string {
  return value?.trim() ?? '';
}

export function resolveMediaAuthProvider(
  raw = process.env.MEDIA_AUTH_PROVIDER?.trim().toLowerCase(),
): MediaAuthProvider {
  if (raw === 'supabase') return 'supabase';
  return 'temporary';
}

export function readSupabasePublicEnv(): {
  readonly url: string;
  readonly anonKey: string;
} {
  return {
    url: trim(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

export function readSupabaseServiceRoleKey(): string {
  return trim(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function extractSupabaseProjectRef(url: string): string {
  try {
    const host = new URL(url).hostname;
    // https://abcd.supabase.co
    return host.split('.')[0] ?? host;
  } catch {
    return 'unknown';
  }
}

export function isSupabaseProductionTarget(url: string): boolean {
  const flag = trim(process.env.MEDIA_SUPABASE_ENV).toLowerCase();
  if (flag === 'production' || flag === 'prod') return true;
  if (flag === 'development' || flag === 'dev' || flag === 'staging') {
    return false;
  }
  // Heuristic: explicit prod project refs via env
  const prodRef = trim(process.env.MEDIA_SUPABASE_PRODUCTION_REF);
  if (prodRef && extractSupabaseProjectRef(url) === prodRef) return true;
  return false;
}

export type SupabaseConfigResult =
  | { readonly ok: true; readonly config: SupabaseEnvConfig }
  | { readonly ok: false; readonly reason: string };

/**
 * Validate Supabase config for server use.
 * Service-role is optional for browser-only session reads but required for
 * migration / repository writes.
 */
export function validateSupabaseConfig(input?: {
  readonly requireServiceRole?: boolean;
}): SupabaseConfigResult {
  const { url, anonKey } = readSupabasePublicEnv();
  if (!url || !anonKey) {
    return {
      ok: false,
      reason:
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.',
    };
  }
  if (anonKey.length < 20) {
    return {
      ok: false,
      reason: 'NEXT_PUBLIC_SUPABASE_ANON_KEY appears invalid (too short).',
    };
  }
  const serviceRoleKey = readSupabaseServiceRoleKey();
  if (input?.requireServiceRole && serviceRoleKey.length < 20) {
    return {
      ok: false,
      reason: 'SUPABASE_SERVICE_ROLE_KEY is required for this operation.',
    };
  }
  // Never allow service role to be confused with public key in NEXT_PUBLIC_
  if (
    trim(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) ||
    trim(process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY)
  ) {
    return {
      ok: false,
      reason:
        'Service-role key must never be exposed via NEXT_PUBLIC_* variables.',
    };
  }

  return {
    ok: true,
    config: {
      url,
      anonKey,
      serviceRoleKey: serviceRoleKey || undefined,
      projectRef: extractSupabaseProjectRef(url),
      isProductionTarget: isSupabaseProductionTarget(url),
    },
  };
}

/**
 * Startup / gate helper — fail closed in production when supabase auth is
 * selected but misconfigured.
 */
export function assertMediaSupabaseReadyForProduction(): void {
  const provider = resolveMediaAuthProvider();
  if (provider !== 'supabase') return;
  const env =
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production';
  if (!env) return;
  const result = validateSupabaseConfig({ requireServiceRole: false });
  if (!result.ok) {
    throw new Error(`Media Supabase Auth misconfigured: ${result.reason}`);
  }
}

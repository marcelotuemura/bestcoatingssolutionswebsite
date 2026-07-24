import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  validateSupabaseConfig,
  type SupabaseEnvConfig,
} from '@/lib/media-intelligence/supabase/config';

let serviceClient: SupabaseClient | null = null;

/** Browser / cookie-bound server client — anon key only. */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const validated = validateSupabaseConfig();
  if (!validated.ok) {
    throw new Error(validated.reason);
  }
  const cookieStore = await cookies();
  return createServerClient(validated.config.url, validated.config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — middleware will refresh sessions.
        }
      },
    },
  });
}

/**
 * Service-role client — server-only. Never import from client components.
 * Bypasses RLS; use only for migration and privileged admin tasks.
 */
export function createSupabaseServiceClient(
  config?: SupabaseEnvConfig,
): SupabaseClient {
  const validated = config
    ? { ok: true as const, config }
    : validateSupabaseConfig({ requireServiceRole: true });
  if (!validated.ok) {
    throw new Error(validated.reason);
  }
  const key = validated.config.serviceRoleKey;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required.');
  }
  if (!serviceClient) {
    serviceClient = createClient(validated.config.url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}

/** Test helper */
export function __resetSupabaseServiceClientForTests(): void {
  serviceClient = null;
}

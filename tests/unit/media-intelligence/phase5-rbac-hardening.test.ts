import { describe, expect, it } from 'vitest';
import {
  EDITOR_METADATA_FIELDS,
  EDITOR_PROTECTED_FIELDS,
  PHASE5_RPC_CATALOG,
} from '@/lib/media-intelligence/supabase/rpcs';
import { ROLE_PERMISSIONS } from '@/lib/media-intelligence/auth/roles';
import { sanitizeAuditMetadata } from '@/lib/media-intelligence/audit/audit';

describe('Phase 5 RBAC hardening contracts', () => {
  it('editor RPC allowlist excludes protected storage/identity fields', () => {
    for (const field of EDITOR_PROTECTED_FIELDS) {
      expect(EDITOR_METADATA_FIELDS as readonly string[]).not.toContain(field);
    }
    expect(EDITOR_METADATA_FIELDS).toContain('manufacturer');
    expect(EDITOR_METADATA_FIELDS).toContain('keywords');
    expect(EDITOR_METADATA_FIELDS).toContain('notes');
  });

  it('reviewer role cannot manage users, storage, or roles', () => {
    expect(ROLE_PERMISSIONS.reviewer).not.toContain('manage_users');
    expect(ROLE_PERMISSIONS.reviewer).not.toContain('manage_roles');
    expect(ROLE_PERMISSIONS.reviewer).not.toContain('manage_storage_config');
    expect(ROLE_PERMISSIONS.reviewer).toContain('review_ai');
    expect(ROLE_PERMISSIONS.reviewer).toContain('review_privacy');
    expect(ROLE_PERMISSIONS.reviewer).toContain('review_duplicates');
  });

  it('editor cannot manage roles or storage config', () => {
    expect(ROLE_PERMISSIONS.editor).not.toContain('manage_roles');
    expect(ROLE_PERMISSIONS.editor).not.toContain('manage_storage_config');
    expect(ROLE_PERMISSIONS.editor).toContain('edit_metadata');
  });

  it('administrator cannot manage roles (owner-only)', () => {
    expect(ROLE_PERMISSIONS.administrator).not.toContain('manage_roles');
    expect(ROLE_PERMISSIONS.owner).toContain('manage_roles');
  });

  it('RPC catalog documents narrow reviewer and profile operations', () => {
    const names = PHASE5_RPC_CATALOG.map((r) => r.name);
    expect(names).toContain('media_editor_update_asset_metadata');
    expect(names).toContain('media_review_resolve_privacy_flag');
    expect(names).toContain('media_review_ai_suggestion');
    expect(names).toContain('media_review_duplicate_decision');
    expect(names).toContain('media_update_own_display_name');
    expect(names).toContain('media_revoke_role');

    const profile = PHASE5_RPC_CATALOG.find(
      (r) => r.name === 'media_update_own_display_name',
    );
    expect(profile?.fields).toEqual(['display_name']);
    expect(profile?.never).toContain('email');
    expect(profile?.never).toContain('is_active');
  });

  it('audit redaction still strips tokens and keys', () => {
    const clean = sanitizeAuditMetadata({
      password: 'x',
      signedUrl: 'https://x?token=abc',
      service_role: 'k',
      assetId: 'a',
    });
    expect(clean.password).toBe('[redacted]');
    expect(clean.service_role).toBe('[redacted]');
    expect(String(clean.signedUrl)).toMatch(/redacted/);
    expect(clean.assetId).toBe('a');
  });
});

describe('Phase 5 SQL hardening migration presence', () => {
  it('ships RBAC hardening migration with required RPCs', async () => {
    const { readFile } = await import('node:fs/promises');
    const sql = await readFile(
      'supabase/migrations/20260724190003_media_phase5_rbac_hardening.sql',
      'utf8',
    );
    expect(sql).toMatch(/media_editor_update_asset_metadata/);
    expect(sql).toMatch(/media_review_resolve_privacy_flag/);
    expect(sql).toMatch(/media_review_ai_suggestion/);
    expect(sql).toMatch(/media_review_duplicate_decision/);
    expect(sql).toMatch(/media_update_own_display_name/);
    expect(sql).toMatch(/cannot remove the final active owner/);
    expect(sql).toMatch(/media_protect_final_owner/);
    expect(sql).toMatch(/set search_path = public/);
    expect(sql).toMatch(/revoke all on function/i);
    expect(sql).toMatch(/drop policy if exists media_assets_editor_update/);
    expect(sql).not.toMatch(/create policy media_assets_editor_update\b/);
  });

  it('local RBAC SQL suite covers role boundaries and final owner', async () => {
    const { readFile } = await import('node:fs/promises');
    const sql = await readFile('supabase/tests/phase5_rbac_local.sql', 'utf8');
    expect(sql).toMatch(/editor_rpc_ok_protected_denied/);
    expect(sql).toMatch(/reviewer_narrow_rpcs_only/);
    expect(sql).toMatch(/admin_cannot_assign_owner/);
    expect(sql).toMatch(/final_owner_protection/);
    expect(sql).toMatch(/profile_display_name_only/);
  });

  it('base RLS migration no longer grants editor direct asset update', async () => {
    const { readFile } = await import('node:fs/promises');
    const sql = await readFile(
      'supabase/migrations/20260724190001_media_phase5_rls.sql',
      'utf8',
    );
    expect(sql).toMatch(/drop policy if exists media_assets_editor_update/);
    expect(sql).not.toMatch(/create policy media_assets_editor_update\b/);
    // AI write policy must not include reviewer
    const aiWriteBlock = sql.match(
      /create policy media_ai_write[\s\S]*?;/,
    )?.[0];
    expect(aiWriteBlock).toBeTruthy();
    expect(aiWriteBlock).not.toMatch(/reviewer/);
  });
});

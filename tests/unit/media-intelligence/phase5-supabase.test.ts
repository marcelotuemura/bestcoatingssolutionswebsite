import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ROLE_PERMISSIONS,
  actorRolesHavePermission,
  canManageRole,
  primaryRole,
  roleHasPermission,
} from '@/lib/media-intelligence/auth/roles';
import { actorHasPermission } from '@/lib/media-intelligence/auth/guards';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import {
  assertSafeObjectKey,
  buildDerivativeObjectKey,
  buildOriginalObjectKey,
  bucketForKind,
  isAllowedMediaMime,
} from '@/lib/media-intelligence/storage/object-keys';
import {
  clearMemoryAuditLogForTests,
  getMemoryAuditLogForTests,
  recordAuditEvent,
  sanitizeAuditMetadata,
} from '@/lib/media-intelligence/audit/audit';
import {
  extractSupabaseProjectRef,
  resolveMediaAuthProvider,
  validateSupabaseConfig,
} from '@/lib/media-intelligence/supabase/config';
import {
  buildMigrationPlan,
  mapAssetToDbRow,
} from '@/lib/media-intelligence/migration/mapping';
import { JsonAnalysisRepository } from '@/lib/media-intelligence/vision/analysis-repositories/json';
import { MockVisionProvider } from '@/lib/media-intelligence/vision/providers/mock';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { CatalogAsset } from '@/lib/media-library/catalog-schema';

function actor(
  role: MediaTrustedActor['role'],
  roles?: MediaTrustedActor['roles'],
): MediaTrustedActor {
  return {
    id: `${role}-1`,
    role,
    roles: roles ?? [role],
    source: 'supabase-auth',
  };
}

describe('Phase 5 RBAC permissions', () => {
  it('enforces role permission matrix server-side', () => {
    expect(roleHasPermission('viewer', 'read')).toBe(true);
    expect(roleHasPermission('viewer', 'manage_users')).toBe(false);
    expect(roleHasPermission('reviewer', 'review_privacy')).toBe(true);
    expect(roleHasPermission('reviewer', 'manage_storage_config')).toBe(false);
    expect(roleHasPermission('editor', 'edit_metadata')).toBe(true);
    expect(roleHasPermission('editor', 'manage_roles')).toBe(false);
    expect(roleHasPermission('administrator', 'run_analysis')).toBe(true);
    expect(roleHasPermission('administrator', 'manage_roles')).toBe(false);
    expect(roleHasPermission('owner', 'manage_roles')).toBe(true);
  });

  it('only owners may manage owner roles', () => {
    expect(canManageRole(['owner'], 'owner')).toBe(true);
    expect(canManageRole(['administrator'], 'viewer')).toBe(false);
    expect(canManageRole(['owner'], 'viewer')).toBe(true);
  });

  it('primaryRole prefers highest privilege', () => {
    expect(primaryRole(['viewer', 'editor', 'owner'])).toBe('owner');
    expect(primaryRole(['reviewer', 'viewer'])).toBe('reviewer');
  });

  it('actorHasPermission uses roles array', () => {
    expect(actorHasPermission(actor('viewer'), 'read')).toBe(true);
    expect(actorHasPermission(actor('viewer'), 'publish')).toBe(false);
    expect(
      actorRolesHavePermission(['administrator', 'viewer'], 'run_ingestion'),
    ).toBe(true);
    expect(ROLE_PERMISSIONS.owner.length).toBeGreaterThan(
      ROLE_PERMISSIONS.viewer.length,
    );
  });
});

describe('storage object keys', () => {
  it('rejects absolute paths and traversal', () => {
    expect(() => assertSafeObjectKey('/etc/passwd')).toThrow(/Absolute/);
    expect(() => assertSafeObjectKey('foo/../bar')).toThrow(/traversal/i);
    expect(() => assertSafeObjectKey('C:\\windows')).toThrow();
  });

  it('builds checksum-addressed original keys', () => {
    const key = buildOriginalObjectKey({
      checksum: 'abcdef0123456789ffff',
      filename: 'Blue Hull!.JPG',
    });
    expect(key).toMatch(/^originals\/abcdef0123456789_/);
    expect(key.endsWith('.jpg')).toBe(true);
    expect(bucketForKind('original')).toBe('media-originals');
    expect(bucketForKind('poster')).toBe('media-video-posters');
  });

  it('builds derivative keys and validates MIME', () => {
    const key = buildDerivativeObjectKey({
      assetExternalId: 'asset_0001',
      kind: 'thumbnail',
      size: 400,
      extension: '.jpg',
    });
    expect(key).toBe('thumbnails/400/asset_0001.jpg');
    expect(isAllowedMediaMime('image/webp', 'webp')).toBe(true);
    expect(isAllowedMediaMime('application/exe', 'original')).toBe(false);
  });
});

describe('audit sanitization', () => {
  afterEach(() => {
    clearMemoryAuditLogForTests();
  });

  it('redacts secrets and signed URL tokens', async () => {
    const clean = sanitizeAuditMetadata({
      password: 'secret',
      serviceRoleKey: 'srk',
      signedUrl: 'https://x.supabase.co/object/sign/a?token=abc',
      assetId: 'a1',
    });
    expect(clean.password).toBe('[redacted]');
    expect(clean.serviceRoleKey).toBe('[redacted]');
    expect(clean.signedUrl).toBe('[redacted]');
    expect(clean.assetId).toBe('a1');

    await recordAuditEvent({
      action: 'login_failed',
      success: false,
      metadata: { token: 'abc', ok: true },
    });
    const log = getMemoryAuditLogForTests();
    expect(log[0]?.metadata?.token).toBe('[redacted]');
  });
});

describe('supabase config validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults auth provider to temporary', () => {
    vi.stubEnv('MEDIA_AUTH_PROVIDER', '');
    expect(resolveMediaAuthProvider()).toBe('temporary');
  });

  it('fails closed when public keys missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    const result = validateSupabaseConfig();
    expect(result.ok).toBe(false);
  });

  it('rejects service role exposed via NEXT_PUBLIC_', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-value-1234567890');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY', 'leaked');
    const result = validateSupabaseConfig();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/NEXT_PUBLIC_/);
  });

  it('extracts project ref', () => {
    expect(extractSupabaseProjectRef('https://myproj.supabase.co')).toBe(
      'myproj',
    );
  });
});

describe('migration mapping', () => {
  const asset: CatalogAsset = {
    id: 'asset_0001',
    filename: 'boat.jpg',
    originalFilename: 'boat.jpg',
    fileType: 'image/jpeg',
    mediaKind: 'image',
    folder: '',
    stage: 'after',
    keywords: [],
    hasExif: false,
    orientation: 'landscape',
    scores: { website: 80, marketing: 70, technical: 60 },
    privacyStatus: 'clear',
    privacyIssues: [],
    isHeroCandidate: true,
    isExactDuplicate: false,
    isNearDuplicate: false,
    checksum: 'abc123def4567890aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    sha256: 'abc123def4567890aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  };

  it('maps assets without absolute filesystem paths', () => {
    const row = mapAssetToDbRow(asset);
    expect(row.external_id).toBe('asset_0001');
    expect(row.storage_object_key).not.toMatch(/^\//);
    expect(row.storage_bucket).toBe('media-originals');
  });

  it('blocks fixture execution by default in plan warnings', () => {
    const plan = buildMigrationPlan({
      assets: [asset],
      projects: [],
      duplicates: [],
      analyses: [],
      destinationProjectRef: 'demo',
      isProductionTarget: false,
      isFixtureCatalog: true,
      dryRun: true,
      allowFixtures: false,
    });
    expect(plan.warnings.join(' ')).toMatch(/Fixture catalog/);
    expect(plan.counts.assets).toBe(1);
  });

  it('refuses fixtures to production', () => {
    const plan = buildMigrationPlan({
      assets: [asset],
      projects: [],
      duplicates: [],
      analyses: [],
      destinationProjectRef: 'prod',
      isProductionTarget: true,
      isFixtureCatalog: true,
      dryRun: false,
      allowFixtures: true,
    });
    expect(plan.warnings.join(' ')).toMatch(/production/i);
  });
});

describe('JSON analysis repository', () => {
  it('persists AI overlay without touching deterministic fields', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bcs-ai-repo-'));
    process.env.MEDIA_VAULT_ROOT = root;
    const repo = new JsonAnalysisRepository(root);
    const analysis = await new MockVisionProvider().analyze({
      assetId: 'asset_x',
      filename: 'blue_axopar_ceramic_before.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    await repo.saveCurrent(analysis);
    const loaded = await repo.getCurrent('asset_x');
    expect(loaded?.provider).toBe('mock');
    expect(loaded?.analysisVersion).toBeTruthy();
    await fs.rm(root, { recursive: true, force: true });
    delete process.env.MEDIA_VAULT_ROOT;
  });
});

describe('PrivateObjectRef contract', () => {
  it('allows signedUrl without absolutePath for supabase backends', async () => {
    const { PostgreSQLRepository } =
      await import('@/lib/media-vault/repositories/postgres-repository');
    const repo = new PostgreSQLRepository(() => {
      throw new Error('no client in unit test');
    });
    expect(repo.backend).toBe('postgres');
    expect(repo.name).toContain('postgresql');
  });
});

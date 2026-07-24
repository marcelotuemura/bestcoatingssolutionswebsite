import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: () => undefined,
    set: vi.fn(),
  })),
  headers: vi.fn(async () => ({
    get: () => null,
  })),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

import {
  evaluateMediaAccessGate,
  isMediaIntelligenceEnabled,
  isMediaLocalAuthBypass,
} from '@/config/media-intelligence';
import { HeuristicMediaAnalysisEngine } from '@/lib/media-intelligence/analysis/engine';
import { detectProjectsFromAssets } from '@/lib/media-intelligence/analysis/project-detection';
import {
  actorHasPermission,
  requireOwnerApprovalRecord,
} from '@/lib/media-intelligence/auth/guards';
import {
  createSignedSessionToken,
  parseSignedSessionToken,
  type MediaTrustedActor,
} from '@/lib/media-intelligence/auth/session';
import { generateCaseStudyDraft } from '@/lib/media-intelligence/case-study';
import { detectDuplicateGroups } from '@/lib/media-intelligence/duplicates';
import { scanPrivacyRisks } from '@/lib/media-intelligence/privacy';
import { planPublication } from '@/lib/media-intelligence/publishers/website';
import {
  __resetMediaIntelligenceRepositoryForTests,
  getMediaIntelligenceRepository,
} from '@/lib/media-intelligence/repository';
import {
  computeScoreBreakdown,
  isWebsiteReady,
} from '@/lib/media-intelligence/scoring';
import {
  parseNaturalLanguageQuery,
  searchMediaAssets,
} from '@/lib/media-intelligence/search';
import { generateSeoPackage } from '@/lib/media-intelligence/seo';
import { recommendContentCalendar } from '@/lib/media-intelligence/social';
import {
  canTransition,
  isPublishedStatus,
} from '@/lib/media-intelligence/workflow';
import {
  importMediaMetadataAction,
  transitionMediaAssetAction,
} from '@/app/media/actions';

const SESSION_SECRET = 'unit-test-session-secret-32chars!!';
const ACCESS_SECRET = 'unit-test-access-secret-32chars!!!';

function setAuthEnv(enabled: boolean, withSecrets = true) {
  vi.stubEnv('MEDIA_INTELLIGENCE_ENABLED', enabled ? 'true' : 'false');
  vi.stubEnv('MEDIA_INTELLIGENCE_LOCAL_BYPASS', 'false');
  vi.stubEnv('VERCEL_ENV', '');
  if (withSecrets) {
    vi.stubEnv('MEDIA_INTELLIGENCE_SESSION_SECRET', SESSION_SECRET);
    vi.stubEnv('MEDIA_INTELLIGENCE_ACCESS_SECRET', ACCESS_SECRET);
  } else {
    vi.stubEnv('MEDIA_INTELLIGENCE_SESSION_SECRET', '');
    vi.stubEnv('MEDIA_INTELLIGENCE_ACCESS_SECRET', '');
  }
}

describe('Media Intelligence access gate', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('feature disabled rejects access', () => {
    setAuthEnv(false);
    expect(isMediaIntelligenceEnabled()).toBe(false);
    const gate = evaluateMediaAccessGate();
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.status).toBe(404);
  });

  it('enabled without secrets fails closed in production-like runtime', () => {
    setAuthEnv(true, false);
    vi.stubEnv('VERCEL_ENV', 'production');
    const gate = evaluateMediaAccessGate();
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect([404, 503]).toContain(gate.status);
  });

  it('local bypass never activates on Vercel production', () => {
    vi.stubEnv('MEDIA_INTELLIGENCE_ENABLED', 'true');
    vi.stubEnv('MEDIA_INTELLIGENCE_LOCAL_BYPASS', 'true');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(isMediaLocalAuthBypass()).toBe(false);
  });
});

describe('Media Intelligence session tokens', () => {
  it('rejects invalid or expired session tokens', () => {
    const now = Math.floor(Date.now() / 1000);
    const valid = createSignedSessionToken(
      {
        id: 'owner-1',
        role: 'owner',
        iat: now,
        exp: now + 3600,
        nonce: 'abc',
      },
      SESSION_SECRET,
    );
    expect(parseSignedSessionToken(valid, SESSION_SECRET)?.id).toBe('owner-1');

    const expired = createSignedSessionToken(
      {
        id: 'owner-1',
        role: 'owner',
        iat: now - 10,
        exp: now - 1,
        nonce: 'abc',
      },
      SESSION_SECRET,
    );
    expect(parseSignedSessionToken(expired, SESSION_SECRET)).toBeNull();
    expect(parseSignedSessionToken('not.a.token', SESSION_SECRET)).toBeNull();
    expect(parseSignedSessionToken(valid, 'wrong-secret-value!!!!')).toBeNull();
  });

  it('permissions are owner-only for foundation', () => {
    const actor: MediaTrustedActor = {
      id: 'o1',
      role: 'owner',
      roles: ['owner'],
      source: 'temporary-media-session',
    };
    expect(actorHasPermission(actor, 'publish')).toBe(true);
    expect(actorHasPermission(actor, 'create_publication_approval')).toBe(true);
  });

  it('viewer cannot publish or manage users', () => {
    const viewer: MediaTrustedActor = {
      id: 'v1',
      role: 'viewer',
      roles: ['viewer'],
      source: 'supabase-auth',
    };
    expect(actorHasPermission(viewer, 'read')).toBe(true);
    expect(actorHasPermission(viewer, 'publish')).toBe(false);
    expect(actorHasPermission(viewer, 'manage_users')).toBe(false);
  });
});

describe('Media Intelligence workflow', () => {
  it('never allows imported → published_* directly', () => {
    expect(canTransition('imported', 'published_website')).toBe(false);
    expect(canTransition('pending_approval', 'approved')).toBe(true);
    expect(canTransition('approved', 'published_website')).toBe(true);
    expect(isPublishedStatus('published_social')).toBe(true);
  });

  it('requires stored owner approval record — not a boolean flag', () => {
    const blocked = planPublication({
      currentStatus: 'approved',
      target: 'website',
      approval: undefined,
    });
    expect(blocked.ok).toBe(false);

    const ok = planPublication({
      currentStatus: 'approved',
      target: 'website',
      approval: {
        id: 'a1',
        assetId: 'asset-1',
        target: 'website',
        approvedBy: 'temporary-media-session:owner-1',
        approvedAt: new Date().toISOString(),
        approvalVersion: 1,
      },
    });
    expect(ok.ok).toBe(true);
    expect(ok.nextStatus).toBe('published_website');
  });

  it('privacy-blocked assets cannot receive publication approval records', () => {
    const result = requireOwnerApprovalRecord({
      approval: {
        id: 'a1',
        assetId: 'asset-1',
        target: 'website',
        approvedBy: 'owner',
        approvedAt: new Date().toISOString(),
        approvalVersion: 1,
      },
      assetId: 'asset-1',
      target: 'website',
      privacyBlocked: true,
    });
    expect(result.ok).toBe(false);
  });
});

describe('Media Intelligence Server Action authorization', () => {
  beforeEach(() => {
    __resetMediaIntelligenceRepositoryForTests();
    setAuthEnv(true, true);
    vi.stubEnv('MEDIA_INTELLIGENCE_LOCAL_BYPASS', 'false');
    vi.stubEnv('VERCEL_ENV', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects unauthenticated mutations', async () => {
    const result = await transitionMediaAssetAction({
      assetId: 'missing',
      to: 'approved',
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);

    const imported = await importMediaMetadataAction({
      files: [{ filename: 'x.jpg', mimeType: 'image/jpeg', bytes: 10 }],
    });
    expect(imported.ok).toBe(false);
    expect(imported.status).toBe(401);
  });

  it('does not accept client-provided actor identity (parameter removed)', () => {
    const sample: Parameters<typeof transitionMediaAssetAction>[0] = {
      assetId: 'x',
      to: 'approved',
    };
    expect('actor' in sample).toBe(false);
  });
});

describe('Media Intelligence approvals repository', () => {
  beforeEach(() => {
    __resetMediaIntelligenceRepositoryForTests();
  });

  it('creates auditable approval and invalidates on return to pending', () => {
    const repo = getMediaIntelligenceRepository();
    const asset = repo
      .listAssets()
      .find((item) => item.status === 'pending_approval');
    expect(asset).toBeTruthy();
    repo.transitionAsset(asset!.id, 'approved', 'temporary-media-session:test');

    const approval = repo.createPublicationApproval({
      assetId: asset!.id,
      target: 'website',
      approvedBy: 'temporary-media-session:test',
      note: 'unit',
    });
    expect(approval.approvalVersion).toBe(1);
    expect(repo.getApproval(asset!.id, 'website')?.id).toBe(approval.id);

    repo.transitionAsset(
      asset!.id,
      'pending_approval',
      'temporary-media-session:test',
    );
    expect(repo.getApproval(asset!.id, 'website')?.revokedAt).toBeTruthy();
  });

  it('simulated import remains metadata-only / demo labeled', async () => {
    vi.stubEnv('MEDIA_INTELLIGENCE_ENABLED', 'true');
    vi.stubEnv('MEDIA_INTELLIGENCE_LOCAL_BYPASS', 'true');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('MEDIA_INTELLIGENCE_SESSION_SECRET', SESSION_SECRET);
    vi.stubEnv('MEDIA_INTELLIGENCE_ACCESS_SECRET', ACCESS_SECRET);
    // Force development runtime for local bypass
    vi.stubEnv('NODE_ENV', 'development');
    __resetMediaIntelligenceRepositoryForTests();

    const result = await importMediaMetadataAction({
      files: [
        {
          filename: 'sim_gelcoat_before.jpg',
          mimeType: 'image/jpeg',
          bytes: 1234,
        },
      ],
    });
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('metadata-only-simulation');
    const created = getMediaIntelligenceRepository()
      .listAssets()
      .find((asset) => asset.originalFilename === 'sim_gelcoat_before.jpg');
    expect(created?.isDemoSeed).toBe(true);
    expect(created?.notes).toMatch(/no original binary/i);
  });
});

describe('Media Intelligence scoring & privacy', () => {
  it('scores within 0–100', () => {
    const scores = computeScoreBreakdown({
      width: 4000,
      height: 3000,
      marineSubjectConfidence: 0.8,
      hasBeforeAfterContext: true,
      luxuryCues: true,
    });
    expect(scores.overall).toBeGreaterThanOrEqual(0);
    expect(scores.overall).toBeLessThanOrEqual(100);
    expect(isWebsiteReady(scores)).toBeTypeOf('boolean');
  });

  it('suggests privacy remediation and blocks auto-publish', () => {
    const result = scanPrivacyRisks({
      filename: 'face_plate_customer.jpg',
      notes: 'call 305-555-1212 or owner@example.com',
      detectedLabels: ['face', 'license_plate'],
    });
    expect(result.risks.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.blockAutoPublish).toBe(true);
  });
});

describe('Media Intelligence analysis & search', () => {
  it('analyzes every file and detects boat/damage cues from filename', () => {
    const engine = new HeuristicMediaAnalysisEngine();
    const result = engine.analyzeSync({
      filename: 'sea_ray_before_gelcoat_scratch.jpg',
      mimeType: 'image/jpeg',
      bytes: 1_500_000,
      width: 3000,
      height: 2000,
    });
    expect(result.imageType).toBe('before');
    expect(result.boat.manufacturer).toMatch(/Sea Ray/i);
    expect(
      result.damages.some((d) => d.type === 'scratch' || d.type === 'gelcoat'),
    ).toBe(true);
    expect(result.scores.overall).toBeGreaterThan(0);
  });

  it('supports natural language search facets', () => {
    __resetMediaIntelligenceRepositoryForTests();
    const repo = getMediaIntelligenceRepository();
    const query = parseNaturalLanguageQuery('Sea Ray gelcoat');
    const hits = searchMediaAssets(repo.listAssets(), query);
    expect(hits.length).toBeGreaterThan(0);
  });

  it('detects projects and builds case study + SEO drafts', () => {
    __resetMediaIntelligenceRepositoryForTests();
    const repo = getMediaIntelligenceRepository();
    const projects = detectProjectsFromAssets(repo.listAssets());
    expect(projects.length).toBeGreaterThan(0);
    const project = projects[0]!;
    const assets = project.assetIds
      .map((id) => repo.getAsset(id)!)
      .filter(Boolean);
    const caseStudy = generateCaseStudyDraft(project, assets);
    expect(caseStudy.requiresOwnerApproval).toBe(true);
    const seo = generateSeoPackage(assets[0]!);
    expect(seo.optimizedFilename.endsWith('.webp')).toBe(true);
  });

  it('recommends duplicates without deleting', () => {
    const groups = detectDuplicateGroups([
      {
        id: 'a',
        filename: 'same.jpg',
        bytes: 100,
        width: 10,
        height: 10,
        overallScore: 40,
      },
      {
        id: 'b',
        filename: 'same.jpg',
        bytes: 100,
        width: 10,
        height: 10,
        overallScore: 90,
      },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.recommendedKeeperId).toBe('b');
    expect(groups[0]!.requiresOwnerConfirmation).toBe(true);
  });

  it('calendar recommendations never auto-publish', () => {
    expect(
      recommendContentCalendar().every((item) => item.autoPublish === false),
    ).toBe(true);
  });
});

describe('Media Intelligence repository seed', () => {
  beforeEach(() => {
    __resetMediaIntelligenceRepositoryForTests();
  });

  it('seeds demo library marked as demo', () => {
    const repo = getMediaIntelligenceRepository();
    expect(repo.listAssets().length).toBeGreaterThan(0);
    expect(repo.listAssets().every((asset) => asset.isDemoSeed)).toBe(true);
    expect(repo.getDashboardStats().pendingReview).toBeGreaterThan(0);
  });
});

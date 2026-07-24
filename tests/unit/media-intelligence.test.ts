import { describe, expect, it, beforeEach } from 'vitest';
import { HeuristicMediaAnalysisEngine } from '@/lib/media-intelligence/analysis/engine';
import { detectProjectsFromAssets } from '@/lib/media-intelligence/analysis/project-detection';
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

describe('Media Intelligence workflow', () => {
  it('never allows imported → published_* directly', () => {
    expect(canTransition('imported', 'published_website')).toBe(false);
    expect(canTransition('pending_approval', 'approved')).toBe(true);
    expect(canTransition('approved', 'published_website')).toBe(true);
    expect(isPublishedStatus('published_social')).toBe(true);
  });

  it('blocks publish planner without approval', () => {
    const blocked = planPublication({
      currentStatus: 'approved',
      target: 'website',
      ownerApproved: false,
    });
    expect(blocked.ok).toBe(false);
    const ok = planPublication({
      currentStatus: 'approved',
      target: 'website',
      ownerApproved: true,
    });
    expect(ok.ok).toBe(true);
    expect(ok.nextStatus).toBe('published_website');
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
    expect(
      hits.every(
        (asset) =>
          (asset.manufacturer ?? '').includes('Sea Ray') ||
          asset.repairTypes.includes('gelcoat'),
      ),
    ).toBe(true);
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

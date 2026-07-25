import {
  applyAnalysisToAsset,
  defaultMediaAnalysisEngine,
  HeuristicMediaAnalysisEngine,
} from '@/lib/media-intelligence/analysis/engine';
import { detectProjectsFromAssets } from '@/lib/media-intelligence/analysis/project-detection';
import type {
  AssetWorkflowStatus,
  AuditEvent,
  MediaApproval,
  MediaAsset,
  MediaProject,
  PublishTarget,
} from '@/lib/media-intelligence/schemas';
import { assertTransition } from '@/lib/media-intelligence/workflow';

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function audit(
  actor: string,
  action: string,
  from?: AssetWorkflowStatus,
  to?: AssetWorkflowStatus,
  note?: string,
): AuditEvent {
  return {
    id: createId('audit'),
    at: new Date().toISOString(),
    actor,
    action,
    fromStatus: from,
    toStatus: to,
    note,
  };
}

function approvalKey(assetId: string, target: PublishTarget): string {
  return `${assetId}::${target}`;
}

/** In-memory foundation repository — swap for Postgres later. */
export class MediaIntelligenceRepository {
  private assets = new Map<string, MediaAsset>();
  private projects = new Map<string, MediaProject>();
  private approvals = new Map<string, MediaApproval>();

  listAssets(): readonly MediaAsset[] {
    return [...this.assets.values()].sort((a, b) =>
      b.importedAt.localeCompare(a.importedAt),
    );
  }

  getAsset(id: string): MediaAsset | undefined {
    return this.assets.get(id);
  }

  listProjects(): readonly MediaProject[] {
    return [...this.projects.values()].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  getProject(id: string): MediaProject | undefined {
    return this.projects.get(id);
  }

  getApproval(
    assetId: string,
    target: PublishTarget,
  ): MediaApproval | undefined {
    return this.approvals.get(approvalKey(assetId, target));
  }

  listApprovalsForAsset(assetId: string): readonly MediaApproval[] {
    return [...this.approvals.values()].filter(
      (approval) => approval.assetId === assetId,
    );
  }

  upsertAsset(asset: MediaAsset): MediaAsset {
    this.assets.set(asset.id, asset);
    return asset;
  }

  upsertProject(project: MediaProject): MediaProject {
    this.projects.set(project.id, project);
    return project;
  }

  /**
   * Create a target-specific publication approval.
   * Privacy-blocked assets cannot receive publication approval.
   */
  createPublicationApproval(input: {
    readonly assetId: string;
    readonly target: PublishTarget;
    readonly approvedBy: string;
    readonly note?: string;
  }): MediaApproval {
    const asset = this.assets.get(input.assetId);
    if (!asset) {
      throw new Error(`Unknown asset: ${input.assetId}`);
    }
    if (asset.privacyRisks.length > 0) {
      throw new Error(
        'Privacy-blocked assets cannot receive publication approval.',
      );
    }
    if (asset.status !== 'approved' && asset.status !== 'scheduled') {
      throw new Error(
        'Workflow status must be approved or scheduled before creating a publication approval.',
      );
    }

    const existing = this.getApproval(input.assetId, input.target);
    const approval: MediaApproval = {
      id: createId('approval'),
      assetId: input.assetId,
      target: input.target,
      approvedBy: input.approvedBy,
      approvedAt: new Date().toISOString(),
      approvalVersion: (existing?.approvalVersion ?? 0) + 1,
      note: input.note,
    };
    this.approvals.set(approvalKey(input.assetId, input.target), approval);

    const next: MediaAsset = {
      ...asset,
      audit: [
        ...asset.audit,
        audit(
          input.approvedBy,
          `publication-approval:${input.target}`,
          asset.status,
          asset.status,
          input.note,
        ),
      ],
    };
    this.assets.set(asset.id, next);
    return approval;
  }

  revokePublicationApprovals(
    assetId: string,
    actor: string,
    reason: string,
  ): void {
    for (const approval of this.listApprovalsForAsset(assetId)) {
      if (approval.revokedAt) continue;
      const revoked: MediaApproval = {
        ...approval,
        revokedAt: new Date().toISOString(),
        revokedBy: actor,
        revokeReason: reason,
      };
      this.approvals.set(approvalKey(assetId, approval.target), revoked);
    }
  }

  transitionAsset(
    id: string,
    to: AssetWorkflowStatus,
    actor: string,
    note?: string,
  ): MediaAsset {
    const asset = this.assets.get(id);
    if (!asset) {
      throw new Error(`Unknown asset: ${id}`);
    }
    assertTransition(asset.status, to);

    // Returning to editing / pending invalidates stale publication approvals.
    if (
      to === 'pending_approval' ||
      to === 'analyzed' ||
      to === 'optimized' ||
      to === 'imported' ||
      to === 'rejected'
    ) {
      this.revokePublicationApprovals(
        id,
        actor,
        `Invalidated by transition to ${to}`,
      );
    }

    const next: MediaAsset = {
      ...asset,
      status: to,
      websiteStatus:
        to === 'published_website' ||
        to === 'published_portfolio' ||
        to === 'published_gallery'
          ? 'published'
          : asset.websiteStatus,
      socialStatus:
        to === 'published_social' || to === 'published_google_business'
          ? 'published'
          : asset.socialStatus,
      audit: [
        ...asset.audit,
        audit(actor, 'transition', asset.status, to, note),
      ],
    };
    this.assets.set(id, next);
    return next;
  }

  async importAndAnalyze(input: {
    readonly filename: string;
    readonly mimeType: string;
    readonly bytes: number;
    readonly width?: number;
    readonly height?: number;
    readonly notes?: string;
    readonly isDemoSeed?: boolean;
    readonly hints?: Parameters<
      typeof defaultMediaAnalysisEngine.analyze
    >[0]['hints'];
  }): Promise<MediaAsset> {
    const importedAt = new Date().toISOString();
    const id = createId('asset');
    let asset: MediaAsset = {
      id,
      originalFilename: input.filename,
      originalStorageKey: `originals/${id}/${input.filename}`,
      mimeType: input.mimeType,
      bytes: input.bytes,
      width: input.width,
      height: input.height,
      importedAt,
      repairTypes: [],
      damageTypes: [],
      imageType: 'unknown',
      status: 'imported',
      websiteStatus: 'none',
      socialStatus: 'none',
      keywords: [],
      tags: [],
      privacyRisks: [],
      privacySuggestions: [],
      qcRejectReasons: [],
      derivatives: [],
      audit: [audit('system', 'import', undefined, 'imported')],
      isDemoSeed: Boolean(input.isDemoSeed),
      notes: input.notes,
    };

    const analysis = await defaultMediaAnalysisEngine.analyze({
      filename: input.filename,
      mimeType: input.mimeType,
      bytes: input.bytes,
      width: input.width,
      height: input.height,
      notes: input.notes,
      hints: input.hints,
    });
    asset = applyAnalysisToAsset(asset, analysis);
    asset = {
      ...asset,
      audit: [
        ...asset.audit,
        audit('system', 'analyze', 'imported', 'analyzed'),
      ],
    };
    this.assets.set(asset.id, asset);
    return asset;
  }

  rebuildProjectsFromAssets(): readonly MediaProject[] {
    const detected = detectProjectsFromAssets(this.listAssets());
    this.projects.clear();
    for (const project of detected) {
      this.projects.set(project.id, project);
      for (const assetId of project.assetIds) {
        const asset = this.assets.get(assetId);
        if (asset) {
          this.assets.set(assetId, { ...asset, projectId: project.id });
        }
      }
    }
    return this.listProjects();
  }

  getDashboardStats() {
    const assets = this.listAssets();
    const projects = this.listProjects();
    const sumBytes = assets.reduce((total, asset) => total + asset.bytes, 0);
    return {
      imagesImported: assets.length,
      projects: projects.length,
      approved: assets.filter((a) => a.status === 'approved').length,
      rejected: assets.filter((a) => a.status === 'rejected').length,
      pendingReview: assets.filter((a) => a.status === 'pending_approval')
        .length,
      duplicates: assets.filter((a) => a.duplicateOf || a.nearDuplicateGroupId)
        .length,
      websiteReady: assets.filter(
        (a) => (a.scores?.website ?? 0) >= 70 && a.privacyRisks.length === 0,
      ).length,
      socialReady: assets.filter((a) => (a.scores?.social ?? 0) >= 65).length,
      seoReady: assets.filter((a) => (a.scores?.seo ?? 0) >= 65).length,
      storageBytes: sumBytes,
      recentlyImported: assets.slice(0, 8),
      recentApprovals: assets
        .filter((a) => a.audit.some((event) => event.toStatus === 'approved'))
        .slice(0, 8),
    };
  }
}

const REPO_GLOBAL_KEY = '__bcs_media_intelligence_repository_v1__';

type RepoGlobal = typeof globalThis & {
  [REPO_GLOBAL_KEY]?: MediaIntelligenceRepository;
};

function getSingletonRef(): {
  get(): MediaIntelligenceRepository | undefined;
  set(repo: MediaIntelligenceRepository | null): void;
} {
  const g = globalThis as RepoGlobal;
  return {
    get: () => g[REPO_GLOBAL_KEY],
    set: (repo) => {
      if (repo) g[REPO_GLOBAL_KEY] = repo;
      else delete g[REPO_GLOBAL_KEY];
    },
  };
}

export function getMediaIntelligenceRepository(): MediaIntelligenceRepository {
  const ref = getSingletonRef();
  let singleton = ref.get();
  if (!singleton) {
    singleton = new MediaIntelligenceRepository();
    seedDemoLibrarySync(singleton);
    ref.set(singleton);
  }
  return singleton;
}

/** Demo seed only — clearly marked, never real BCS published work. */
function seedDemoLibrarySync(repo: MediaIntelligenceRepository): void {
  if (repo.listAssets().length > 0) return;

  const samples = [
    {
      filename: 'demo_sea_ray_before_gelcoat_scratch.jpg',
      hints: {
        manufacturer: 'Sea Ray',
        model: 'Sundancer',
        imageType: 'before' as const,
        damageTypes: ['scratch' as const, 'gelcoat' as const],
        repairTypes: ['gelcoat' as const],
        tags: ['demo', 'hull', 'Florida'],
      },
    },
    {
      filename: 'demo_sea_ray_during_fairing.jpg',
      hints: {
        manufacturer: 'Sea Ray',
        model: 'Sundancer',
        imageType: 'during' as const,
        damageTypes: ['gelcoat' as const],
        repairTypes: ['fairing' as const, 'gelcoat' as const],
        tags: ['demo', 'hull'],
      },
    },
    {
      filename: 'demo_sea_ray_after_gelcoat.jpg',
      hints: {
        manufacturer: 'Sea Ray',
        model: 'Sundancer',
        imageType: 'after' as const,
        damageTypes: ['gelcoat' as const],
        repairTypes: ['gelcoat' as const, 'polishing' as const],
        tags: ['demo', 'luxury', 'Florida'],
        luxuryCues: true,
      },
    },
    {
      filename: 'demo_blur_reject_candidate.jpg',
      hints: {
        imageType: 'unknown' as const,
        tags: ['demo', 'blur'],
      },
    },
    {
      filename: 'demo_boston_whaler_console_fiberglass_crack.jpg',
      hints: {
        manufacturer: 'Boston Whaler',
        imageType: 'before' as const,
        damageTypes: ['crack' as const, 'fiberglass' as const],
        repairTypes: ['fiberglass' as const, 'structural' as const],
        tags: ['demo', 'center console', 'insurance'],
      },
    },
  ] as const;

  const engine = new HeuristicMediaAnalysisEngine();

  for (const sample of samples) {
    const id = `asset-seed-${sample.filename.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
    const importedAt = new Date().toISOString();
    let asset: MediaAsset = {
      id,
      originalFilename: sample.filename,
      originalStorageKey: `originals/${id}/${sample.filename}`,
      mimeType: 'image/jpeg',
      bytes: 2_400_000,
      width: 4000,
      height: 3000,
      importedAt,
      repairTypes: [],
      damageTypes: [],
      imageType: 'unknown',
      status: 'imported',
      websiteStatus: 'none',
      socialStatus: 'none',
      keywords: [],
      tags: [],
      privacyRisks: [],
      privacySuggestions: [],
      qcRejectReasons: [],
      derivatives: [],
      audit: [
        {
          id: `audit-${id}-import`,
          at: importedAt,
          actor: 'system',
          action: 'import',
          toStatus: 'imported',
        },
      ],
      isDemoSeed: true,
      notes: 'DEMO SEED — not a real BCS project photo.',
    };

    const analysis = engine.analyzeSync({
      filename: sample.filename,
      mimeType: 'image/jpeg',
      bytes: 2_400_000,
      width: 4000,
      height: 3000,
      notes: 'DEMO SEED — not a real BCS project photo.',
      hints: sample.hints,
    });
    asset = applyAnalysisToAsset(asset, analysis);
    asset = {
      ...asset,
      audit: [
        ...asset.audit,
        {
          id: `audit-${id}-analyze`,
          at: importedAt,
          actor: 'system',
          action: 'analyze',
          fromStatus: 'imported',
          toStatus: 'analyzed',
        },
      ],
    };
    repo.upsertAsset(asset);
  }

  const assets = repo.listAssets();
  for (const asset of assets.slice(0, 3)) {
    if (asset.status === 'analyzed') {
      repo.transitionAsset(
        asset.id,
        'pending_approval',
        'system',
        'demo queue',
      );
    }
  }

  repo.rebuildProjectsFromAssets();
}

export function __resetMediaIntelligenceRepositoryForTests(): void {
  getSingletonRef().set(null);
}

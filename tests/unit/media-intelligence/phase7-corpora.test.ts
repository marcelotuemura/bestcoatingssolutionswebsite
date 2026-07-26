import { beforeEach, describe, expect, it } from 'vitest';
import type { MediaTrustedActor } from '@/lib/media-intelligence/auth/session';
import {
  addCorpusItem,
  approveCorpusVersion,
  assignCorpusSplit,
  canTransitionCorpus,
  canTransitionCorpusVersion,
  confirmCorpusLabel,
  createCorpus,
  createCorpusVersion,
  previewCorpusManifest,
  releaseCorpusVersion,
  resetCorpusStoreForTests,
  reviewCorpusItem,
  submitCorpusVersion,
  suggestCorpusLabel,
  corpusJsonHasSecrets,
  deterministicManifestChecksum,
  PHASE7_CORPUS_RPC_CATALOG,
  actorCanCorpusAction,
} from '@/lib/media-intelligence/corpora';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const owner = {
  id: 'owner-1',
  role: 'owner' as const,
  roles: ['owner'] as const,
  source: 'temporary-media-session' as const,
} satisfies MediaTrustedActor;

const editor = {
  id: 'editor-1',
  role: 'editor' as const,
  roles: ['editor'] as const,
  source: 'temporary-media-session' as const,
} satisfies MediaTrustedActor;

const reviewer = {
  id: 'reviewer-1',
  role: 'reviewer' as const,
  roles: ['reviewer'] as const,
  source: 'temporary-media-session' as const,
} satisfies MediaTrustedActor;

const viewer = {
  id: 'viewer-1',
  role: 'viewer' as const,
  roles: ['viewer'] as const,
  source: 'temporary-media-session' as const,
} satisfies MediaTrustedActor;

const admin = {
  id: 'admin-1',
  role: 'administrator' as const,
  roles: ['administrator'] as const,
  source: 'temporary-media-session' as const,
} satisfies MediaTrustedActor;

describe('Phase 7 corpus governance', () => {
  beforeEach(() => {
    resetCorpusStoreForTests();
  });

  it('enforces role permissions in the app matrix', () => {
    expect(actorCanCorpusAction(viewer, 'draft')).toBe(false);
    expect(actorCanCorpusAction(editor, 'draft')).toBe(true);
    expect(actorCanCorpusAction(editor, 'approve')).toBe(false);
    expect(actorCanCorpusAction(editor, 'release')).toBe(false);
    expect(actorCanCorpusAction(reviewer, 'review')).toBe(true);
    expect(actorCanCorpusAction(reviewer, 'release')).toBe(false);
    expect(actorCanCorpusAction(admin, 'approve')).toBe(true);
    expect(actorCanCorpusAction(admin, 'release')).toBe(false);
    expect(actorCanCorpusAction(owner, 'release')).toBe(true);
  });

  it('validates lifecycle transitions', () => {
    expect(canTransitionCorpus('draft', 'under_review')).toBe(true);
    expect(canTransitionCorpus('approved', 'draft')).toBe(false);
    expect(canTransitionCorpusVersion('building', 'review_ready')).toBe(true);
    expect(canTransitionCorpusVersion('released', 'building')).toBe(false);
    expect(canTransitionCorpusVersion('released', 'superseded')).toBe(true);
  });

  it('keeps AI suggestions separate from human confirmation', async () => {
    const created = await createCorpus({
      actor: editor,
      name: 'Unit corpus',
      description: '',
      intendedUse: 'general_evaluation',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const versions = await createCorpusVersion({
      actor: editor,
      corpusId: created.data.id,
    });
    // Initial version already exists from create; create another for coverage
    const versionId = versions.ok
      ? versions.data.id
      : (
          await import('@/lib/media-intelligence/corpora/store')
        ).memoryListVersions(created.data.id)[0]!.id;

    const item = await addCorpusItem({
      actor: editor,
      versionId,
      assetExternalId: 'asset-seed-1',
    });
    expect(item.ok).toBe(true);
    if (!item.ok) return;

    const ai = await suggestCorpusLabel({
      actor: editor,
      itemId: item.data.id,
      labelKey: 'damage',
      labelValue: 'crack',
    });
    expect(ai.ok && ai.data.source === 'ai_suggested').toBe(true);

    const includeWithoutHuman = await reviewCorpusItem({
      actor: reviewer,
      itemId: item.data.id,
      decision: 'include',
    });
    expect(includeWithoutHuman.ok).toBe(false);

    const human = await confirmCorpusLabel({
      actor: reviewer,
      itemId: item.data.id,
      labelKey: 'damage',
      labelValue: 'crack',
    });
    expect(human.ok && human.data.source === 'human_confirmed').toBe(true);

    const included = await reviewCorpusItem({
      actor: reviewer,
      itemId: item.data.id,
      decision: 'include',
    });
    expect(included.ok).toBe(true);
  });

  it('prevents exact-duplicate split leakage in memory fixture', async () => {
    const created = await createCorpus({
      actor: editor,
      name: 'Dup corpus',
      description: '',
      intendedUse: 'damage_detection',
    });
    if (!created.ok) throw new Error('create failed');
    const { memoryListVersions, memoryAddItem } =
      await import('@/lib/media-intelligence/corpora/store');
    const version = memoryListVersions(created.data.id)[0]!;
    const a = memoryAddItem({
      versionId: version.id,
      assetExternalId: 'dup-a',
      actorId: editor.id,
      isExactDuplicate: true,
      duplicateGroup: 'g1',
    });
    memoryAddItem({
      versionId: version.id,
      assetExternalId: 'dup-b',
      actorId: editor.id,
      isExactDuplicate: true,
      duplicateGroup: 'g1',
    });
    await assignCorpusSplit({
      actor: reviewer,
      itemId: a.id,
      split: 'train',
    });
    const { memoryListItems } =
      await import('@/lib/media-intelligence/corpora/store');
    const b = memoryListItems(version.id).find(
      (i) => i.assetExternalId === 'dup-b',
    )!;
    const conflict = await assignCorpusSplit({
      actor: reviewer,
      itemId: b.id,
      split: 'test',
    });
    expect(conflict.ok).toBe(false);
  });

  it('rejects secrets in manifest payloads and checksums deterministically', () => {
    expect(
      corpusJsonHasSecrets({
        url: 'https://x?X-Amz-Signature=abc',
      }),
    ).toBe(true);
    expect(corpusJsonHasSecrets({ assetExternalId: 'a', checksum: 'c' })).toBe(
      false,
    );
    const body = '{"a":1,"b":2}';
    expect(deterministicManifestChecksum(body)).toBe(
      deterministicManifestChecksum(body),
    );
  });

  it('allows admin approve path and owner-only release in memory', async () => {
    const created = await createCorpus({
      actor: editor,
      name: 'Release corpus',
      description: '',
      intendedUse: 'quality_scoring',
    });
    if (!created.ok) throw new Error('create failed');
    const {
      memoryListVersions,
      memoryAddItem,
      memoryConfirmLabel,
      memorySetItemStatus,
      memoryAssignSplit,
    } = await import('@/lib/media-intelligence/corpora/store');
    const version = memoryListVersions(created.data.id)[0]!;
    const item = memoryAddItem({
      versionId: version.id,
      assetExternalId: 'asset-ok',
      actorId: editor.id,
    });
    memoryConfirmLabel({
      itemId: item.id,
      labelKey: 'k',
      labelValue: 'v',
      actorId: reviewer.id,
    });
    memorySetItemStatus(item.id, 'included');
    memoryAssignSplit(item.id, 'holdout');

    const submitted = await submitCorpusVersion({
      actor: admin,
      versionId: version.id,
    });
    expect(submitted.ok).toBe(true);
    const approved = await approveCorpusVersion({
      actor: admin,
      versionId: version.id,
    });
    expect(approved.ok).toBe(true);
    const editorRelease = await releaseCorpusVersion({
      actor: editor,
      versionId: version.id,
    });
    expect(editorRelease.ok).toBe(false);
    const released = await releaseCorpusVersion({
      actor: owner,
      versionId: version.id,
    });
    expect(released.ok && released.data.status === 'released').toBe(true);

    const preview = await previewCorpusManifest({
      actor: owner,
      versionId: version.id,
    });
    expect(preview.ok).toBe(true);
    if (preview.ok) {
      expect(corpusJsonHasSecrets(preview.data)).toBe(false);
    }
  });

  it('ships phase 7 migrations and rpc catalog', async () => {
    const dir = path.join(process.cwd(), 'supabase/migrations');
    const files = await fs.readdir(dir);
    expect(files).toContain('20260726010000_media_phase7_corpora_schema.sql');
    expect(files).toContain('20260726010001_media_phase7_corpora_rls.sql');
    expect(files).toContain(
      '20260726010002_media_phase7_corpora_authority.sql',
    );
    expect(files).toContain('20260726010003_media_phase7_corpora_rpcs.sql');
    expect(PHASE7_CORPUS_RPC_CATALOG.length).toBeGreaterThanOrEqual(15);
  });
});

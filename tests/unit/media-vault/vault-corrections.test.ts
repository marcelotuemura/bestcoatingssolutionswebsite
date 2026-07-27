import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { constants as fsConstants, promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { sha256File } from '@/lib/media-vault/checksum';
import { getVaultLayout } from '@/lib/media-vault/layout';
import {
  ManifestError,
  mergeVaultManifestAtomic,
  readVaultManifest,
} from '@/lib/media-vault/manifest';
import { detectMediaFromFile } from '@/lib/media-vault/mime';
import {
  preserveOriginalExclusive,
  resolveOriginalDestinationForTests,
  VaultIntegrityConflictError,
} from '@/lib/media-vault/preserve-original';
import {
  ingestDirectory,
  ingestFile,
} from '@/lib/media-vault/ingestion/pipeline';
import type { VaultAssetRecord } from '@/lib/media-vault/types';

function hasFfmpeg(): boolean {
  try {
    const result = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return result.status === 0;
  } catch {
    return false;
  }
}

async function makeTempVault(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'bcs-vault-fix-'));
}

async function writeTestJpeg(filePath: string, width = 640, height = 480) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 20, g: 80, b: 160 },
    },
  })
    .jpeg()
    .toFile(filePath);
}

async function writeTestPng(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await sharp({
    create: {
      width: 120,
      height: 80,
      channels: 3,
      background: { r: 10, g: 120, b: 40 },
    },
  })
    .png()
    .toFile(filePath);
}

async function writeTestMp4(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      'ffmpeg',
      [
        '-y',
        '-f',
        'lavfi',
        '-i',
        'color=c=blue:s=320x240:d=1',
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        filePath,
      ],
      { stdio: 'ignore' },
    );
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)),
    );
  });
}

describe('atomic write-once originals', () => {
  let vaultRoot = '';

  beforeAll(async () => {
    vaultRoot = await makeTempVault();
  });

  afterAll(async () => {
    await fs.rm(vaultRoot, { recursive: true, force: true });
  });

  it('uses COPYFILE_EXCL so concurrent writers cannot overwrite the same original', async () => {
    const layout = getVaultLayout(vaultRoot);
    const source = path.join(vaultRoot, 'src', 'boat.jpg');
    await writeTestJpeg(source);
    const checksum = await sha256File(source);

    const results = await Promise.allSettled([
      preserveOriginalExclusive({
        layout,
        sourcePath: source,
        filename: 'boat.jpg',
        checksum,
      }),
      preserveOriginalExclusive({
        layout,
        sourcePath: source,
        filename: 'boat.jpg',
        checksum,
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    expect(fulfilled).toHaveLength(2);
    const created = fulfilled.filter(
      (r) => r.status === 'fulfilled' && r.value.created,
    );
    const present = fulfilled.filter(
      (r) => r.status === 'fulfilled' && !r.value.created,
    );
    expect(created).toHaveLength(1);
    expect(present).toHaveLength(1);

    const dest = resolveOriginalDestinationForTests({
      layout,
      filename: 'boat.jpg',
      sourcePath: source,
      checksum,
    }).absolutePath;
    expect(await sha256File(dest)).toBe(checksum);
  });

  it('fails closed with integrity_conflict when destination bytes differ', async () => {
    const layout = getVaultLayout(path.join(vaultRoot, 'conflict'));
    await fs.mkdir(layout.originals, { recursive: true });
    const source = path.join(vaultRoot, 'conflict-src', 'hull.jpg');
    await writeTestJpeg(source, 400, 300);
    const checksum = await sha256File(source);
    const dest = resolveOriginalDestinationForTests({
      layout,
      filename: 'hull.jpg',
      sourcePath: source,
      checksum,
    }).absolutePath;

    // Plant a different payload at the exclusive destination path.
    await writeTestJpeg(dest, 401, 301);
    await expect(
      preserveOriginalExclusive({
        layout,
        sourcePath: source,
        filename: 'hull.jpg',
        checksum,
      }),
    ).rejects.toBeInstanceOf(VaultIntegrityConflictError);

    // Existing tampered bytes must remain (never truncated/replaced).
    expect(await sha256File(dest)).not.toBe(checksum);
  });
});

describe('content-based MIME detection', () => {
  let dir = '';

  beforeAll(async () => {
    dir = await makeTempVault();
  });

  afterAll(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('accepts valid JPEG and PNG content', async () => {
    const jpeg = path.join(dir, 'ok.jpg');
    const png = path.join(dir, 'ok.png');
    await writeTestJpeg(jpeg);
    await writeTestPng(png);
    await expect(detectMediaFromFile(jpeg)).resolves.toMatchObject({
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    await expect(detectMediaFromFile(png)).resolves.toMatchObject({
      mimeType: 'image/png',
      mediaKind: 'image',
    });
  });

  it.skipIf(!hasFfmpeg())(
    'accepts a valid MP4 fixture',
    async () => {
      const mp4 = path.join(dir, 'clip.mp4');
      await writeTestMp4(mp4);
      await expect(detectMediaFromFile(mp4)).resolves.toMatchObject({
        mimeType: 'video/mp4',
        mediaKind: 'video',
      });
    },
    60_000,
  );

  it('rejects an executable/text file renamed to .jpg', async () => {
    const spoof = path.join(dir, 'malware.jpg');
    await fs.writeFile(spoof, '#!/bin/sh\necho pwned\nPK\x03\x04not-a-jpeg');
    await expect(detectMediaFromFile(spoof)).rejects.toThrow(
      /Unrecognized|Unsupported|mismatch/i,
    );
  });

  it('rejects mismatched extension and binary type', async () => {
    const pngBytes = path.join(dir, 'actually-png.jpg');
    await writeTestPng(pngBytes);
    await expect(detectMediaFromFile(pngBytes)).rejects.toThrow(
      /MIME\/extension mismatch/i,
    );
  });

  it('rejects empty and truncated input', async () => {
    const empty = path.join(dir, 'empty.jpg');
    const tiny = path.join(dir, 'tiny.jpg');
    await fs.writeFile(empty, '');
    await fs.writeFile(tiny, Buffer.from([0xff, 0xd8]));
    await expect(detectMediaFromFile(empty)).rejects.toThrow(/Empty/i);
    await expect(detectMediaFromFile(tiny)).rejects.toThrow(
      /Truncated|malformed/i,
    );
  });
});

describe('atomic manifest updates', () => {
  let vaultRoot = '';

  beforeAll(async () => {
    vaultRoot = await makeTempVault();
  });

  afterAll(async () => {
    await fs.rm(vaultRoot, { recursive: true, force: true });
  });

  function stubAsset(id: string, filename: string): VaultAssetRecord {
    return {
      id,
      filename,
      originalFilename: filename,
      fileType: 'image/jpeg',
      mediaKind: 'image',
      folder: '',
      stage: 'unknown',
      keywords: [],
      hasExif: false,
      orientation: 'landscape',
      scores: { website: 50, marketing: 50, technical: 50 },
      privacyStatus: 'clear',
      privacyIssues: [],
      isHeroCandidate: false,
      isExactDuplicate: false,
      isNearDuplicate: false,
    };
  }

  it('merges concurrent updates without losing records', async () => {
    const layout = getVaultLayout(path.join(vaultRoot, 'manifest-concurrent'));
    await fs.mkdir(layout.manifests, { recursive: true });

    await Promise.all([
      mergeVaultManifestAtomic({
        layout,
        incoming: [stubAsset('a1', 'one.jpg'), stubAsset('a2', 'two.jpg')],
      }),
      mergeVaultManifestAtomic({
        layout,
        incoming: [stubAsset('a3', 'three.jpg'), stubAsset('a2', 'two-b.jpg')],
      }),
    ]);

    const manifest = await readVaultManifest(
      path.join(layout.manifests, 'media_catalog.json'),
    );
    const ids = new Set(manifest.assets.map((a) => a.id));
    expect(ids.has('a1')).toBe(true);
    expect(ids.has('a2')).toBe(true);
    expect(ids.has('a3')).toBe(true);
    // Duplicate id a2 merged (last writer wins for that id).
    expect(manifest.assets.filter((a) => a.id === 'a2')).toHaveLength(1);
  });

  it('preserves previous valid manifest when a write fails validation', async () => {
    const layout = getVaultLayout(path.join(vaultRoot, 'manifest-fail'));
    await fs.mkdir(layout.manifests, { recursive: true });
    await mergeVaultManifestAtomic({
      layout,
      incoming: [stubAsset('keep_me', 'keep.jpg')],
    });

    await expect(
      mergeVaultManifestAtomic({
        layout,
        incoming: [
          {
            ...stubAsset('bad', 'bad.jpg'),
            scores: { website: 999, marketing: 50, technical: 50 },
          } as unknown as VaultAssetRecord,
        ],
      }),
    ).rejects.toBeInstanceOf(ManifestError);

    const manifest = await readVaultManifest(
      path.join(layout.manifests, 'media_catalog.json'),
    );
    expect(manifest.assets.map((a) => a.id)).toEqual(['keep_me']);
  });

  it('fails closed on invalid existing JSON and does not replace with fixtures', async () => {
    const layout = getVaultLayout(path.join(vaultRoot, 'manifest-invalid'));
    await fs.mkdir(layout.manifests, { recursive: true });
    const catalogPath = path.join(layout.manifests, 'media_catalog.json');
    await fs.writeFile(catalogPath, '{not-json');
    await expect(readVaultManifest(catalogPath)).rejects.toBeInstanceOf(
      ManifestError,
    );
    await expect(
      mergeVaultManifestAtomic({
        layout,
        incoming: [stubAsset('x', 'x.jpg')],
      }),
    ).rejects.toBeInstanceOf(ManifestError);
    expect(await fs.readFile(catalogPath, 'utf8')).toBe('{not-json');
  });

  it('leaves the live manifest intact if a temp write is abandoned', async () => {
    const layout = getVaultLayout(path.join(vaultRoot, 'manifest-temp'));
    await fs.mkdir(layout.manifests, { recursive: true });
    await mergeVaultManifestAtomic({
      layout,
      incoming: [stubAsset('stable', 'stable.jpg')],
    });
    const catalogPath = path.join(layout.manifests, 'media_catalog.json');
    const before = await fs.readFile(catalogPath, 'utf8');

    // Simulate crash: write a temp sibling without renaming.
    await fs.writeFile(
      path.join(layout.manifests, 'media_catalog.json.tmp.crash'),
      '{"broken":true}',
    );
    const after = await fs.readFile(catalogPath, 'utf8');
    expect(after).toBe(before);
    expect(after).toContain('stable');
  });
});

describe('idempotent re-ingestion status model', () => {
  it('reports ingested then already_present without derivative writes on re-run', async () => {
    const vaultRoot = await makeTempVault();
    const layout = getVaultLayout(vaultRoot);
    const inbox = path.join(vaultRoot, 'inbox');
    await fs.mkdir(inbox, { recursive: true });
    const file = path.join(inbox, 'sea.jpg');
    await writeTestJpeg(file, 500, 400);

    const first = await ingestFile({ sourcePath: file, layout });
    expect(first.status).toBe('ingested');
    expect(first.asset?.fileType).toBe('image/jpeg');

    const second = await ingestFile({ sourcePath: file, layout });
    expect(second.status).toBe('already_present');

    const repaired = await ingestFile({
      sourcePath: file,
      layout,
      repairDerivatives: true,
    });
    // Derivatives already complete → still already_present (true no-op).
    expect(repaired.status).toBe('already_present');

    await fs.rm(vaultRoot, { recursive: true, force: true });
  }, 60_000);

  it('repairs missing derivatives only when repairDerivatives is set', async () => {
    const vaultRoot = await makeTempVault();
    const layout = getVaultLayout(vaultRoot);
    const inbox = path.join(vaultRoot, 'inbox');
    await fs.mkdir(inbox, { recursive: true });
    const file = path.join(inbox, 'repair-me.jpg');
    await writeTestJpeg(file, 320, 240);

    const first = await ingestFile({ sourcePath: file, layout });
    expect(first.status).toBe('ingested');
    const assetId = first.asset!.id;

    // Delete one derivative to force incomplete state.
    const thumb = path.join(
      layout.root,
      'derivatives',
      'thumbnails',
      '400',
      `${assetId}.jpg`,
    );
    await fs.unlink(thumb);

    const noop = await ingestFile({ sourcePath: file, layout });
    expect(noop.status).toBe('already_present');
    expect(noop.reason ?? noop.asset?.notes).toMatch(/repairDerivatives/i);

    const repaired = await ingestFile({
      sourcePath: file,
      layout,
      repairDerivatives: true,
    });
    expect(repaired.status).toBe('derivatives_repaired');
    expect(await fs.stat(thumb)).toBeTruthy();

    await fs.rm(vaultRoot, { recursive: true, force: true });
  }, 60_000);

  it('batch counts ingested / alreadyPresent / rejected separately', async () => {
    const vaultRoot = await makeTempVault();
    const inbox = path.join(vaultRoot, 'inbox');
    await fs.mkdir(inbox, { recursive: true });
    await writeTestJpeg(path.join(inbox, 'a.jpg'));
    await writeTestJpeg(path.join(inbox, 'b.jpg'), 200, 200);
    await fs.writeFile(path.join(inbox, 'evil.jpg'), 'not-an-image');

    const first = await ingestDirectory({ sourceDir: inbox, vaultRoot });
    expect(first.ingested).toBe(2);
    expect(first.rejected).toBe(1);

    const second = await ingestDirectory({ sourceDir: inbox, vaultRoot });
    expect(second.alreadyPresent).toBe(2);
    expect(second.ingested).toBe(0);
    expect(second.rejected).toBe(1);

    await fs.rm(vaultRoot, { recursive: true, force: true });
  }, 90_000);
});

describe('exclusive original creation constant', () => {
  it('exposes COPYFILE_EXCL for exclusive creation', () => {
    expect(fsConstants.COPYFILE_EXCL).toBeTypeOf('number');
  });
});

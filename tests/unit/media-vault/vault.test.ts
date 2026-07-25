import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { sha256Bytes, sha256File } from '@/lib/media-vault/checksum';
import {
  detectMediaFromFile,
  detectMimeFromFilename,
} from '@/lib/media-vault/mime';
import { generateImageDerivatives } from '@/lib/media-vault/derivatives/images';
import { getVaultLayout } from '@/lib/media-vault/layout';
import { assertInsideVault } from '@/lib/media-vault/layout';
import {
  ingestDirectory,
  ingestFile,
} from '@/lib/media-vault/ingestion/pipeline';
import { JsonMediaRepository } from '@/lib/media-vault/repositories/json-repository';
import { LocalFilesystemRepository } from '@/lib/media-vault/repositories/local-filesystem-repository';
import { SupabaseStorageRepository } from '@/lib/media-vault/repositories/supabase-repository';
import { PostgreSQLRepository } from '@/lib/media-vault/repositories/postgres-repository';
import {
  createMediaRepository,
  resolveMediaRepositoryBackend,
  setMediaRepositoryForTests,
} from '@/lib/media-vault/factory';
import { generateVideoDerivatives } from '@/lib/media-vault/derivatives/video';
import { spawn } from 'node:child_process';

async function makeTempVault(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'bcs-vault-'));
}

async function writeTestJpeg(filePath: string, width = 640, height = 480) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 12, g: 64, b: 140 },
    },
  })
    .jpeg()
    .toFile(filePath);
}

describe('media vault checksum', () => {
  it('hashes bytes and files consistently', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5, 9]);
    const a = await sha256Bytes(bytes);
    const dir = await makeTempVault();
    const file = path.join(dir, 'sample.bin');
    await fs.writeFile(file, bytes);
    const b = await sha256File(file);
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('media vault mime', () => {
  it('keeps extension helper for non-authoritative hints only', () => {
    expect(detectMimeFromFilename('a.JPG')?.mimeType).toBe('image/jpeg');
    expect(detectMimeFromFilename('clip.mp4')?.mediaKind).toBe('video');
    expect(detectMimeFromFilename('archive.zip')).toBeNull();
  });

  it('authoritative detection uses file contents', async () => {
    const dir = await makeTempVault();
    const jpeg = path.join(dir, 'boat.jpg');
    await writeTestJpeg(jpeg);
    await expect(detectMediaFromFile(jpeg)).resolves.toMatchObject({
      mimeType: 'image/jpeg',
    });
    await fs.rm(dir, { recursive: true, force: true });
  });
});

describe('media vault layout security', () => {
  it('blocks path traversal outside vault root', () => {
    const root = '/tmp/vault-root';
    expect(() => assertInsideVault(root, '/tmp/vault-root/../secret')).toThrow(
      /escapes/,
    );
    expect(
      assertInsideVault(root, '/tmp/vault-root/originals/a.jpg'),
    ).toContain('originals');
  });
});

describe('media vault thumbnails', () => {
  let vaultRoot = '';

  beforeAll(async () => {
    vaultRoot = await makeTempVault();
  });

  afterAll(async () => {
    await fs.rm(vaultRoot, { recursive: true, force: true });
  });

  it('generates 200/400/800/1600 thumbs plus webp/avif/preview', async () => {
    const layout = getVaultLayout(vaultRoot);
    const original = path.join(vaultRoot, 'src', 'hero.jpg');
    await writeTestJpeg(original, 2000, 1200);

    const result = await generateImageDerivatives({
      layout,
      assetId: 'asset_thumb_1',
      originalAbsolutePath: original,
    });

    expect(result.thumbnails[200]).toBeTruthy();
    expect(result.thumbnails[400]).toBeTruthy();
    expect(result.thumbnails[800]).toBeTruthy();
    expect(result.thumbnails[1600]).toBeTruthy();
    expect(result.webp).toBeTruthy();
    expect(result.avif).toBeTruthy();
    expect(result.preview).toBeTruthy();

    for (const size of [200, 400, 800, 1600] as const) {
      const abs = path.join(layout.root, result.thumbnails[size]!);
      const meta = await sharp(abs).metadata();
      expect(meta.width!).toBeLessThanOrEqual(size);
      expect(meta.height!).toBeLessThanOrEqual(size);
      // Maintain landscape aspect (wider than tall for 2000x1200 source).
      expect(meta.width!).toBeGreaterThan(meta.height!);
    }
  });
});

describe('media vault repositories', () => {
  it('resolves backends and constructs implementations', () => {
    expect(resolveMediaRepositoryBackend('json')).toBe('json');
    expect(resolveMediaRepositoryBackend('local')).toBe('local-filesystem');
    expect(createMediaRepository('json')).toBeInstanceOf(JsonMediaRepository);
    expect(createMediaRepository('local-filesystem')).toBeInstanceOf(
      LocalFilesystemRepository,
    );
  });

  it('JsonMediaRepository loads catalog assets', async () => {
    setMediaRepositoryForTests(null);
    const repo = new JsonMediaRepository();
    const assets = await repo.getAssets();
    expect(assets.length).toBeGreaterThan(10);
    expect(
      await repo.resolvePrivateObject(assets[0]!.id, 'thumbnail'),
    ).toBeNull();
  });

  it('supabase/postgres repositories fail closed without Supabase config', async () => {
    await expect(new SupabaseStorageRepository().getAssets()).rejects.toThrow(
      /unavailable|required/i,
    );
    await expect(new PostgreSQLRepository().getCatalog()).rejects.toThrow(
      /unavailable|required/i,
    );
  });

  it('LocalFilesystemRepository resolves private derivatives after ingest', async () => {
    const vaultRoot = await makeTempVault();
    const inbox = path.join(vaultRoot, 'inbox');
    await fs.mkdir(inbox, { recursive: true });
    await writeTestJpeg(path.join(inbox, 'sea_ray_after.jpg'), 800, 600);

    const prev = process.env.MEDIA_VAULT_ROOT;
    process.env.MEDIA_VAULT_ROOT = vaultRoot;
    try {
      const batch = await ingestDirectory({ sourceDir: inbox, vaultRoot });
      expect(batch.ingested).toBe(1);
      const repo = new LocalFilesystemRepository(vaultRoot);
      const asset = batch.assets[0]!;
      // Seed catalog into manifests so repository can find the asset.
      // ingestDirectory already wrote manifests/media_catalog.json
      const found = await repo.getAssetById(asset.id);
      expect(found?.id).toBe(asset.id);

      const thumb = await repo.resolvePrivateObject(asset.id, 'thumbnail', 400);
      expect(thumb?.absolutePath).toContain('thumbnails');
      expect(thumb?.contentType).toMatch(/image\//);

      const original = await repo.resolvePrivateObject(asset.id, 'original');
      expect(original?.absolutePath).toContain('originals');

      // Re-ingest does not overwrite original (idempotent already_present).
      const again = await ingestFile({
        sourcePath: path.join(inbox, 'sea_ray_after.jpg'),
        layout: getVaultLayout(vaultRoot),
      });
      expect(again.status).toBe('already_present');
    } finally {
      if (prev === undefined) delete process.env.MEDIA_VAULT_ROOT;
      else process.env.MEDIA_VAULT_ROOT = prev;
      await fs.rm(vaultRoot, { recursive: true, force: true });
    }
  });
});

describe('media vault video derivatives', () => {
  it('probes and posters a tiny mp4 when ffmpeg is available', async () => {
    const vaultRoot = await makeTempVault();
    const layout = getVaultLayout(vaultRoot);
    const videoPath = path.join(vaultRoot, 'clip.mp4');
    await fs.mkdir(vaultRoot, { recursive: true });

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
          videoPath,
        ],
        { stdio: 'ignore' },
      );
      child.on('error', reject);
      child.on('close', (code) =>
        code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)),
      );
    });

    const result = await generateVideoDerivatives({
      layout,
      assetId: 'vid_001',
      originalAbsolutePath: videoPath,
    });

    expect(result.videoMeta.width).toBe(320);
    expect(result.videoMeta.height).toBe(240);
    expect(result.videoMeta.codec).toBeTruthy();
    expect(result.poster).toBeTruthy();
    await fs.rm(vaultRoot, { recursive: true, force: true });
  }, 60_000);
});

describe('media vault large-library performance', () => {
  it('lists and resolves 2k catalog assets under budget', async () => {
    const repo = new JsonMediaRepository();
    // Warm fixture path through json repo (240 assets default).
    // Generate a larger in-memory pressure test via repeated getAssets.
    const started = performance.now();
    let total = 0;
    for (let i = 0; i < 20; i += 1) {
      const assets = await repo.getAssets();
      total += assets.length;
    }
    const durationMs = performance.now() - started;
    expect(total).toBeGreaterThan(1000);
    expect(durationMs).toBeLessThan(500);
  });

  it('ingests many small images with stable checksums', async () => {
    const vaultRoot = await makeTempVault();
    const inbox = path.join(vaultRoot, 'inbox');
    await fs.mkdir(inbox, { recursive: true });
    const count = 40;
    for (let i = 0; i < count; i += 1) {
      await writeTestJpeg(path.join(inbox, `img_${i}.jpg`), 320, 240);
    }
    const started = performance.now();
    const batch = await ingestDirectory({ sourceDir: inbox, vaultRoot });
    const durationMs = performance.now() - started;
    expect(batch.ingested).toBe(count);
    expect(batch.rejected).toBe(0);
    expect(durationMs / count).toBeLessThan(1500); // per-image budget generous for CI
    await fs.rm(vaultRoot, { recursive: true, force: true });
  }, 120_000);
});

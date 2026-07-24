import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { mediaCatalogSchema } from '@/lib/media-library/catalog-schema';
import type { VaultAssetRecord } from '@/lib/media-vault/types';
import type { VaultLayout } from '@/lib/media-vault/layout';

const LOCK_STALE_MS = 120_000;
const LOCK_RETRY_MS = 25;
const LOCK_TIMEOUT_MS = 30_000;

export class ManifestError extends Error {
  readonly code: 'invalid_manifest' | 'lock_timeout' | 'validation_failed';

  constructor(code: ManifestError['code'], message: string) {
    super(message);
    this.name = 'ManifestError';
    this.code = code;
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireManifestLock(
  lockPath: string,
): Promise<{ readonly release: () => Promise<void> }> {
  const started = Date.now();
  await fs.mkdir(path.dirname(lockPath), { recursive: true });

  while (Date.now() - started < LOCK_TIMEOUT_MS) {
    try {
      const handle = await fs.open(lockPath, 'wx');
      await handle.writeFile(
        JSON.stringify({
          pid: process.pid,
          at: new Date().toISOString(),
        }),
      );
      await handle.sync();
      await handle.close();
      return {
        release: async () => {
          try {
            await fs.unlink(lockPath);
          } catch {
            // ignore
          }
        },
      };
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: string }).code)
          : '';
      if (code !== 'EEXIST') throw error;

      // Stale lock recovery: if lock is old, remove and retry.
      try {
        const stat = await fs.stat(lockPath);
        if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
          await fs.unlink(lockPath);
          continue;
        }
      } catch {
        // raced with unlock — retry
      }
      await sleep(LOCK_RETRY_MS);
    }
  }

  throw new ManifestError(
    'lock_timeout',
    `Timed out acquiring vault ingestion lock at ${lockPath}`,
  );
}

async function cleanupAbandonedTempFiles(manifestsDir: string): Promise<void> {
  const entries = await fs.readdir(manifestsDir).catch(() => [] as string[]);
  for (const name of entries) {
    if (!name.startsWith('media_catalog.json.tmp.')) continue;
    const full = path.join(manifestsDir, name);
    try {
      const stat = await fs.stat(full);
      // Only remove temps older than 5 minutes to avoid racing a live writer.
      if (Date.now() - stat.mtimeMs > 5 * 60_000) {
        await fs.unlink(full);
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Read + validate existing vault catalog manifest.
 * Missing file → empty catalog. Invalid JSON/schema → fail closed (no fixtures).
 */
export async function readVaultManifest(catalogPath: string): Promise<{
  readonly assets: VaultAssetRecord[];
  readonly generatedAt?: string;
  readonly version?: string;
  readonly source?: string;
  readonly existed: boolean;
}> {
  let raw: string;
  try {
    raw = await fs.readFile(catalogPath, 'utf8');
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: string }).code)
        : '';
    if (code === 'ENOENT') {
      return { assets: [], existed: false };
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new ManifestError(
      'invalid_manifest',
      `Existing vault manifest is not valid JSON: ${catalogPath}`,
    );
  }

  const validated = mediaCatalogSchema.safeParse(parsed);
  if (!validated.success) {
    throw new ManifestError(
      'invalid_manifest',
      `Existing vault manifest failed schema validation: ${validated.error.message}`,
    );
  }

  return {
    assets: validated.data.assets as VaultAssetRecord[],
    generatedAt: validated.data.generatedAt,
    version: validated.data.version,
    source: validated.data.source,
    existed: true,
  };
}

/**
 * Crash-safe atomic manifest merge:
 * lock → read/validate → merge by asset id → temp write → fsync → rename.
 */
export async function mergeVaultManifestAtomic(input: {
  readonly layout: VaultLayout;
  readonly incoming: readonly VaultAssetRecord[];
}): Promise<{
  readonly totalAssets: number;
  readonly catalogPath: string;
}> {
  const catalogPath = path.join(input.layout.manifests, 'media_catalog.json');
  const lockPath = path.join(input.layout.manifests, 'ingestion.lock');
  await fs.mkdir(input.layout.manifests, { recursive: true });
  await cleanupAbandonedTempFiles(input.layout.manifests);

  const lock = await acquireManifestLock(lockPath);
  try {
    const existing = await readVaultManifest(catalogPath);
    const byId = new Map<string, VaultAssetRecord>();
    for (const asset of existing.assets) {
      byId.set(asset.id, asset);
    }
    for (const asset of input.incoming) {
      byId.set(asset.id, asset);
    }

    const merged = {
      generatedAt: new Date().toISOString(),
      version: '1.0',
      source: 'media-vault-ingestion',
      isFixture: false,
      assets: [...byId.values()],
    };

    const validated = mediaCatalogSchema.safeParse(merged);
    if (!validated.success) {
      throw new ManifestError(
        'validation_failed',
        `Merged vault manifest failed schema validation: ${validated.error.message}`,
      );
    }

    const tempName = `media_catalog.json.tmp.${process.pid}.${randomBytes(6).toString('hex')}`;
    const tempPath = path.join(input.layout.manifests, tempName);
    const payload = `${JSON.stringify(validated.data, null, 2)}\n`;

    const handle = await fs.open(tempPath, 'wx');
    try {
      await handle.writeFile(payload, 'utf8');
      await handle.sync();
    } finally {
      await handle.close();
    }

    await fs.rename(tempPath, catalogPath);
    return { totalAssets: validated.data.assets.length, catalogPath };
  } finally {
    await lock.release();
  }
}

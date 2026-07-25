import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  aiAnalysisStoreSchema,
  type AiAnalysisStore,
  type AssetVisionAnalysis,
} from '@/lib/media-intelligence/vision/schema';
import { getVaultLayout, resolveVaultRoot } from '@/lib/media-vault/layout';

const LOCK_STALE_MS = 120_000;
const LOCK_RETRY_MS = 25;
const LOCK_TIMEOUT_MS = 30_000;

export class AiAnalysisStoreError extends Error {
  readonly code: 'invalid_store' | 'lock_timeout' | 'validation_failed';

  constructor(code: AiAnalysisStoreError['code'], message: string) {
    super(message);
    this.name = 'AiAnalysisStoreError';
    this.code = code;
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveAnalysisPaths(root?: string): {
  readonly dir: string;
  readonly storePath: string;
  readonly lockPath: string;
} {
  const catalogDir = process.env.MEDIA_CATALOG_DIR?.trim();
  if (catalogDir) {
    const dir = path.isAbsolute(catalogDir)
      ? catalogDir
      : path.join(process.cwd(), catalogDir);
    return {
      dir,
      storePath: path.join(dir, 'ai_analysis.json'),
      lockPath: path.join(dir, 'ai_analysis.lock'),
    };
  }
  const layout = getVaultLayout(root ?? resolveVaultRoot());
  return {
    dir: layout.manifests,
    storePath: path.join(layout.manifests, 'ai_analysis.json'),
    lockPath: path.join(layout.manifests, 'ai_analysis.lock'),
  };
}

async function acquireLock(
  lockPath: string,
): Promise<{ readonly release: () => Promise<void> }> {
  const started = Date.now();
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  while (Date.now() - started < LOCK_TIMEOUT_MS) {
    try {
      const handle = await fs.open(lockPath, 'wx');
      await handle.writeFile(
        JSON.stringify({ pid: process.pid, at: new Date().toISOString() }),
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
      try {
        const stat = await fs.stat(lockPath);
        if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
          await fs.unlink(lockPath);
          continue;
        }
      } catch {
        // retry
      }
      await sleep(LOCK_RETRY_MS);
    }
  }
  throw new AiAnalysisStoreError(
    'lock_timeout',
    `Timed out acquiring AI analysis lock at ${lockPath}`,
  );
}

export async function readAiAnalysisStore(
  root?: string,
): Promise<AiAnalysisStore> {
  const { storePath } = resolveAnalysisPaths(root);
  let raw: string;
  try {
    raw = await fs.readFile(storePath, 'utf8');
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: string }).code)
        : '';
    if (code === 'ENOENT') {
      return {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        analyses: [],
      };
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new AiAnalysisStoreError(
      'invalid_store',
      `AI analysis store is not valid JSON: ${storePath}`,
    );
  }

  const validated = aiAnalysisStoreSchema.safeParse(parsed);
  if (!validated.success) {
    throw new AiAnalysisStoreError(
      'invalid_store',
      `AI analysis store failed schema validation: ${validated.error.message}`,
    );
  }
  return validated.data;
}

/**
 * Crash-safe merge of AI analysis records by assetId.
 * Never touches originals or the deterministic media_catalog.json.
 */
export async function mergeAiAnalysisStore(input: {
  readonly incoming: readonly AssetVisionAnalysis[];
  readonly root?: string;
  readonly provider?: AiAnalysisStore['provider'];
}): Promise<{ readonly total: number; readonly storePath: string }> {
  const paths = resolveAnalysisPaths(input.root);
  await fs.mkdir(paths.dir, { recursive: true });
  const lock = await acquireLock(paths.lockPath);
  try {
    const existing = await readAiAnalysisStore(input.root);
    const byId = new Map<string, AssetVisionAnalysis>();
    for (const row of existing.analyses) {
      byId.set(row.assetId, row);
    }
    for (const row of input.incoming) {
      byId.set(row.assetId, row);
    }

    const merged: AiAnalysisStore = {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      provider: input.provider ?? existing.provider,
      source: 'media-vision-analysis',
      analyses: [...byId.values()],
    };

    const validated = aiAnalysisStoreSchema.safeParse(merged);
    if (!validated.success) {
      throw new AiAnalysisStoreError(
        'validation_failed',
        `Merged AI analysis store failed schema validation: ${validated.error.message}`,
      );
    }

    const tempName = `ai_analysis.json.tmp.${process.pid}.${randomBytes(6).toString('hex')}`;
    const tempPath = path.join(paths.dir, tempName);
    const payload = `${JSON.stringify(validated.data, null, 2)}\n`;
    const handle = await fs.open(tempPath, 'wx');
    try {
      await handle.writeFile(payload, 'utf8');
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fs.rename(tempPath, paths.storePath);
    return {
      total: validated.data.analyses.length,
      storePath: paths.storePath,
    };
  } finally {
    await lock.release();
  }
}

export function getAnalysisByAssetId(
  store: AiAnalysisStore,
  assetId: string,
): AssetVisionAnalysis | undefined {
  return store.analyses.find((a) => a.assetId === assetId);
}

export function indexAnalysesByAssetId(
  store: AiAnalysisStore,
): Map<string, AssetVisionAnalysis> {
  return new Map(store.analyses.map((a) => [a.assetId, a]));
}

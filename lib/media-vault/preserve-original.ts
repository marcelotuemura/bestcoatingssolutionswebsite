import { constants as fsConstants, promises as fs } from 'node:fs';
import path from 'node:path';
import { sha256File } from '@/lib/media-vault/checksum';
import type { VaultLayout } from '@/lib/media-vault/layout';

export class VaultIntegrityConflictError extends Error {
  readonly code = 'integrity_conflict' as const;
  readonly absolutePath: string;
  readonly expectedChecksum: string;
  readonly actualChecksum: string;

  constructor(input: {
    readonly absolutePath: string;
    readonly expectedChecksum: string;
    readonly actualChecksum: string;
  }) {
    super(
      `Vault integrity conflict at ${input.absolutePath}: existing original checksum ${input.actualChecksum} does not match source ${input.expectedChecksum}`,
    );
    this.name = 'VaultIntegrityConflictError';
    this.absolutePath = input.absolutePath;
    this.expectedChecksum = input.expectedChecksum;
    this.actualChecksum = input.actualChecksum;
  }
}

export type PreserveOriginalResult = {
  readonly relativePath: string;
  readonly absolutePath: string;
  /** True only when this call exclusively created the original. */
  readonly created: boolean;
};

function originalDestinationPaths(input: {
  readonly layout: VaultLayout;
  readonly filename: string;
  readonly sourcePath: string;
  readonly checksum: string;
}): { readonly absolutePath: string; readonly relativePath: string } {
  const ext = path.extname(input.filename) || path.extname(input.sourcePath);
  const safeName =
    `${input.checksum.slice(0, 16)}_${path.basename(input.filename, ext)}${ext}`
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .slice(0, 180);
  const absolutePath = path.join(input.layout.originals, safeName);
  const relativePath = path.join('originals', safeName);
  return { absolutePath, relativePath };
}

async function hardenReadOnly(absolutePath: string): Promise<void> {
  try {
    await fs.chmod(absolutePath, 0o444);
  } catch {
    // Best-effort on platforms that disallow chmod.
  }
}

/**
 * Write-once original preservation using filesystem-enforced exclusive copy.
 *
 * Uses COPYFILE_EXCL — never relies on a pre-existence check (avoids TOCTOU).
 * On EEXIST: verify SHA-256; accept matching files; fail closed on mismatch.
 * Never truncates or replaces an existing original.
 */
export async function preserveOriginalExclusive(input: {
  readonly layout: VaultLayout;
  readonly sourcePath: string;
  readonly filename: string;
  readonly checksum: string;
}): Promise<PreserveOriginalResult> {
  await fs.mkdir(input.layout.originals, { recursive: true });
  const { absolutePath, relativePath } = originalDestinationPaths(input);

  try {
    await fs.copyFile(
      input.sourcePath,
      absolutePath,
      fsConstants.COPYFILE_EXCL,
    );
    await hardenReadOnly(absolutePath);
    return { relativePath, absolutePath, created: true };
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: string }).code)
        : '';
    if (code !== 'EEXIST') {
      throw error;
    }

    const existingChecksum = await sha256File(absolutePath);
    if (existingChecksum !== input.checksum) {
      throw new VaultIntegrityConflictError({
        absolutePath,
        expectedChecksum: input.checksum,
        actualChecksum: existingChecksum,
      });
    }

    return { relativePath, absolutePath, created: false };
  }
}

/** Test helper — destination path algorithm used by preserveOriginalExclusive. */
export function resolveOriginalDestinationForTests(input: {
  readonly layout: VaultLayout;
  readonly filename: string;
  readonly sourcePath: string;
  readonly checksum: string;
}): { readonly absolutePath: string; readonly relativePath: string } {
  return originalDestinationPaths(input);
}

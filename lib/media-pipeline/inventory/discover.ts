/**
 * Recursive discovery of image files under data/pictures.
 * Never modifies files.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  INVENTORY_IMAGE_EXTENSIONS,
  SUPPORTED_IMAGE_EXTENSIONS,
  SUPPORTED_MIME_BY_EXT,
} from '@/lib/media-pipeline/constants';

export type DiscoveredMediaFile = {
  readonly absolutePath: string;
  /** Posix-relative path from repo root, e.g. data/pictures/formula/... */
  readonly archivePath: string;
  readonly projectSlug: string;
  readonly sourceAlbum: string;
  readonly originalFilename: string;
  readonly extension: string;
  readonly supported: boolean;
  readonly mimeType: string | null;
};

function normalizeExt(name: string): string {
  return path.extname(name).toLowerCase();
}

function isInventoryExt(ext: string): boolean {
  return (INVENTORY_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
}

function isSupportedExt(ext: string): boolean {
  return (SUPPORTED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Project slug = first directory under archive root.
 * sourceAlbum = relative folder inside the project (or project slug).
 */
export function projectSlugFromArchivePath(
  archivePath: string,
  archiveRoot: string,
): { readonly projectSlug: string; readonly sourceAlbum: string } {
  const normalized = archivePath.replace(/\\/g, '/');
  const root = archiveRoot.replace(/\\/g, '/').replace(/\/$/, '');
  const rel = normalized.startsWith(`${root}/`)
    ? normalized.slice(root.length + 1)
    : normalized;
  const parts = rel.split('/').filter(Boolean);
  const projectSlug = parts[0] ?? 'unknown';
  const dirParts = parts.slice(0, -1);
  const sourceAlbum =
    dirParts.length > 1 ? dirParts.join('/') : (dirParts[0] ?? projectSlug);
  return { projectSlug, sourceAlbum };
}

async function* walkFiles(root: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return;
    throw err;
  }
  // Deterministic order
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

export async function discoverMediaFiles(options: {
  readonly archiveRootAbsolute: string;
  readonly archiveRootRelative: string;
  readonly repoRoot: string;
}): Promise<readonly DiscoveredMediaFile[]> {
  const results: DiscoveredMediaFile[] = [];
  for await (const absolutePath of walkFiles(options.archiveRootAbsolute)) {
    const originalFilename = path.basename(absolutePath);
    const extension = normalizeExt(originalFilename);
    if (!extension || !isInventoryExt(extension)) continue;
    const supported = isSupportedExt(extension);
    const archivePath = path
      .relative(options.repoRoot, absolutePath)
      .split(path.sep)
      .join('/');
    const { projectSlug, sourceAlbum } = projectSlugFromArchivePath(
      archivePath,
      options.archiveRootRelative,
    );
    results.push({
      absolutePath,
      archivePath,
      projectSlug,
      sourceAlbum,
      originalFilename,
      extension,
      supported,
      mimeType: SUPPORTED_MIME_BY_EXT[extension] ?? null,
    });
  }
  // Stable sort by archive path
  results.sort((a, b) => a.archivePath.localeCompare(b.archivePath));
  return results;
}

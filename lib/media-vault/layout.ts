import path from 'node:path';

/**
 * Canonical local vault layout.
 *
 * MEDIA_VAULT_ROOT/
 *   originals/                 # write-once; never overwrite/delete via vault APIs
 *   derivatives/
 *     thumbnails/{200,400,800,1600}/
 *     webp/
 *     avif/
 *     previews/
 *     posters/
 *   manifests/
 *     media_catalog.json       # optional vault-local catalog mirror
 *     ingestion_log.jsonl
 *   inbox/                     # optional drop folder for new files
 *   reports/                   # optional 08_Reports sync point
 */

export type VaultLayout = {
  readonly root: string;
  readonly originals: string;
  readonly derivatives: string;
  readonly thumbnails: string;
  readonly webp: string;
  readonly avif: string;
  readonly previews: string;
  readonly posters: string;
  readonly manifests: string;
  readonly inbox: string;
  readonly reports: string;
};

export function resolveVaultRoot(
  configured = process.env.MEDIA_VAULT_ROOT?.trim(),
): string {
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), 'data', 'media-vault');
}

export function getVaultLayout(root = resolveVaultRoot()): VaultLayout {
  const derivatives = path.join(root, 'derivatives');
  return {
    root,
    originals: path.join(root, 'originals'),
    derivatives,
    thumbnails: path.join(derivatives, 'thumbnails'),
    webp: path.join(derivatives, 'webp'),
    avif: path.join(derivatives, 'avif'),
    previews: path.join(derivatives, 'previews'),
    posters: path.join(derivatives, 'posters'),
    manifests: path.join(root, 'manifests'),
    inbox: path.join(root, 'inbox'),
    reports: path.join(root, 'reports'),
  };
}

export function thumbnailDir(
  layout: VaultLayout,
  size: 200 | 400 | 800 | 1600,
): string {
  return path.join(layout.thumbnails, String(size));
}

/** Ensure relative vault paths cannot escape the vault root. */
export function assertInsideVault(
  vaultRoot: string,
  absolutePath: string,
): string {
  const root = path.resolve(vaultRoot);
  const resolved = path.resolve(absolutePath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error('Path escapes media vault root');
  }
  return resolved;
}

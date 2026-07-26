/**
 * In-memory gallery store — **unit tests only**.
 *
 * Runtime app path must use PostgreSQL. Enable with MEDIA_GALLERY_REPOSITORY=memory
 * (forbidden in production).
 */

import { randomUUID } from 'node:crypto';
import type {
  GalleryAsset,
  GalleryCollection,
  GalleryEvent,
  GalleryListParams,
  GalleryListResult,
  GalleryMetadataInput,
} from '@/lib/media-intelligence/gallery/types';

type GalleryStoreState = {
  assets: Map<string, GalleryAsset>;
  collections: Map<string, GalleryCollection>;
  collectionAssets: Map<string, Set<string>>;
  favorites: Map<string, Set<string>>;
  events: GalleryEvent[];
};

const GLOBAL_KEY = '__bcs_media_gallery_store_v1__';

function globalStore(): typeof globalThis & {
  [GLOBAL_KEY]?: GalleryStoreState;
} {
  return globalThis as typeof globalThis & { [GLOBAL_KEY]?: GalleryStoreState };
}

function getStore(): GalleryStoreState {
  const g = globalStore();
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      assets: new Map(),
      collections: new Map(),
      collectionAssets: new Map(),
      favorites: new Map(),
      events: [],
    };
  }
  return g[GLOBAL_KEY]!;
}

export function resetGalleryStoreForTests(): void {
  const g = globalStore();
  g[GLOBAL_KEY] = {
    assets: new Map(),
    collections: new Map(),
    collectionAssets: new Map(),
    favorites: new Map(),
    events: [],
  };
}

export function memoryRegisterAsset(asset: GalleryAsset): GalleryAsset {
  const store = getStore();
  store.assets.set(asset.externalId, asset);
  return asset;
}

export function memoryGetAsset(externalId: string): GalleryAsset | undefined {
  return getStore().assets.get(externalId);
}

export function memoryListAssets(
  params: GalleryListParams,
  actorId?: string,
): GalleryListResult {
  const store = getStore();
  const start = Date.now();
  let assets = [...store.assets.values()].filter(
    (a) => a.workspaceId === params.workspaceId,
  );

  if (!params.archived) {
    assets = assets.filter((a) => a.archivedAt == null);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    assets = assets.filter(
      (a) =>
        a.displayTitle?.toLowerCase().includes(q) ||
        a.originalFilename.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (params.kind) {
    assets = assets.filter((a) => a.mediaKind === params.kind);
  }
  if (params.privacy) {
    assets = assets.filter((a) => a.privacyStatus === params.privacy);
  }
  if (params.reviewStatus) {
    assets = assets.filter((a) => a.reviewStatus === params.reviewStatus);
  }
  if (params.onlyFavorites && actorId) {
    const favSet = store.favorites.get(actorId) ?? new Set<string>();
    assets = assets.filter((a) => favSet.has(a.externalId));
  }
  if (params.collectionId) {
    const colAssets =
      store.collectionAssets.get(params.collectionId) ?? new Set<string>();
    assets = assets.filter((a) => colAssets.has(a.externalId));
  }

  // Apply sort
  const sorted = [...assets];
  switch (params.sort) {
    case 'created_asc':
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      break;
    case 'updated_desc':
      sorted.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      break;
    case 'title_asc':
      sorted.sort((a, b) =>
        (a.displayTitle ?? a.originalFilename).localeCompare(
          b.displayTitle ?? b.originalFilename,
        ),
      );
      break;
    case 'size_desc':
      sorted.sort((a, b) => b.fileSizeBytes - a.fileSizeBytes);
      break;
    case 'capture_date_desc':
      sorted.sort(
        (a, b) =>
          new Date(b.captureDate ?? b.createdAt).getTime() -
          new Date(a.captureDate ?? a.createdAt).getTime(),
      );
      break;
    default:
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  const total = sorted.length;
  const pageSize = params.pageSize;
  const page = params.page;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const sliced = sorted.slice((page - 1) * pageSize, page * pageSize);

  const favSet = actorId
    ? (store.favorites.get(actorId) ?? new Set<string>())
    : new Set<string>();

  const withFavorites = sliced.map((a) => ({
    ...a,
    isFavorite: favSet.has(a.externalId),
  }));

  return {
    assets: withFavorites,
    total,
    page,
    pageCount,
    durationMs: Date.now() - start,
  };
}

export function memoryUpdateAssetMetadata(
  externalId: string,
  input: GalleryMetadataInput,
  workspaceId: string,
): GalleryAsset {
  const store = getStore();
  const existing = store.assets.get(externalId);
  if (!existing) {
    throw new Error(`Asset not found: ${externalId}`);
  }
  if (existing.workspaceId !== workspaceId) {
    throw new Error('Asset not in workspace');
  }
  const updated: GalleryAsset = {
    ...existing,
    displayTitle: input.displayTitle ?? existing.displayTitle,
    description: input.description ?? existing.description,
    tags: input.tags ?? existing.tags,
    location: input.location ?? existing.location,
    creatorName: input.creatorName ?? existing.creatorName,
    captureDate: input.captureDate ?? existing.captureDate,
    customerNotes: input.customerNotes ?? existing.customerNotes,
    updatedAt: new Date().toISOString(),
  };
  store.assets.set(externalId, updated);
  return updated;
}

export function memorySetFavorite(
  actorId: string,
  assetExternalId: string,
  workspaceId: string,
  favorite: boolean,
): void {
  const store = getStore();
  const asset = store.assets.get(assetExternalId);
  if (!asset || asset.workspaceId !== workspaceId) {
    throw new Error('Asset not found in workspace');
  }
  if (!store.favorites.has(actorId)) {
    store.favorites.set(actorId, new Set());
  }
  const favSet = store.favorites.get(actorId)!;
  if (favorite) {
    favSet.add(assetExternalId);
  } else {
    favSet.delete(assetExternalId);
  }
  store.events.push({
    id: randomUUID(),
    workspaceId,
    actorId,
    action: favorite ? 'favorite_added' : 'favorite_removed',
    assetExternalId,
    metadata: {},
    createdAt: new Date().toISOString(),
  });
}

export function memoryCreateCollection(
  workspaceId: string,
  name: string,
  description: string,
  actorId: string,
): GalleryCollection {
  const store = getStore();
  const id = randomUUID();
  const externalId = `col_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const col: GalleryCollection = {
    id,
    externalId,
    workspaceId,
    name: name.trim(),
    description: description ?? '',
    createdBy: actorId,
    updatedBy: actorId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assetCount: 0,
  };
  store.collections.set(id, col);
  store.collectionAssets.set(id, new Set());
  return col;
}

export function memoryListCollections(
  workspaceId: string,
): GalleryCollection[] {
  const store = getStore();
  return [...store.collections.values()]
    .filter((c) => c.workspaceId === workspaceId && c.archivedAt == null)
    .map((c) => ({
      ...c,
      assetCount: store.collectionAssets.get(c.id)?.size ?? 0,
    }));
}

export function memoryGetCollection(id: string): GalleryCollection | undefined {
  const store = getStore();
  const col = store.collections.get(id);
  if (!col) return undefined;
  return {
    ...col,
    assetCount: store.collectionAssets.get(id)?.size ?? 0,
  };
}

export function memoryCollectionSetAssets(
  collectionId: string,
  assetExternalIds: string[],
  mode: 'add' | 'remove',
  workspaceId: string,
): number {
  const store = getStore();
  const col = store.collections.get(collectionId);
  if (!col || col.workspaceId !== workspaceId) {
    throw new Error('Collection not found');
  }
  const colAssets =
    store.collectionAssets.get(collectionId) ?? new Set<string>();
  let changed = 0;
  for (const id of assetExternalIds) {
    const asset = store.assets.get(id);
    if (!asset || asset.workspaceId !== workspaceId) {
      throw new Error(`Asset ${id} not found in workspace`);
    }
    if (mode === 'add') {
      if (!colAssets.has(id)) {
        colAssets.add(id);
        changed++;
      }
    } else {
      if (colAssets.has(id)) {
        colAssets.delete(id);
        changed++;
      }
    }
  }
  store.collectionAssets.set(collectionId, colAssets);
  return changed;
}

export function memoryArchiveAssets(
  externalIds: string[],
  workspaceId: string,
): number {
  const store = getStore();
  let n = 0;
  for (const id of externalIds) {
    const asset = store.assets.get(id);
    if (
      asset &&
      asset.workspaceId === workspaceId &&
      asset.archivedAt == null
    ) {
      store.assets.set(id, {
        ...asset,
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      n++;
    }
  }
  return n;
}

export function memoryListEvents(
  workspaceId: string,
  limit = 50,
): GalleryEvent[] {
  const store = getStore();
  return store.events
    .filter((e) => e.workspaceId === workspaceId)
    .slice(-limit)
    .reverse();
}

export function memoryGetFavorites(
  actorId: string,
  workspaceId: string,
): string[] {
  const store = getStore();
  const favSet = store.favorites.get(actorId) ?? new Set<string>();
  return [...favSet].filter((id) => {
    const asset = store.assets.get(id);
    return asset?.workspaceId === workspaceId;
  });
}

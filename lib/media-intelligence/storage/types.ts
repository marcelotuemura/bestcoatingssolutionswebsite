/**
 * Storage seams — originals are write-once and never publicly exposed.
 */

export type StorageLayer = 'original' | 'derivative';

export interface StoredObjectRef {
  readonly key: string;
  readonly layer: StorageLayer;
  readonly bytes: number;
  readonly contentType: string;
  readonly createdAt: string;
}

export interface MediaStorageAdapter {
  readonly name: string;
  putOriginal(input: {
    readonly filename: string;
    readonly bytes: Uint8Array;
    readonly contentType: string;
  }): Promise<StoredObjectRef>;
  putDerivative(input: {
    readonly originalKey: string;
    readonly kind: string;
    readonly bytes: Uint8Array;
    readonly contentType: string;
  }): Promise<StoredObjectRef>;
  /** Originals must never be publicly URL-accessible. */
  getPrivateReadUrl(key: string): Promise<string | null>;
}

/**
 * Local development vault. Keys only — binaries stay out of git.
 * Future: Supabase Storage implementation of MediaStorageAdapter.
 */
export class LocalVaultStorageAdapter implements MediaStorageAdapter {
  readonly name = 'local-vault';
  private readonly objects = new Map<string, StoredObjectRef>();

  async putOriginal(input: {
    readonly filename: string;
    readonly bytes: Uint8Array;
    readonly contentType: string;
  }): Promise<StoredObjectRef> {
    const key = `originals/${Date.now()}-${sanitize(input.filename)}`;
    const ref: StoredObjectRef = {
      key,
      layer: 'original',
      bytes: input.bytes.byteLength,
      contentType: input.contentType,
      createdAt: new Date().toISOString(),
    };
    this.objects.set(key, ref);
    return ref;
  }

  async putDerivative(input: {
    readonly originalKey: string;
    readonly kind: string;
    readonly bytes: Uint8Array;
    readonly contentType: string;
  }): Promise<StoredObjectRef> {
    const key = `derivatives/${input.originalKey}/${input.kind}-${Date.now()}`;
    const ref: StoredObjectRef = {
      key,
      layer: 'derivative',
      bytes: input.bytes.byteLength,
      contentType: input.contentType,
      createdAt: new Date().toISOString(),
    };
    this.objects.set(key, ref);
    return ref;
  }

  async getPrivateReadUrl(key: string): Promise<string | null> {
    if (!this.objects.has(key)) return null;
    // Intentionally not a public URL — signed URL seam for future providers.
    return `media-vault://private/${key}`;
  }
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
}

export const defaultMediaStorage = new LocalVaultStorageAdapter();

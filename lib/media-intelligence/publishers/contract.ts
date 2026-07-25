import type { MediaAsset } from '@/lib/media-intelligence/schemas';
import type {
  Phase6PublishTarget,
  PublicationPayload,
  ProviderDeliveryStatus,
} from '@/lib/media-intelligence/publishers/types';

export type AdapterNormalizeResult =
  | {
      readonly ok: true;
      readonly payload: PublicationPayload;
      readonly destinationRef?: string;
      readonly providerDeliveryStatus: ProviderDeliveryStatus;
      readonly providerMetadata: Record<string, unknown>;
    }
  | { readonly ok: false; readonly error: string };

export type AdapterExecuteResult =
  | {
      readonly ok: true;
      /** Only true when a real provider acknowledges delivery. */
      readonly externallyDelivered: boolean;
      readonly providerDeliveryStatus: ProviderDeliveryStatus;
      readonly providerMetadata: Record<string, unknown>;
      readonly message: string;
    }
  | { readonly ok: false; readonly error: string };

export type PublisherAdapter = {
  readonly target: Phase6PublishTarget;
  readonly displayName: string;
  normalize(input: {
    readonly asset: MediaAsset;
    readonly payload: PublicationPayload;
  }): AdapterNormalizeResult;
  /**
   * Draft-only adapters never set externallyDelivered=true.
   * Real provider adapters may only claim delivery with verifiable proof.
   */
  execute(input: {
    readonly asset: MediaAsset;
    readonly payload: PublicationPayload;
    readonly jobId: string;
  }): Promise<AdapterExecuteResult> | AdapterExecuteResult;
};

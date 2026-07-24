import { AssetCard } from '@/components/media-intelligence/AssetCard';
import { MediaShell } from '@/components/media-intelligence/MediaShell';
import { getMediaIntelligenceRepository } from '@/lib/media-intelligence/repository';

export default function MediaApprovalsPage() {
  const pending = getMediaIntelligenceRepository()
    .listAssets()
    .filter((asset) => asset.status === 'pending_approval');

  return (
    <MediaShell
      title="Owner Approval"
      subtitle="Nothing publishes automatically. Approve, reject, archive, hide, schedule, or send back for edits."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {pending.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
      {pending.length === 0 ? (
        <p className="text-silver-500 text-sm">Approval queue is clear.</p>
      ) : null}
    </MediaShell>
  );
}

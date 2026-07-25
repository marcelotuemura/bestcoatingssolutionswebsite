import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CatalogPreviewModal } from '@/components/media-library/CatalogPreviewModal';
import { generateFixtureCatalog } from '@/lib/media-library';

describe('catalog preview modal accessibility', () => {
  it('supports escape to close and zoom controls', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const asset = generateFixtureCatalog(10).catalog.assets[0]!;

    render(<CatalogPreviewModal asset={asset} open onClose={onClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('catalog-preview-modal')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Zoom in'));
    expect(screen.getByText('125%')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('focuses close button when opened', () => {
    const asset = generateFixtureCatalog(10).catalog.assets[0]!;
    render(
      <CatalogPreviewModal asset={asset} open onClose={() => undefined} />,
    );
    expect(screen.getByTestId('catalog-preview-close')).toHaveFocus();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CatalogMediaCard } from '@/components/media-library/CatalogMediaCard';
import { StatWidget } from '@/components/media-library/StatWidget';
import { generateFixtureCatalog } from '@/lib/media-library';

describe('media library components', () => {
  it('renders catalog media card fields', () => {
    const asset = generateFixtureCatalog(20).catalog.assets[0]!;
    render(<CatalogMediaCard asset={asset} />);
    expect(screen.getByTestId('catalog-media-card')).toBeInTheDocument();
    expect(screen.getByText(asset.filename)).toBeInTheDocument();
    expect(screen.getByText(/Web/i)).toBeInTheDocument();
  });

  it('renders stat widget', () => {
    render(<StatWidget label="Total Images" value={42} hint="fixture" />);
    expect(screen.getByTestId('stat-widget')).toHaveTextContent('42');
    expect(screen.getByText('Total Images')).toBeInTheDocument();
  });
});

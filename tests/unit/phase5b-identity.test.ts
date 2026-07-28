import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { brandLogo } from '@/config/brand-logo';
import { routes } from '@/config/routes';

describe('phase 5b visual identity', () => {
  it('registers a noindex design-system preview route', () => {
    expect(routes.designSystem.path).toBe('/design-system');
    expect(routes.designSystem.sitemap).toBe(false);
    expect(routes.designSystem.launch).toBe(false);
  });

  it('resolves official logo from public/brand when present', () => {
    expect(typeof brandLogo.officialFilePending).toBe('boolean');
    if (brandLogo.officialFilePending) {
      expect(brandLogo.officialSrc).toBeNull();
      expect(brandLogo.headerMode).toBe('text');
    } else {
      expect(brandLogo.officialSrc).toMatch(/\/brand\/bcs-logo-official\./);
      expect(brandLogo.headerSrc).toMatch(
        /\/brand\/bcs-logo-(header|official)\./,
      );
      expect(brandLogo.headerMode).toBe('image');
    }
  });

  it('prefers production webp assets when committed', () => {
    if (brandLogo.officialFilePending) return;
    expect(brandLogo.officialSrc).toBe('/brand/bcs-logo-official.webp');
    expect(brandLogo.headerSrc).toBe('/brand/bcs-logo-header.webp');
    expect(brandLogo.headerSrc2x).toBe('/brand/bcs-logo-header@2x.webp');
  });

  it('defines semantic color and font tokens in globals.css', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
    expect(css).toContain('--color-bg-primary');
    expect(css).toContain('--color-accent');
    expect(css).toContain('--color-text-secondary');
    expect(css).toContain('--font-display');
    expect(css).toContain('--font-manrope');
    expect(css).toContain('--ease-premium');
    expect(css).toContain('.bcs-marine-texture');
    expect(css).toContain('.bcs-aviation-texture');
  });
});

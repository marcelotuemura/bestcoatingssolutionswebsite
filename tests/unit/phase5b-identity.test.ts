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

  it('keeps official logo file pending until owner drop', () => {
    expect(brandLogo.officialFilePending).toBe(true);
    expect(brandLogo.fullColorSrc).toContain('/brand/');
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

import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { marinePhotography } from '@/config/marine-photography';

describe('marine photography assets', () => {
  it('keeps every configured file on disk under public/images/marine', () => {
    const photos = [marinePhotography.hero, ...marinePhotography.gallery];
    for (const photo of photos) {
      const diskPath = path.join(
        process.cwd(),
        'public',
        photo.src.replace(/^\//, ''),
      );
      expect(existsSync(diskPath)).toBe(true);
      expect(photo.width).toBeGreaterThan(0);
      expect(photo.height).toBeGreaterThan(0);
    }
  });

  it('archives new owner albums under data/pictures and does not invent BA pairs', () => {
    expect(
      existsSync(
        path.join(
          process.cwd(),
          'data/pictures/axopar-ceramic-coating/after.jpg',
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        path.join(
          process.cwd(),
          'data/pictures/bow-rider/bow_rider_damage.jpg',
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        path.join(
          process.cwd(),
          'data/pictures/hardtop-fiberglass-repair/after4.JPG',
        ),
      ),
    ).toBe(true);
    expect(marinePhotography.beforeAfterPairs).toHaveLength(0);
    expect(
      marinePhotography.gallery.some((p) =>
        p.src.includes('gallery-13-axopar'),
      ),
    ).toBe(true);
  });
});

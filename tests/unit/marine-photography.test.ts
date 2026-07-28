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
});

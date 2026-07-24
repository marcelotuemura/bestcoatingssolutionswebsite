import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { assertInsideVault } from '@/lib/media-vault/layout';

describe('private vault streaming guarantees', () => {
  it('rejects path traversal outside MEDIA_VAULT_ROOT', () => {
    const root = '/var/media-vault';
    expect(() =>
      assertInsideVault(root, '/var/media-vault/../etc/passwd'),
    ).toThrow(/escapes/);
  });

  it('vault route sets private no-store nosniff noindex headers', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'app/media/vault/[...key]/route.ts'),
      'utf8',
    );
    expect(source).toMatch(/Cache-Control['"]:\s*['"]private, no-store['"]/);
    expect(source).toMatch(/X-Robots-Tag['"]:\s*['"]noindex/);
    expect(source).toMatch(/X-Content-Type-Options['"]:\s*['"]nosniff['"]/);
    expect(source).toMatch(/requireMediaVaultAccess/);
    // Absolute paths must not be serialized into JSON responses.
    expect(source).not.toMatch(/JSON\.stringify\([^\)]*absolutePath/);
  });
});

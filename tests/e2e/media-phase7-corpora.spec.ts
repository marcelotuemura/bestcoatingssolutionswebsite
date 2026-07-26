import { expect, test } from '@playwright/test';

const secret =
  process.env.MEDIA_INTELLIGENCE_ACCESS_SECRET ??
  'e2e-media-access-secret-32ch!!';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/media/login');
  await page.getByTestId('media-access-secret').fill(secret);
  await page.getByTestId('media-login-submit').click();
  await page.waitForURL(/\/media(?!\/login)/);
}

test.describe('Phase 7 — Training corpora', () => {
  test('corpus list, create draft, open version queue', async ({ page }) => {
    await login(page);
    await page.goto('/media/corpora');
    await expect(page.getByTestId('corpus-governance-checklist')).toBeVisible();
    await expect(page.getByTestId('corpus-create-form')).toBeVisible();

    const name = `E2E corpus ${Date.now()}`;
    await page.getByTestId('corpus-name-input').fill(name);
    await page.getByTestId('corpus-create-submit').click();

    await page.waitForURL(
      (url) =>
        /^\/media\/corpora\/[0-9a-f-]{36}$/i.test(url.pathname) &&
        !url.pathname.startsWith('/en/') &&
        !url.pathname.startsWith('/es/'),
      { timeout: 20_000 },
    );

    await expect(page.getByTestId('corpus-version-list')).toBeVisible();
    const versionLink = page.locator('[data-testid^="version-link-"]').first();
    await expect(versionLink).toBeVisible();
    await versionLink.click();

    await expect(page.getByTestId('corpus-version-panel')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('release-readiness')).toBeVisible();
    await expect(page.getByTestId('corpus-item-queue')).toBeVisible();
  });
});

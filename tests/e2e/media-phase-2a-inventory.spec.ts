import { expect, test } from '@playwright/test';

const ACCESS_SECRET =
  process.env.MEDIA_INTELLIGENCE_ACCESS_SECRET ??
  'e2e-media-access-secret-32ch!!';

async function mediaLogin(page: import('@playwright/test').Page) {
  await page.goto('/media/login');
  await page.getByTestId('media-access-secret').fill(ACCESS_SECRET);
  await page.getByTestId('media-login-submit').click();
  await page.waitForURL(/\/media(?!\/login)/);
}

test.describe('media phase 2a inventory', () => {
  test('unauthorized /media/inventory redirects to login', async ({ page }) => {
    await page.goto('/media/inventory');
    await expect(page).toHaveURL(/\/media\/login/);
  });

  test('authenticated inventory shows archive grid', async ({ page }) => {
    await mediaLogin(page);
    await page.goto('/media/inventory');
    await expect(page.getByTestId('inventory-stats')).toBeVisible();
    await expect(page.getByTestId('inventory-filters')).toBeVisible();
    await expect(page.getByTestId('inventory-grid')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inventory' })).toBeVisible();
  });

  test('asset detail exposes review form and privacy checklist', async ({
    page,
  }) => {
    await mediaLogin(page);
    await page.goto('/media/inventory');
    const first = page.locator('[data-testid^="inventory-card-"]').first();
    await expect(first).toBeVisible();
    await first.click();
    await expect(page.getByTestId('asset-preview-meta')).toBeVisible();
    await expect(page.getByTestId('asset-review-form')).toBeVisible();
    await expect(page.getByTestId('privacy-checklist')).toBeVisible();
  });
});

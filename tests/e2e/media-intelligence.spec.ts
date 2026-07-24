import { expect, test } from '@playwright/test';

test.describe('Media Intelligence Platform (DAMS)', () => {
  test('dashboard loads with stats and never-auto-publish banner', async ({
    page,
  }) => {
    await page.goto('/media');
    await expect(
      page.getByRole('heading', { name: 'Command Center' }),
    ).toBeVisible();
    await expect(page.getByTestId('media-dashboard-stats')).toBeVisible();
    await expect(page.getByText(/Never auto-publish/i).first()).toBeVisible();
  });

  test('library search finds Sea Ray demo assets', async ({ page }) => {
    await page.goto('/media/library');
    await page.getByTestId('media-search').fill('Sea Ray gelcoat');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText(/demo_sea_ray/i).first()).toBeVisible();
  });

  test('import page exposes dropzone', async ({ page }) => {
    await page.goto('/media/import');
    await expect(page.getByTestId('media-import-dropzone')).toBeVisible();
  });

  test('robots disallows /media', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toMatch(/Disallow:\s*\/media/i);
  });
});

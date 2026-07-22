import { test, expect } from '@playwright/test';

test.describe('foundation home page', () => {
  test('renders the company name and is indexable', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole('heading', { name: 'Best Coatings Solutions' }),
    ).toBeVisible();
  });

  test('serves a sitemap and robots.txt', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();

    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain('Sitemap');
  });
});

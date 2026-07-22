import { test, expect } from '@playwright/test';

test.describe('Phase 1 shell', () => {
  test('redirects / to a locale home and renders BCS chrome', async ({
    page,
  }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/(en|es)/);

    await expect(
      page.getByRole('heading', { name: 'Best Coatings Solutions' }),
    ).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /skip to main content/i }),
    ).toHaveCount(1);
  });

  test('switches between English and Spanish', async ({ page }) => {
    await page.goto('/en');
    await page
      .getByRole('banner')
      .getByRole('group', { name: 'Language' })
      .getByRole('link', { name: 'ES' })
      .click();
    await expect(page).toHaveURL(/\/es/);
    await expect(
      page.getByRole('link', { name: 'Solicitar estimado' }).first(),
    ).toBeVisible();
  });

  test('opens mobile navigation with keyboard-friendly controls', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Mobile' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Mobile' })).toBeHidden();
  });

  test('serves a locale-aware sitemap and robots.txt', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    const sitemapXml = await sitemap.text();
    expect(sitemapXml).toContain('/en');
    expect(sitemapXml).toContain('/es');

    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain('Sitemap');
  });
});

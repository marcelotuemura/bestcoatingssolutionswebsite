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

  test('serves Spanish initial HTML with lang="es"', async ({ request }) => {
    const response = await request.get('/es');
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toMatch(/<html[^>]*\slang=["']es["']/i);
    expect(html).not.toMatch(/<html[^>]*\slang=["']en["']/i);
  });

  test('serves English initial HTML with lang="en"', async ({ request }) => {
    const response = await request.get('/en');
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toMatch(/<html[^>]*\slang=["']en["']/i);
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

  test('mobile nav unmounts when closed and traps focus when open', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');

    const openButton = page.getByRole('button', { name: 'Open menu' });
    await openButton.click();

    const dialog = page.getByRole('dialog', { name: 'Mobile' });
    await expect(dialog).toBeVisible();

    // Focus starts on the close control inside the dialog.
    await expect(
      dialog.getByRole('button', { name: 'Close menu' }),
    ).toBeFocused();

    // Tab cycles inside the dialog (does not escape to the page behind).
    const dialogHandle = await dialog.elementHandle();
    expect(dialogHandle).not.toBeNull();

    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate((panel) => {
        if (!panel) {
          return false;
        }
        return panel.contains(document.activeElement);
      }, dialogHandle);
      expect(inside).toBe(true);
    }

    // Shift+Tab also stays inside.
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press('Shift+Tab');
      const inside = await page.evaluate((panel) => {
        if (!panel) {
          return false;
        }
        return panel.contains(document.activeElement);
      }, dialogHandle);
      expect(inside).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(openButton).toBeFocused();

    // Closed drawer items are not in the accessibility/keyboard tree.
    await expect(page.getByRole('dialog', { name: 'Mobile' })).toHaveCount(0);
    await openButton.focus();
    await page.keyboard.press('Tab');
    const activeName = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute('aria-label') ?? el?.textContent?.trim() ?? '';
    });
    expect(activeName.toLowerCase()).not.toContain('marine');
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

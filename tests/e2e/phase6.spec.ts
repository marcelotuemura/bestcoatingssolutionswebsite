import { expect, test } from '@playwright/test';

test.describe('Phase 6 — Production launch readiness', () => {
  test('contact form remains in demonstration mode', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.getByTestId('contact-form')).toBeVisible();
    await expect(
      page
        .getByText(/demonstration mode|prepared locally|direct delivery/i)
        .first(),
    ).toBeVisible();
  });

  test('estimate form remains in demonstration mode', async ({ page }) => {
    await page.goto('/en/estimate-request');
    await expect(
      page
        .getByText(/demonstration mode|prepared locally|direct delivery/i)
        .first(),
    ).toBeVisible();
  });

  test('robots still disallows portal', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toMatch(/Disallow:\s*\/portal/i);
    expect(body).toMatch(/Sitemap:/i);
  });

  test('sitemap remains available after phase 5 routes', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const xml = await response.text();
    expect(xml).toContain('/en/faq');
    expect(xml).toContain('/en/resources');
    expect(xml).not.toContain('/portal');
  });
});

import { expect, test } from '@playwright/test';

test.describe('Phase 6 — Production form delivery readiness', () => {
  test('contact form uses demonstration banner without live credentials', async ({
    page,
  }) => {
    await page.goto('/en/contact');
    await expect(page.getByTestId('contact-form')).toBeVisible();
    await expect(page.getByTestId('form-demo-banner')).toBeVisible();
    await expect(page.getByTestId('form-demo-banner')).toContainText(
      /demonstration mode|prepared locally/i,
    );
  });

  test('estimate form uses demonstration banner without live credentials', async ({
    page,
  }) => {
    await page.goto('/en/estimate-request');
    await expect(page.getByTestId('form-demo-banner')).toBeVisible();
    await expect(page.getByTestId('form-demo-banner')).toContainText(
      /demonstration mode|prepared locally/i,
    );
  });

  test('thank-you supports delivered status copy', async ({ page }) => {
    await page.goto('/en/thank-you?type=contact&status=delivered');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Message sent/i,
    );
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

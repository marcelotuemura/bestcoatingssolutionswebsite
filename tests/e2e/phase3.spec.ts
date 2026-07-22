import { test, expect } from '@playwright/test';
import { marineServices } from '../../config/marine-services';

test.describe('Phase 3 — Marine, Aviation, Services, Projects', () => {
  test('Marine division: one H1, breadcrumbs, services, CTA', async ({
    page,
  }) => {
    await page.goto('/en/marine');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Marine' }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Overview', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Marine services', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Gelcoat Repair/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Request Free Estimate' }).first(),
    ).toBeVisible();
    await expect(page.getByText(/Placeholder Image/i).first()).toBeVisible();
  });

  test('Aviation coming soon — no service catalog, no active ops', async ({
    page,
  }) => {
    await page.goto('/en/aviation');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Aviation' }),
    ).toBeVisible();
    await expect(page.getByTestId('aviation-coming-soon')).toContainText(
      /Coming Soon/i,
    );
    await expect(page.getByText(/not currently active/i).first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Future capabilities', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Quality philosophy', level: 2 }),
    ).toBeVisible();
    await expect(page.getByTestId('service-link-gelcoat-repair')).toHaveCount(
      0,
    );
    await expect(page.getByTestId('cta-primary-contact')).toBeVisible();
    await expect(page.getByTestId('cta-primary-estimate')).toHaveCount(0);
  });

  test('Services index lists all marine services', async ({ page }) => {
    await page.goto('/en/services');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Marine services' }),
    ).toBeVisible();
    for (const service of marineServices) {
      await expect(
        page.getByTestId(`service-link-${service.slug}`),
      ).toBeVisible();
    }
  });

  for (const service of marineServices) {
    test(`service page ${service.slug} has required sections`, async ({
      page,
    }) => {
      await page.goto(`/en/services/${service.slug}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(
        page.getByRole('navigation', { name: 'Breadcrumb' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Overview', level: 2 }),
      ).toBeVisible();
      await expect(page.locator('#common-problems')).toBeVisible();
      await expect(page.locator('#our-process')).toBeVisible();
      await expect(page.locator('#why-choose-bcs')).toBeVisible();
      await expect(page.locator('#faq')).toBeVisible();
      await expect(page.locator('#estimate-cta')).toBeVisible();
      await expect(page.getByText(/Placeholder Image/i).first()).toBeVisible();
    });
  }

  test('Projects framework shows placeholders, no fake published work', async ({
    page,
  }) => {
    await page.goto('/en/projects');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeVisible();
    await expect(page.getByTestId('projects-empty')).toBeVisible();
    await expect(page.getByText(/Future Project/i).first()).toBeVisible();
    await expect(page.getByText(/Placeholder Image/i).first()).toBeVisible();
  });

  test('Spanish marine and service routing', async ({ page }) => {
    await page.goto('/es/marine');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Marina' }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Miga de pan' }),
    ).toBeVisible();

    await page.goto('/es/services/gelcoat-repair');
    await expect(
      page.getByRole('heading', { level: 1, name: /Reparación de gelcoat/i }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('Spanish aviation coming soon messaging', async ({ page }) => {
    await page.goto('/es/aviation');
    await expect(page.getByTestId('aviation-coming-soon')).toContainText(
      /Próximamente/i,
    );
  });

  test('metadata and canonical for marine service', async ({ request }) => {
    const response = await request.get('/en/services/gelcoat-repair');
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toMatch(
      /rel=["']canonical["'][^>]*href=["'][^"']*\/en\/services\/gelcoat-repair/i,
    );
    expect(html).toMatch(/og:title/i);
    expect(html).toMatch(/twitter:card/i);
  });

  test('internal links from services index are not broken', async ({
    page,
  }) => {
    await page.goto('/en/services');
    const hrefs = await page
      .locator('[data-testid^="service-link-"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => (node as HTMLAnchorElement).getAttribute('href')),
      );
    expect(hrefs.length).toBe(marineServices.length);
    for (const href of hrefs) {
      expect(href).toBeTruthy();
      const res = await page.request.get(href!);
      expect(res.ok()).toBeTruthy();
    }
  });

  test('sitemap includes service detail URLs', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const xml = await response.text();
    expect(xml).toContain('/en/services/gelcoat-repair');
    expect(xml).toContain('/es/services/paint-refinishing');
  });
});

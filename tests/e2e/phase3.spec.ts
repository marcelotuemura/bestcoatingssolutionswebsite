import { test, expect } from '@playwright/test';
import { marineServices } from '../../config/marine-services';

test.describe('Phase 3 — Marine, Aviation, Services, Projects', () => {
  test('Marine division: one H1, breadcrumbs, process, services, CTA', async ({
    page,
  }) => {
    await page.goto('/en/marine');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 1, name: /Marine/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }),
    ).toBeVisible();
    await expect(page.getByTestId('division-hero')).toHaveAttribute(
      'data-atmosphere',
      'marine',
    );
    await expect(
      page.getByRole('heading', {
        name: /What this work is about|How we approach/i,
        level: 2,
      }),
    ).toBeVisible();
    await expect(page.getByTestId('division-process')).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /How a marine refinishing project moves/i,
        level: 2,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /How we can help/i, level: 2 }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Marine services/i, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Gelcoat Repair/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Request an Estimate' }).first(),
    ).toBeVisible();
    await expect(page.getByTestId('division-hero')).toHaveAttribute(
      'data-hero-authentic',
      'true',
    );
    await expect(page.getByTestId('marine-work-gallery')).toBeVisible();
    await expect(
      page.getByText(/Placeholder Image — not a BCS project photo/i),
    ).toHaveCount(0);
  });

  test('Aviation division is visible and carefully scoped', async ({
    page,
  }) => {
    await page.goto('/en/aviation');
    await expect(
      page.getByRole('heading', { level: 1, name: /Aviation Refinishing/i }),
    ).toBeVisible();
    await expect(page.getByTestId('aviation-coming-soon')).toHaveCount(0);
    await expect(page.getByTestId('division-hero')).toHaveAttribute(
      'data-atmosphere',
      'aviation',
    );
    await expect(page.getByTestId('aviation-scope-note')).toBeVisible();
    await expect(page.getByTestId('division-process')).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: /How an aviation refinishing project moves/i,
        level: 2,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Capabilities we discuss', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByText(/not an FAA repair station/i).first(),
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
      page.getByRole('heading', { level: 1, name: 'How we can help' }),
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
      await expect(page.locator('#overview')).toBeVisible();
      await expect(
        page.getByRole('heading', {
          name: /What this work is about|Overview/i,
          level: 2,
        }),
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
      page.getByRole('heading', { level: 1, name: /Our Work|Projects/i }),
    ).toBeVisible();
    await expect(page.getByTestId('projects-empty')).toBeVisible();
    await expect(
      page.getByText(/Future Project|Repair stories in preparation/i).first(),
    ).toBeVisible();
  });

  test('Spanish marine and service routing', async ({ page }) => {
    // Marine page now ships a full authentic photo gallery; waiting for every
    // image `load` event is flaky under CI resource limits.
    test.setTimeout(60_000);
    await page.goto('/es/marine', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { level: 1, name: /marina/i }),
    ).toBeVisible();
    await expect(page.getByTestId('division-process')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Miga de pan' }),
    ).toBeVisible();

    await page.goto('/es/services/gelcoat-repair', {
      waitUntil: 'domcontentloaded',
    });
    await expect(
      page.getByRole('heading', { level: 1, name: /Reparación de gelcoat/i }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('Spanish aviation division messaging', async ({ page }) => {
    await page.goto('/es/aviation');
    await expect(page.getByTestId('aviation-coming-soon')).toHaveCount(0);
    await expect(page.getByTestId('aviation-scope-note')).toBeVisible();
    await expect(page.getByTestId('division-process')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: /aviación/i }),
    ).toBeVisible();
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

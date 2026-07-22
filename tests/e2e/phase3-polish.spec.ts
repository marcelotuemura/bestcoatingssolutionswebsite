import { test, expect } from '@playwright/test';
import { marineServices } from '../../config/marine-services';
import { getRelatedMarineServices } from '../../config/marine-services';

const phase3Routes = [
  '/en/marine',
  '/en/aviation',
  '/en/services',
  '/en/projects',
  ...marineServices.map((s) => `/en/services/${s.slug}`),
] as const;

test.describe('Phase 3 polish — consistency audits', () => {
  for (const route of phase3Routes) {
    test(`loads ${route} with one H1`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    });
  }

  test('service pages share CTA hierarchy and internal links', async ({
    page,
  }) => {
    for (const service of marineServices) {
      await page.goto(`/en/services/${service.slug}`);

      const band = page.getByTestId('page-cta-band');
      await expect(band).toHaveAttribute('data-cta-mode', 'estimate');
      await expect(page.getByTestId('cta-primary-estimate')).toHaveText(
        'Request Free Estimate',
      );
      await expect(page.getByTestId('cta-secondary-call')).toHaveText(
        'Call Best Coatings Solutions',
      );
      await expect(page.getByTestId('cta-secondary-call')).toHaveAttribute(
        'href',
        'tel:+13057478352',
      );

      await expect(
        page.getByRole('heading', { name: 'Why Choose BCS', level: 2 }),
      ).toBeVisible();
      await expect(page.locator('#overview')).toBeVisible();
      await expect(page.locator('#common-problems')).toBeVisible();
      await expect(page.locator('#our-process')).toBeVisible();
      await expect(page.locator('#why-choose-bcs')).toBeVisible();
      await expect(page.locator('#faq')).toBeVisible();
      await expect(page.locator('#related-services')).toBeVisible();
      await expect(page.locator('#estimate-cta')).toBeVisible();

      const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
      await expect(crumbs.getByRole('link', { name: 'Home' })).toBeVisible();
      await expect(crumbs.getByRole('link', { name: 'Marine' })).toBeVisible();
      await expect(
        crumbs.getByRole('link', { name: 'Services' }),
      ).toBeVisible();

      const contextLinks = page.getByTestId('service-context-link');
      await expect(contextLinks).toHaveCount(4);

      for (const related of getRelatedMarineServices(service.slug)) {
        await expect(
          page.getByTestId(`related-service-${related}`),
        ).toBeVisible();
      }

      await expect(page.getByText(/Placeholder Image/i).first()).toBeVisible();
    }
  });

  test('breadcrumb JSON-LD matches visible service breadcrumbs', async ({
    page,
  }) => {
    await page.goto('/en/services/gelcoat-repair');
    const labels = await page
      .getByRole('navigation', { name: 'Breadcrumb' })
      .locator('li')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.textContent?.replace(/^\s*\/\s*/, '').trim()),
      );
    const visible = labels.filter(Boolean);

    const jsonLdScripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const breadcrumbLd = jsonLdScripts
      .map(
        (text) =>
          JSON.parse(text) as {
            '@type'?: string;
            itemListElement?: { name: string }[];
          },
      )
      .find((data) => data['@type'] === 'BreadcrumbList');

    expect(breadcrumbLd).toBeTruthy();
    const ldNames = breadcrumbLd!.itemListElement!.map((item) => item.name);
    expect(ldNames).toEqual(visible);
  });

  test('aviation uses contact CTA only — no aviation estimate booking', async ({
    page,
  }) => {
    await page.goto('/en/aviation');
    const band = page.getByTestId('page-cta-band');
    await expect(band).toHaveAttribute('data-cta-mode', 'contact');
    await expect(page.getByTestId('cta-primary-contact')).toBeVisible();
    await expect(page.getByTestId('cta-primary-estimate')).toHaveCount(0);
    await expect(page.getByTestId('aviation-coming-soon')).toContainText(
      /Coming Soon/i,
    );
    await expect(page.getByText(/no current aviation booking/i)).toBeVisible();
    await expect(
      page.getByText(/aviation-specific estimate/i).first(),
    ).toBeVisible();
  });

  test('projects placeholders use Future Project / Placeholder Image wording', async ({
    page,
  }) => {
    await page.goto('/en/projects');
    await expect(page.getByText(/Future Project/i).first()).toBeVisible();
    await expect(page.getByText(/Coming Soon/i).first()).toBeVisible();
    await expect(page.getByText(/Placeholder Image/i).first()).toBeVisible();
  });

  test('localized metadata includes canonical, hreflang, OG, Twitter, JSON-LD', async ({
    request,
  }) => {
    const routes = [
      '/en/marine',
      '/es/marine',
      '/en/aviation',
      '/es/services/gelcoat-repair',
      '/en/projects',
    ];
    for (const route of routes) {
      const response = await request.get(route);
      expect(response.ok(), route).toBeTruthy();
      const html = await response.text();
      expect(html, route).toMatch(/rel=["']canonical["']/i);
      expect(html, route).toMatch(/hreflang=["']en["']/i);
      expect(html, route).toMatch(/hreflang=["']es["']/i);
      expect(html, route).toMatch(/hreflang=["']x-default["']/i);
      expect(html, route).toMatch(/og:title/i);
      expect(html, route).toMatch(/og:description/i);
      expect(html, route).toMatch(/twitter:card/i);
      expect(html, route).toMatch(/application\/ld\+json/i);
      expect(html, route).toMatch(/BreadcrumbList/);
    }
  });

  test('unknown service slug returns 404', async ({ request }) => {
    const response = await request.get('/en/services/not-a-real-service');
    expect(response.status()).toBe(404);
  });

  test('no broken internal links on marine service gelcoat page', async ({
    page,
  }) => {
    await page.goto('/en/services/gelcoat-repair');
    const hrefs = await page
      .locator('main a[href^="/"]')
      .evaluateAll((nodes) => [
        ...new Set(
          nodes
            .map((node) => (node as HTMLAnchorElement).getAttribute('href'))
            .filter((href): href is string => Boolean(href)),
        ),
      ]);
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs) {
      const res = await page.request.get(href);
      expect(res.status(), href).toBeLessThan(400);
    }
  });

  test('accessibility basics across Phase 3 routes', async ({ page }) => {
    for (const route of [
      '/en/marine',
      '/en/aviation',
      '/en/services',
      '/en/services/gelcoat-repair',
      '/en/projects',
    ]) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(
        page.getByRole('navigation', { name: 'Breadcrumb' }),
      ).toBeVisible();
      await expect(page.getByRole('link', { name: /Skip to/i })).toBeAttached();

      // Visible focus on primary CTA
      const cta = page.getByTestId(
        route.includes('aviation')
          ? 'cta-primary-contact'
          : 'cta-primary-estimate',
      );
      await cta.focus();
      await expect(cta).toBeFocused();
    }
  });

  test('mobile CTA stacks and breadcrumbs wrap at narrow widths', async ({
    page,
  }) => {
    for (const width of [320, 375, 390, 414]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/en/services/gelcoat-repair');
      const band = page.getByTestId('page-cta-band');
      await expect(band).toBeVisible();
      const box = await band.boundingBox();
      expect(box?.width ?? 0).toBeLessThanOrEqual(width);
      await expect(
        page.getByRole('navigation', { name: 'Breadcrumb' }),
      ).toBeVisible();
      await expect(page.getByTestId('cta-primary-estimate')).toBeVisible();
      await expect(page.getByTestId('cta-secondary-call')).toBeVisible();
    }
  });

  test('tablet and desktop layouts keep CTA hierarchy', async ({ page }) => {
    for (const width of [768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en/marine');
      await expect(page.getByTestId('page-cta-band')).toHaveAttribute(
        'data-cta-mode',
        'estimate',
      );
      await expect(page.getByTestId('cta-primary-estimate')).toBeVisible();
      await expect(page.getByTestId('cta-secondary-call')).toBeVisible();
    }
  });

  test('Spanish CTA and placeholder localization', async ({ page }) => {
    await page.goto('/es/services/gelcoat-repair');
    await expect(page.getByTestId('cta-primary-estimate')).toHaveText(
      'Solicitar estimado gratuito',
    );
    await expect(page.getByTestId('cta-secondary-call')).toHaveText(
      'Llamar a Best Coatings Solutions',
    );
    await expect(
      page.getByRole('heading', { name: 'Por qué elegir BCS', level: 2 }),
    ).toBeVisible();
    await expect(page.getByText(/Imagen provisional/i).first()).toBeVisible();
  });
});

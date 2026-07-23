import { expect, test } from '@playwright/test';

test.describe('Phase 5 — About', () => {
  test('English about page', async ({ page }) => {
    await page.goto('/en/about');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText(
      'About Best Coatings Solutions',
    );
    await expect(page.getByTestId('company-values')).toBeVisible();
    await expect(page.getByTestId('about-owner-facts-pending')).toBeVisible();
    await expect(page.getByText(/years in business/i)).toHaveCount(0);
    await expect(page.getByText(/award-winning/i)).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: /request/i }).first(),
    ).toBeVisible();
  });

  test('Spanish about page', async ({ page }) => {
    await page.goto('/es/about');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText(
      'Acerca de Best Coatings Solutions',
    );
  });
});

test.describe('Phase 5 — Projects', () => {
  test('empty production portfolio messaging and links', async ({ page }) => {
    await page.goto('/en/projects');
    await expect(page.getByTestId('projects-empty')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /marine services/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /request estimate/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /contact bcs/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /^resources$/i }),
    ).toBeVisible();
  });

  test('test fixture project detail with before/after labels', async ({
    page,
  }) => {
    await page.goto('/en/projects/test-fixture-gelcoat-demo');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('test-fixture-badge')).toBeVisible();
    await expect(page.getByTestId('before-after-pair')).toBeVisible();
    await expect(page.getByText(/^Before$/i).first()).toBeVisible();
    await expect(page.getByText(/^After$/i).first()).toBeVisible();
    await expect(page.getByText(/\bHIN\b/)).toHaveCount(0);
    await expect(page.getByText(/claim number/i)).toHaveCount(0);
  });

  test('unknown project slug returns 404', async ({ page }) => {
    const response = await page.goto('/en/projects/not-a-real-project-slug');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Phase 5 — Testimonials', () => {
  test('does not invent reviews or ratings', async ({ page }) => {
    await page.goto('/en/projects');
    await expect(page.getByTestId('testimonial-card')).toHaveCount(0);
    await expect(page.getByTestId('testimonial-rating')).toHaveCount(0);
    const content = await page.content();
    expect(content).not.toMatch(/"@type":\s*"Review"/);
    expect(content).not.toMatch(/AggregateRating/);
  });
});

test.describe('Phase 5 — FAQ', () => {
  test('English FAQ center with categories and schema', async ({ page }) => {
    await page.goto('/en/faq');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('faq-category-nav')).toBeVisible();
    await page.locator('a[href="#faq-estimates"]').click();
    await expect(page.locator('#faq-estimates')).toBeVisible();
    const item = page.getByTestId('faq-item-estimates-free');
    await item.locator('summary').focus();
    await item.locator('summary').press('Enter');
    await expect(item).toHaveAttribute('open', '');
    const content = await page.content();
    expect(content).toMatch(/"@type":"FAQPage"/);
    expect(content).toContain('Are estimates free?');
    await expect(page.getByText(/instant online estimate/i)).toBeVisible();
    await expect(page.getByText(/lifetime warranty/i).first()).toBeVisible();
    await expect(page.getByText(/we offer a lifetime warranty/i)).toHaveCount(
      0,
    );
  });

  test('Spanish FAQ route', async ({ page }) => {
    await page.goto('/es/faq');
    await expect(page.locator('h1')).toContainText('preguntas frecuentes', {
      ignoreCase: true,
    });
  });
});

test.describe('Phase 5 — Workmanship', () => {
  test('owner/legal wording and CTAs', async ({ page }) => {
    await page.goto('/en/workmanship');
    await expect(page.getByTestId('workmanship-legal-notice')).toContainText(
      /owner and legal review/i,
    );
    await expect(page.getByText(/lifetime warranty/i)).toHaveCount(0);
    await expect(page.getByTestId('workmanship-contact-cta')).toBeVisible();
    await expect(page.getByTestId('workmanship-estimate-cta')).toBeVisible();
  });
});

test.describe('Phase 5 — Insurance', () => {
  test('coverage disclaimers on insurance repair page', async ({ page }) => {
    await page.goto('/en/services/insurance-repair');
    await expect(page.getByTestId('insurance-repair-process')).toBeVisible();
    await expect(
      page.getByText(/does not guarantee claim approval/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/public-adjuster/i).first()).toBeVisible();
    await expect(
      page.getByText(/preferred-vendor status/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/we guarantee claim approval/i)).toHaveCount(0);
  });
});

test.describe('Phase 5 — Service area', () => {
  test('approved locations only', async ({ page }) => {
    await page.goto('/en/service-area');
    await expect(page.getByTestId('service-area-primary')).toContainText(
      /South Florida/i,
    );
    await expect(
      page.getByTestId('service-area-fort-lauderdale'),
    ).toBeVisible();
    await expect(
      page.getByTestId('service-area-map-placeholder'),
    ).toBeVisible();
    await expect(page.getByTestId('marina-directory-pending')).toBeVisible();
    await expect(page.getByText(/123 Main/i)).toHaveCount(0);
    await expect(page.getByText(/preferred marina partner/i)).toHaveCount(0);
  });
});

test.describe('Phase 5 — Resources', () => {
  test('English index lists published articles', async ({ page }) => {
    await page.goto('/en/resources');
    await expect(page.getByTestId('resources-list')).toBeVisible();
    await expect(page.getByTestId('educational-disclaimer')).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: /information needed when requesting a marine repair estimate/i,
      }),
    ).toBeVisible();
  });

  test('Spanish resources index', async ({ page }) => {
    await page.goto('/es/resources');
    await expect(page.locator('h1')).toContainText(/recursos/i);
  });

  test('published article detail and 404 for draft/unknown', async ({
    page,
  }) => {
    await page.goto('/en/resources/how-to-photograph-vessel-damage');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('educational-disclaimer')).toBeVisible();
    const content = await page.content();
    expect(content).toMatch(/"@type":"Article"/);
    await expect(page.getByText(/mix resin at/i)).toHaveCount(0);

    const draft = await page.goto('/en/resources/draft-sample-resource');
    expect(draft?.status()).toBe(404);
    const unknown = await page.goto('/en/resources/not-a-real-article');
    expect(unknown?.status()).toBe(404);
  });
});

test.describe('Phase 5 — SEO and sitemap', () => {
  test('localized metadata and sitemap exclusions', async ({
    page,
    request,
  }) => {
    await page.goto('/en/faq');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /\/en\/faq$/);
    const hreflang = page.locator('link[hreflang]');
    await expect(hreflang).toHaveCount(3);

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    const xml = await sitemap.text();
    expect(xml).toContain('/en/faq');
    expect(xml).toContain('/en/resources/');
    expect(xml).not.toContain('test-fixture');
    expect(xml).not.toContain('draft-sample');
    expect(xml).not.toContain('/thank-you');
  });
});

test.describe('Phase 5 — Internal links', () => {
  test('footer includes phase 5 destinations', async ({ page }) => {
    await page.goto('/en/about');
    const footer = page.locator('footer');
    for (const path of [
      '/en/about',
      '/en/services',
      '/en/projects',
      '/en/faq',
      '/en/resources',
      '/en/service-area',
      '/en/workmanship',
      '/en/contact',
    ]) {
      await expect(footer.locator(`a[href="${path}"]`)).toHaveCount(1);
    }
  });
});

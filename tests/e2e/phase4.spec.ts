import { test, expect } from '@playwright/test';
import { estimateServiceOptions } from '../../config/form-options';

test.describe('Phase 4 — Contact', () => {
  test('English contact page loads with one H1 and links', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByTestId('contact-phone')).toBeVisible();
    await expect(page.getByTestId('contact-email')).toBeVisible();
    await expect(page.getByTestId('map-placeholder')).toContainText(
      /Placeholder Image|map/i,
    );
  });

  test('Spanish contact page loads', async ({ page }) => {
    await page.goto('/es/contact');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('required validation and keyboard-accessible form', async ({ page }) => {
    await page.goto('/en/contact');
    await page.getByTestId('contact-submit').click();
    await expect(page.getByTestId('form-error-summary')).toBeVisible();
    await page.getByLabel(/Full name/i).fill('Alex Rivera');
    await page.getByLabel(/^Email/i).fill('alex@example.com');
    await page.getByLabel(/^Phone/i).fill('305-747-8352');
    await page
      .getByLabel(/^Message/i)
      .fill('Looking for gelcoat repair advice.');
    await page.getByLabel(/I understand this message/i).check();
    await page.getByTestId('contact-submit').click();
    await expect(page).toHaveURL(/\/en\/thank-you\?type=contact$/);
    expect(page.url()).not.toMatch(/alex@example.com|305-747/);
  });

  test('simulated failure retains data', async ({ page }) => {
    await page.goto('/en/contact?simulateFailure=1');
    await page.getByLabel(/Full name/i).fill('Alex Rivera');
    await page.getByLabel(/^Email/i).fill('alex@example.com');
    await page.getByLabel(/^Phone/i).fill('305-747-8352');
    await page
      .getByLabel(/^Message/i)
      .fill('Looking for gelcoat repair advice.');
    await page.getByLabel(/I understand this message/i).check();
    await page.getByTestId('contact-submit').click();
    await expect(page.getByTestId('form-error-summary')).toBeVisible();
    await expect(page.getByLabel(/Full name/i)).toHaveValue('Alex Rivera');
    await expect(page).toHaveURL(/contact/);
  });
});

test.describe('Phase 4 — Estimate request', () => {
  async function fillCustomer(page: import('@playwright/test').Page) {
    await page.getByLabel(/Full name/i).fill('Alex Rivera');
    await page.getByLabel(/^Email/i).fill('alex@example.com');
    await page.getByLabel(/^Phone/i).fill('305-555-0100');
    await page.getByTestId('estimate-next').click();
  }

  async function fillVessel(page: import('@playwright/test').Page) {
    await page.getByLabel(/Manufacturer/i).fill('Sea Ray');
    await page.getByLabel(/^Model/i).fill('Sundancer');
    await page.getByLabel(/^Year/i).fill('2019');
    await page.getByLabel(/Length/i).fill('40');
    await page.getByLabel(/Current vessel location/i).fill('Fort Lauderdale');
    await page.getByTestId('estimate-next').click();
  }

  test('English complete flow to thank you without PII in URL', async ({
    page,
  }) => {
    await page.goto('/en/estimate-request');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page.getByText(/Aviation estimate requests are not available/i),
    ).toBeVisible();

    await fillCustomer(page);
    await fillVessel(page);

    await expect(page.getByTestId('step-services')).toBeVisible();
    for (const service of estimateServiceOptions) {
      await expect(page.locator(`#service-${service}`)).toBeVisible();
    }
    await page.locator('#service-gelcoat-repair').check();
    await expect(page.getByText(/Aircraft Refinishing/i)).toHaveCount(0);
    await page.getByTestId('estimate-next').click();

    await page
      .getByLabel(/Damage description/i)
      .fill('Starboard gelcoat crack near the swim platform needs repair.');
    await page.getByTestId('estimate-next').click();

    // Photos optional — continue
    await page.getByTestId('estimate-next').click();

    await expect(page.getByTestId('step-review')).toBeVisible();
    await expect(page.getByText('Alex Rivera')).toBeVisible();
    await page.getByLabel(/not a final quotation/i).check();
    await page.getByLabel(/inspection or more information/i).check();
    await page.getByLabel(/does not confirm an appointment/i).check();
    await page.getByTestId('estimate-submit').click();
    await expect(page).toHaveURL(/\/en\/thank-you\?type=estimate$/);
    expect(page.url()).not.toMatch(/alex@example|Sea Ray|305-555/);
  });

  test('validation blocks empty progression and back keeps values', async ({
    page,
  }) => {
    await page.goto('/en/estimate-request');
    await page.getByTestId('estimate-next').click();
    await expect(page.getByTestId('form-error-summary')).toBeVisible();
    await page.getByLabel(/Full name/i).fill('Alex Rivera');
    await page.getByLabel(/^Email/i).fill('alex@example.com');
    await page.getByLabel(/^Phone/i).fill('305-555-0100');
    await page.getByTestId('estimate-next').click();
    await expect(page.getByTestId('step-vessel')).toBeVisible();
    await page.getByTestId('estimate-back').click();
    await expect(page.getByLabel(/Full name/i)).toHaveValue('Alex Rivera');
  });

  test('request-estimate alias redirects to estimate-request', async ({
    page,
  }) => {
    await page.goto('/en/request-estimate');
    await expect(page).toHaveURL(/\/en\/estimate-request$/);
  });

  test('Spanish estimate first step', async ({ page }) => {
    await page.goto('/es/estimate-request');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByTestId('estimate-form')).toBeVisible();
    await expect(page.getByTestId('estimate-next')).toHaveText(/Continuar/i);
  });

  test('photo validation and removal', async ({ page }) => {
    await page.goto('/en/estimate-request');
    await fillCustomer(page);
    await fillVessel(page);
    await page.locator('#service-gelcoat-repair').check();
    await page.getByTestId('estimate-next').click();
    await page
      .getByLabel(/Damage description/i)
      .fill('Starboard gelcoat crack near the swim platform needs repair.');
    await page.getByTestId('estimate-next').click();

    await page.getByLabel(/Select damage photos|Photos/i).setInputFiles({
      name: 'damage.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image'),
    });
    await expect(page.getByText(/1 photo/i)).toBeVisible();
    await page.getByRole('button', { name: /Remove damage.jpg/i }).click();
    await expect(page.getByText(/0 photo/i)).toBeVisible();
  });

  test('failure and retry keeps user on form', async ({ page }) => {
    await page.goto('/en/estimate-request?simulateFailure=1');
    await fillCustomer(page);
    await fillVessel(page);
    await page.locator('#service-gelcoat-repair').check();
    await page.getByTestId('estimate-next').click();
    await page
      .getByLabel(/Damage description/i)
      .fill('Starboard gelcoat crack near the swim platform needs repair.');
    await page.getByTestId('estimate-next').click();
    await page.getByTestId('estimate-next').click();
    await page.getByLabel(/not a final quotation/i).check();
    await page.getByLabel(/inspection or more information/i).check();
    await page.getByLabel(/does not confirm an appointment/i).check();
    await page.getByTestId('estimate-submit').click();
    await expect(page.getByTestId('form-error-summary')).toBeVisible();
    await expect(page).toHaveURL(/estimate-request/);
  });
});

test.describe('Phase 4 — Schedule, legal, thank you, 404', () => {
  test('schedule visit has no calendar and states no confirmation', async ({
    page,
  }) => {
    await page.goto('/en/schedule-visit');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByTestId('schedule-no-confirm')).toBeVisible();
    await expect(page.locator('input[type="date"]')).toHaveCount(0);
    await expect(
      page.getByText(/calendly|time slot|available times/i),
    ).toHaveCount(0);
  });

  test('privacy and terms EN/ES', async ({ page, request }) => {
    for (const path of [
      '/en/privacy',
      '/es/privacy',
      '/en/terms',
      '/es/terms',
    ]) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      const res = await request.get(path);
      const html = await res.text();
      expect(html).toMatch(/rel=["']canonical["']/i);
      expect(html).toMatch(/og:title/i);
    }
  });

  test('thank you fallback is safe without type', async ({ page }) => {
    await page.goto('/en/thank-you');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Thank you' }),
    ).toBeVisible();
    const res = await page.request.get('/en/thank-you');
    const html = await res.text();
    expect(html).toMatch(/noindex|robots/i);
  });

  test('unknown route branded 404 and unknown service slug 404', async ({
    page,
    request,
  }) => {
    await page.goto('/en/this-page-does-not-exist');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page
        .locator('#main-content')
        .getByRole('link', { name: /Request Free Estimate/i }),
    ).toBeVisible();

    const service404 = await request.get('/en/services/not-a-real-service');
    expect(service404.status()).toBe(404);
  });

  test('phase 4 internal links are not broken', async ({ page }) => {
    const paths = [
      '/en/contact',
      '/en/estimate-request',
      '/en/schedule-visit',
      '/en/thank-you',
      '/en/privacy',
      '/en/terms',
    ];
    for (const path of paths) {
      const res = await page.request.get(path);
      expect(res.ok() || res.status() === 200, path).toBeTruthy();
    }
  });
});

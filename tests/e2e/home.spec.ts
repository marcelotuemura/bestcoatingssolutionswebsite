import { test, expect } from '@playwright/test';

test.describe('Phase 1 shell', () => {
  test('serves Spanish initial HTML with lang="es"', async ({ request }) => {
    const response = await request.get('/es');
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toMatch(/<html[^>]*\slang=["']es["']/i);
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
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(openButton).toBeFocused();
  });
});

test.describe('Phase 2 homepage', () => {
  test('renders English homepage with one H1 and story sections', async ({
    page,
  }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Precision coatings for vessels/i,
      }),
    ).toBeVisible();

    for (const name of [
      'Who We Are',
      'Marine',
      'Aviation',
      'Why BCS',
      'Featured Project',
      'Before & After',
      'Our Process',
      'Service Area',
      'Request an Estimate',
    ]) {
      await expect(page.getByRole('heading', { name, level: 2 })).toBeVisible();
    }
  });

  test('renders Spanish homepage content', async ({ page }) => {
    await page.goto('/es');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Recubrimientos de precisión/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Quiénes somos', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Marina', level: 2 }),
    ).toBeVisible();
  });

  test('marks Aviation as Coming soon and does not claim active ops', async ({
    page,
  }) => {
    await page.goto('/en');
    const aviation = page.locator('#aviation');
    await expect(aviation.getByText(/Coming soon/i).first()).toBeVisible();
    await expect(
      aviation.getByText(/Aviation operations are not currently active/i),
    ).toBeVisible();
  });

  test('primary CTAs navigate to estimate and schedule routes', async ({
    page,
  }) => {
    await page.goto('/en');
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Request Estimate' })
      .click();
    await expect(page).toHaveURL(/\/en\/estimate-request/);

    await page.goto('/en');
    await page
      .locator('#main-content')
      .getByRole('link', { name: 'Schedule Visit' })
      .first()
      .click();
    await expect(page).toHaveURL(/\/en\/schedule-visit/);
  });

  test('mobile homepage remains usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Request Estimate' }).first(),
    ).toBeVisible();
    await expect(page.locator('#marine')).toBeVisible();
  });

  test('reduced-motion still shows content without requiring animation', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Who We Are', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Request Estimate' }).first(),
    ).toBeVisible();
  });

  test('initial HTML includes hero content before client animation', async ({
    request,
  }) => {
    const response = await request.get('/en');
    const html = await response.text();
    expect(html).toContain(
      'Precision coatings for vessels that demand excellence.',
    );
    expect(html).toContain('Who We Are');
    expect(html).toContain('Coming soon');
    expect(html).toMatch(/<h1[\s>]/i);
  });

  test('homepage internal section links and primary routes are intact', async ({
    page,
  }) => {
    await page.goto('/en');
    const hrefs = await page
      .locator('#main-content a[href^="/en"]')
      .evaluateAll((anchors) =>
        anchors.map((anchor) =>
          (anchor as HTMLAnchorElement).getAttribute('href'),
        ),
      );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/en(\/|$)/);
      const res = await page.request.get(href!);
      expect(res.status(), `broken link ${href}`).toBeLessThan(400);
    }
  });

  test('before/after slider is keyboard operable', async ({ page }) => {
    await page.goto('/en');
    const slider = page.getByRole('slider', {
      name: /Before and after comparison/i,
    });
    await slider.focus();
    await expect(slider).toBeFocused();
    await page.keyboard.press('ArrowRight');
  });
});

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

  test('before/after slider semantics stay aligned for keyboard users', async ({
    page,
  }) => {
    await page.goto('/en');
    const section = page.locator('#before-after');
    const slider = section.getByRole('slider', {
      name: /Before and after comparison/i,
    });
    const frame = section.locator('[data-comparison-value]');
    const handle = section.locator('[data-comparison-handle]');
    const afterLayer = section.locator('[data-layer="after"]');

    await expect(slider).toHaveValue('50');
    await expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Before 50%, After 50%',
    );
    await expect(frame).toHaveAttribute('data-before-percent', '50');
    await expect(frame).toHaveAttribute('data-after-percent', '50');
    await expect(handle).toHaveCSS('left', /.*/);
    await expect(afterLayer).toHaveAttribute(
      'data-after-clip',
      'inset(0 50% 0 0)',
    );

    const leftAt50 = await handle.evaluate(
      (el) => (el as HTMLElement).style.left,
    );
    expect(leftAt50).toBe('50%');

    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('51');
    await expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Before 49%, After 51%',
    );
    await expect(handle).toHaveAttribute('style', /left:\s*51%/);
    await expect(afterLayer).toHaveAttribute(
      'data-after-clip',
      'inset(0 49% 0 0)',
    );

    await page.keyboard.press('ArrowLeft');
    await expect(slider).toHaveValue('50');
    await expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Before 50%, After 50%',
    );

    await page.keyboard.press('Home');
    await expect(slider).toHaveValue('0');
    await expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Before 100%, After 0%',
    );
    await expect(handle).toHaveAttribute('style', /left:\s*0%/);
    await expect(afterLayer).toHaveAttribute(
      'data-after-clip',
      'inset(0 100% 0 0)',
    );

    await page.keyboard.press('End');
    await expect(slider).toHaveValue('100');
    await expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Before 0%, After 100%',
    );
    await expect(handle).toHaveAttribute('style', /left:\s*100%/);
    await expect(afterLayer).toHaveAttribute(
      'data-after-clip',
      'inset(0 0% 0 0)',
    );

    // Placeholder labeling remains honest.
    await expect(section.getByText(/Placeholder media/i)).toBeVisible();
  });

  test('Spanish before/after aria-valuetext is localized', async ({ page }) => {
    await page.goto('/es');
    const slider = page.locator('#before-after').getByRole('slider', {
      name: /Comparación antes y después/i,
    });
    await expect(slider).toHaveValue('50');
    await expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Antes 50%, Después 50%',
    );

    await slider.focus();
    await page.keyboard.press('End');
    await expect(slider).toHaveAttribute(
      'aria-valuetext',
      'Antes 0%, Después 100%',
    );
  });
});

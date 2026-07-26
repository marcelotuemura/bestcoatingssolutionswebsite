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

test.describe('Phase 4 trust homepage', () => {
  test('renders English homepage with one H1 and trust sections', async ({
    page,
  }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Craftsmanship That Shows/i,
      }),
    ).toBeVisible();

    for (const name of [
      'Meet Marcelo',
      'Quality Is Built Before the Paint Is Applied',
      'Built on Experience. Driven by Detail.',
      'Every Repair Begins the Same Way',
      'What You Can Expect',
      'Featured Work',
      'How We Can Help',
      'Service Area',
      'Request an Estimate',
    ]) {
      await expect(page.getByRole('heading', { name, level: 2 })).toBeVisible();
    }

    await expect(page.locator('#aviation')).toHaveCount(0);
    await expect(page.locator('#before-after')).toHaveCount(0);
  });

  test('keeps About in nav and Meet Marcelo as page section title', async ({
    page,
  }) => {
    await page.goto('/en');
    await expect(
      page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
        name: 'About',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Meet Marcelo', level: 2 }),
    ).toBeVisible();
    await expect(page.getByText('Marine refinishing')).toHaveCount(0);
  });

  test('renders Spanish homepage content', async ({ page }) => {
    await page.goto('/es');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Oficio que se nota/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Conozca a Marcelo', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Cómo podemos ayudar', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Qué puede esperar', level: 2 }),
    ).toBeVisible();
  });

  test('primary CTAs navigate to estimate and projects routes', async ({
    page,
  }) => {
    await page.goto('/en');
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Request an Estimate' })
      .click();
    await expect(page).toHaveURL(/\/en\/estimate-request/);

    await page.goto('/en');
    await page
      .locator('#main-content')
      .getByRole('link', { name: 'View Our Work' })
      .first()
      .click();
    await expect(page).toHaveURL(/\/en\/projects/);
  });

  test('mobile homepage remains usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Request an Estimate' }).first(),
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
      page.getByRole('heading', { name: 'Meet Marcelo', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Request an Estimate' }).first(),
    ).toBeVisible();
  });

  test('initial HTML includes hero content before client animation', async ({
    request,
  }) => {
    const response = await request.get('/en');
    const html = await response.text();
    expect(html).toContain('Craftsmanship That Shows in Every Finish');
    expect(html).toContain('Meet Marcelo');
    expect(html).toContain("I've worked in professional refinishing");
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
});

test.describe('Before & after route', () => {
  test('before/after slider semantics stay aligned for keyboard users', async ({
    page,
  }) => {
    await page.goto('/en/before-after');
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

    await expect(section.getByText(/Placeholder Image/i)).toBeVisible();
  });

  test('Spanish before/after aria-valuetext is localized', async ({ page }) => {
    await page.goto('/es/before-after');
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

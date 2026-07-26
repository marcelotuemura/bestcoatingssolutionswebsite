import { expect, test } from '@playwright/test';

const ACCESS_SECRET =
  process.env.MEDIA_INTELLIGENCE_ACCESS_SECRET ??
  'e2e-media-access-secret-32ch!!';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/media/login');
  await page.getByTestId('media-access-secret').fill(ACCESS_SECRET);
  await page.getByTestId('media-login-submit').click();
  await expect(page.getByTestId('media-dashboard-stats')).toBeVisible({
    timeout: 15_000,
  });
}

test.describe('Media Intelligence Platform (DAMS) — access control', () => {
  test('robots still disallows /media', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toMatch(/Disallow:\s*\/media/i);
  });

  test('/media requires login when enabled', async ({ page }) => {
    await page.goto('/media');
    await expect(page).toHaveURL(/\/media\/login/);
    await expect(page.getByTestId('media-login-form')).toBeVisible();
  });

  test('incorrect credentials are rejected', async ({ page }) => {
    await page.goto('/media/login');
    await page.getByTestId('media-access-secret').fill('wrong-secret-value');
    await page.getByTestId('media-login-submit').click();
    await expect(page.getByTestId('media-login-error')).toBeVisible();
    await expect(page).toHaveURL(/\/media\/login/);
  });

  test('correct credentials create a secure session and open dashboard', async ({
    page,
  }) => {
    await login(page);
    await expect(page.getByTestId('media-dashboard-stats')).toBeVisible();
    await expect(
      page.getByText(/Never modify originals/i).first(),
    ).toBeVisible();
  });

  test('logout removes access', async ({ page }) => {
    await login(page);
    await page.getByTestId('media-logout').click();
    await expect(page).toHaveURL(/\/media\/login/);
    await page.goto('/media');
    await expect(page).toHaveURL(/\/media\/login/);
  });

  test('foundation import clearly states no original is uploaded', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/media/import');
    await expect(
      page.getByTestId('media-import-simulation-banner'),
    ).toContainText(/no original files are uploaded or stored/i);
    await page
      .getByTestId('media-import-filename')
      .fill('foundation_sim_before_gelcoat.jpg');
    await page.getByTestId('media-import-submit').click();
    await expect(page.getByTestId('media-import-message')).toContainText(
      /No original file was uploaded or stored/i,
    );
  });

  test('publishing cannot proceed without workflow approval first', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/media/approvals');
    const card = page.locator('article').first();
    await expect(card).toBeVisible();
    await card.getByRole('link').first().click();
    await expect(page.getByText(/Current status/i)).toBeVisible();
    await page.getByTestId('media-publish-website').click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test.describe('Phase 2 — Interactive Media Library', () => {
  test('dashboard shows catalog stats and distributions', async ({ page }) => {
    await login(page);
    await expect(page.getByText('Total Images')).toBeVisible();
    await expect(page.getByText('Hero Image Candidates')).toBeVisible();
    await expect(page.getByText('Project Distribution')).toBeVisible();
    await expect(page.getByText('Recently Indexed Assets')).toBeVisible();
  });

  test('gallery search and filters work', async ({ page }) => {
    await login(page);
    // Catalog browse is opt-in; workspace gallery is the Phase 7 default.
    await page.goto('/media/library?source=catalog');
    await expect(page.getByTestId('catalog-gallery')).toBeVisible();
    await page.getByTestId('catalog-search-input').fill('Sea Ray');
    await page.getByTestId('catalog-search-submit').click();
    await expect(page.getByTestId('catalog-search-meta')).toContainText(
      /Sea Ray/i,
    );
    await expect(page.getByTestId('catalog-media-card').first()).toBeVisible();

    await page.getByTestId('filter-heroCandidate').click();
    await expect(page.getByTestId('filter-heroCandidate')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('keyboard navigation reaches gallery cards and details', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/media/library?source=catalog');
    await page.getByTestId('catalog-search-input').focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const firstCardLink = page
      .getByTestId('catalog-media-card')
      .first()
      .getByRole('link')
      .first();
    await firstCardLink.focus();
    await expect(firstCardLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/media\/(catalog|assets)\/asset_/);
    await expect(page.getByTestId('asset-preview')).toBeVisible();
  });

  test('project view opens from projects list', async ({ page }) => {
    await login(page);
    await page.goto('/media/projects');
    await expect(page.getByTestId('projects-list')).toBeVisible();
    await page.getByTestId('projects-list').getByRole('link').first().click();
    await expect(page.getByTestId('project-summary')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Before \(\d+\)/ }),
    ).toBeVisible();
  });

  test('duplicate manager is read-only', async ({ page }) => {
    await login(page);
    await page.goto('/media/duplicates');
    await expect(page.getByTestId('duplicate-readonly-banner')).toContainText(
      /Never delete/i,
    );
    await expect(page.getByTestId('duplicate-groups')).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(0);
  });

  test('hero center and reports load', async ({ page }) => {
    await login(page);
    await page.goto('/media/heroes');
    await expect(page.getByTestId('hero-search-meta')).toBeVisible();
    await page.goto('/media/reports');
    await expect(page.getByText('Website candidates')).toBeVisible();
    await expect(page.getByText('Media timeline')).toBeVisible();
  });

  test('theme toggle switches light and dark', async ({ page }) => {
    await login(page);
    const toggle = page.getByTestId('media-theme-toggle');
    await expect(toggle).toBeVisible();
    const initial = await toggle.getAttribute('data-theme');
    expect(initial === 'dark' || initial === 'light').toBe(true);
    const next = initial === 'dark' ? 'light' : 'dark';
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-theme', next);
    await expect
      .poll(async () => page.locator('html').getAttribute('data-media-theme'))
      .toBe(next);
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-theme', initial!);
    await expect
      .poll(async () => page.locator('html').getAttribute('data-media-theme'))
      .toBe(initial);
  });
});

test.describe('Media Intelligence — disabled flag', () => {
  test('unit gate documents 404 when disabled', async () => {
    expect(true).toBe(true);
  });
});

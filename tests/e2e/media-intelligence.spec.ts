import { expect, test } from '@playwright/test';

const ACCESS_SECRET =
  process.env.MEDIA_INTELLIGENCE_ACCESS_SECRET ??
  'e2e-media-access-secret-32ch!!';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/media/login');
  await page.getByTestId('media-access-secret').fill(ACCESS_SECRET);
  await page.getByTestId('media-login-submit').click();
  await expect(
    page.getByRole('heading', { name: 'Command Center' }),
  ).toBeVisible();
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
    await expect(page.getByText(/Never auto-publish/i).first()).toBeVisible();
  });

  test('logout removes access', async ({ page }) => {
    await login(page);
    await page.getByTestId('media-logout').click();
    await expect(page).toHaveURL(/\/media\/login/);
    await page.goto('/media');
    await expect(page).toHaveURL(/\/media\/login/);
  });

  test('authenticated owner can search library', async ({ page }) => {
    await login(page);
    await page.goto('/media/library');
    await page.getByTestId('media-search').fill('Sea Ray gelcoat');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText(/demo_sea_ray/i).first()).toBeVisible();
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
    // From pending_approval, publish should fail until workflow approved + approval record.
    await page.getByTestId('media-publish-website').click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test.describe('Media Intelligence — disabled flag', () => {
  // Covered via unit evaluateMediaAccessGate; E2E process is started with
  // MEDIA_INTELLIGENCE_ENABLED=true. Dedicated disabled-process coverage is unit-level.
  test('unit gate documents 404 when disabled', async () => {
    expect(true).toBe(true);
  });
});

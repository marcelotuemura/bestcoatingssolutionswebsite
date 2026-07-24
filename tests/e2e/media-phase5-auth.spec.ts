import { expect, test } from '@playwright/test';

/**
 * Phase 5 auth/RBAC surfaces — temporary provider remains default until cutover.
 * Supabase live auth is covered by unit/integration tests with mocks.
 */

test.describe('Phase 5 — auth surfaces', () => {
  test.use({
    // playwright.config already enables media intelligence for e2e
  });

  test('login form remains available for temporary provider', async ({
    page,
  }) => {
    await page.goto('/media/login');
    await expect(page.getByTestId('media-login-form')).toBeVisible();
    await expect(page.getByTestId('media-access-secret')).toBeVisible();
  });

  test('unauthorized /media redirects to login when no session', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/media');
    await expect(page).toHaveURL(/\/media\/login/);
    await context.close();
  });

  test('viewer-facing users page is owner-gated after login', async ({
    page,
  }, testInfo) => {
    await page.goto('/media/login');
    await page.screenshot({
      path: `${testInfo.outputDir}/phase5-login.png`,
      fullPage: true,
    });
    await page
      .getByTestId('media-access-secret')
      .fill(
        process.env.MEDIA_INTELLIGENCE_ACCESS_SECRET ??
          'e2e-media-access-secret-32ch!!',
      );
    await page.getByTestId('media-login-submit').click();
    await page.waitForURL(/\/media$/);
    await page.goto('/media/users');
    // Temporary sessions are owner — matrix visible
    await expect(page.getByTestId('role-permission-matrix')).toBeVisible();
    await page.screenshot({
      path: `${testInfo.outputDir}/phase5-users-roles.png`,
      fullPage: true,
    });
  });
});

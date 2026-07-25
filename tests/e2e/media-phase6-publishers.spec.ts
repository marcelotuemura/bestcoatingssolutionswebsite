import { expect, test } from '@playwright/test';

const secret = process.env.MEDIA_INTELLIGENCE_ACCESS_SECRET!;

async function login(page: import('@playwright/test').Page) {
  await page.goto('/media/login');
  await page.getByTestId('media-access-secret').fill(secret);
  await page.getByTestId('media-login-submit').click();
  await page.waitForURL(/\/media(?!\/login)/);
}

test.describe('Phase 6 — Publications', () => {
  test.skip(
    !process.env.MEDIA_INTELLIGENCE_ENABLED ||
      process.env.MEDIA_INTELLIGENCE_ENABLED === 'false',
    'Media intelligence disabled',
  );

  test('publication queue and draft creation', async ({ page }) => {
    await login(page);
    await page.goto('/media/publications');
    await expect(page.getByTestId('publication-readiness')).toBeVisible();
    await expect(page.getByTestId('publication-draft-form')).toBeVisible();

    await page.getByTestId('publication-title').fill('Phase 6 portfolio draft');
    await page.getByTestId('publication-alt').fill('Demo after repair');
    await page.getByTestId('publication-create').click();
    await Promise.race([
      page.waitForURL(
        (url) =>
          /^\/media\/publications\/[0-9a-f-]{36}$/i.test(url.pathname) &&
          !url.pathname.startsWith('/en/') &&
          !url.pathname.startsWith('/es/'),
        { timeout: 20_000 },
      ),
      page
        .getByTestId('publication-form-error')
        .waitFor({ state: 'visible', timeout: 20_000 })
        .then(async () => {
          throw new Error(
            `draft create failed: ${await page.getByTestId('publication-form-error').innerText()}`,
          );
        }),
    ]);

    expect(page.url()).toMatch(/\/media\/publications\/[0-9a-f-]{36}$/i);
    expect(page.url()).not.toMatch(/\/(en|es)\/media\//);

    await expect(page.getByTestId('publication-detail')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('publication-detail-provider')).toContainText(
      /not_configured|draft_ready/,
    );

    await page.getByTestId('publication-approve').click();
    await expect(page.getByTestId('publication-action-message')).toBeVisible({
      timeout: 10_000,
    });

    await page.getByTestId('publication-execute').click();
    await expect(page.getByTestId('publication-action-message')).toContainText(
      /provider not configured|Draft ready/i,
      { timeout: 10_000 },
    );
    await expect(
      page.getByTestId('publication-detail-status'),
    ).not.toContainText('Externally published');
    await expect(
      page.getByTestId('publication-detail-provider'),
    ).not.toContainText('delivered');
  });
});

/**
 * Capture Media Library screenshots for Phase 2 deliverables.
 * Assumes Next.js is already running with media env on PORT (default 3000).
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const PORT = process.env.PORT ?? '3000';
const BASE = `http://127.0.0.1:${PORT}`;
const ACCESS =
  process.env.MEDIA_INTELLIGENCE_ACCESS_SECRET ??
  'e2e-media-access-secret-32ch!!';
const OUT = '/opt/cursor/artifacts/screenshots';

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(`${BASE}/media/login`);
  await page.getByTestId('media-access-secret').fill(ACCESS);
  await page.getByTestId('media-login-submit').click();
  await page.getByTestId('media-dashboard-stats').waitFor();

  const shots = [
    ['media-dashboard', '/media'],
    ['media-gallery', '/media/library'],
    ['media-heroes', '/media/heroes'],
    ['media-duplicates', '/media/duplicates'],
    ['media-reports', '/media/reports'],
    ['media-projects', '/media/projects'],
  ];

  for (const [name, route] of shots) {
    await page.goto(`${BASE}${route}`);
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(OUT, `${name}.png`),
      fullPage: true,
    });
    console.warn(`saved ${name}.png`);
  }

  // Light mode dashboard
  await page.goto(`${BASE}/media`);
  await page.getByTestId('media-theme-toggle').click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT, 'media-dashboard-light.png'),
    fullPage: true,
  });
  console.warn('saved media-dashboard-light.png');

  // Asset detail
  await page.goto(`${BASE}/media/library`);
  await page
    .getByTestId('catalog-media-card')
    .first()
    .getByRole('link')
    .first()
    .click();
  await page.getByTestId('asset-preview').waitFor();
  await page.screenshot({
    path: path.join(OUT, 'media-asset-detail.png'),
    fullPage: true,
  });
  console.warn('saved media-asset-detail.png');

  // Project detail
  await page.goto(`${BASE}/media/projects`);
  await page.getByTestId('projects-list').getByRole('link').first().click();
  await page.getByTestId('project-summary').waitFor();
  await page.screenshot({
    path: path.join(OUT, 'media-project-detail.png'),
    fullPage: true,
  });
  console.warn('saved media-project-detail.png');

  // Mobile gallery
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${BASE}/media/library`);
  await page.getByTestId('catalog-gallery').waitFor();
  await page.screenshot({
    path: path.join(OUT, 'media-gallery-tablet.png'),
    fullPage: true,
  });
  console.warn('saved media-gallery-tablet.png');

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

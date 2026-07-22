import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const out = '/opt/cursor/artifacts/screenshots';
mkdirSync(out, { recursive: true });
const port = 3415;
const server = spawn('pnpm', ['exec', 'next', 'start', '-p', String(port)], {
  cwd: '/workspace',
  stdio: 'pipe',
  env: { ...process.env, PORT: String(port) },
});

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/en/contact`)).ok) return;
    } catch {
      // retry
    }
    await sleep(500);
  }
  throw new Error('not ready');
}

const shots = [
  ['phase4-contact-desktop', 1440, 900, '/en/contact', null],
  ['phase4-contact-mobile', 390, 844, '/en/contact', null],
  ['phase4-estimate-step1', 1440, 900, '/en/estimate-request', null],
  ['phase4-schedule', 1440, 900, '/en/schedule-visit', null],
  ['phase4-thank-you', 1440, 900, '/en/thank-you?type=estimate', null],
  ['phase4-privacy', 1440, 900, '/en/privacy', null],
  ['phase4-terms', 1440, 900, '/en/terms', null],
  ['phase4-404', 1440, 900, '/en/missing-page', null],
  ['phase4-estimate-es', 1440, 900, '/es/estimate-request', null],
];

try {
  await waitReady();
  const browser = await chromium.launch();

  // Static pages
  for (const [name, width, height, path] of shots) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}${path}`, {
      waitUntil: 'networkidle',
    });
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: false });
    await context.close();
  }

  // Estimate interactive steps
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/en/estimate-request`, {
    waitUntil: 'networkidle',
  });
  await page.getByLabel(/Full name/i).fill('Alex Rivera');
  await page.getByLabel(/^Email/i).fill('alex@example.com');
  await page.getByLabel(/^Phone/i).fill('305-555-0100');
  await page.getByTestId('estimate-next').click();
  await page.getByLabel(/Manufacturer/i).fill('Sea Ray');
  await page.getByLabel(/^Model/i).fill('Sundancer');
  await page.getByLabel(/^Year/i).fill('2019');
  await page.getByLabel(/Length/i).fill('40');
  await page.getByLabel(/Current vessel location/i).fill('Fort Lauderdale');
  await page.getByTestId('estimate-next').click();
  await page.screenshot({
    path: `${out}/phase4-estimate-services.png`,
    fullPage: false,
  });
  await page.locator('#service-gelcoat-repair').check();
  await page.getByTestId('estimate-next').click();
  await page
    .getByLabel(/Damage description/i)
    .fill('Starboard gelcoat crack near the swim platform needs repair.');
  await page.getByTestId('estimate-next').click();
  await page.screenshot({
    path: `${out}/phase4-estimate-photos.png`,
    fullPage: false,
  });
  await page.getByTestId('estimate-next').click();
  await page.screenshot({
    path: `${out}/phase4-estimate-review.png`,
    fullPage: false,
  });

  // Validation errors
  await page.goto(`http://127.0.0.1:${port}/en/contact`, {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('contact-submit').click();
  await page.getByTestId('form-error-summary').waitFor();
  await page.screenshot({
    path: `${out}/phase4-validation-errors.png`,
    fullPage: false,
  });

  await context.close();
  await browser.close();
  console.log('screenshots ok');
} finally {
  server.kill('SIGTERM');
}

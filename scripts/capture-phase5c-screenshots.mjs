/**
 * Phase 5C evidence screenshots.
 * Requires `.next` production build. Run from repo root:
 *   node scripts/capture-phase5c-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = '/opt/cursor/artifacts/phase5c-screenshots';
await mkdir(out, { recursive: true });
const PORT = Number(process.env.PHASE5C_SHOT_PORT ?? 3027);
const base = `http://127.0.0.1:${PORT}`;

const child = spawn('pnpm', ['exec', 'next', 'start', '-p', String(PORT)], {
  cwd: root,
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});

for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(base);
    if (r.ok || r.status < 500) break;
  } catch {
    /* retry */
  }
  await sleep(500);
}

const browser = await chromium.launch();

async function shot(page, name) {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: false });
  console.log('wrote', name);
}

// Desktop header on dark + routes
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/en`, { waitUntil: 'networkidle' });
  await shot(page, 'header-desktop-dark-1440');
  await page.goto(`${base}/en/marine`, { waitUntil: 'networkidle' });
  await shot(page, 'marine-desktop-1440');
  await page.goto(`${base}/en/aviation`, { waitUntil: 'networkidle' });
  await shot(page, 'aviation-desktop-1440');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(300);
  await shot(page, 'footer-desktop-1440');
  await page.goto(`${base}/en/about`, { waitUntil: 'networkidle' });
  await expectActive(page, 'About');
  await shot(page, 'nav-active-about-1440');
  await page.goto(`${base}/es`, { waitUntil: 'networkidle' });
  await shot(page, 'header-spanish-1440');
  await ctx.close();
}

// Tablet
{
  const ctx = await browser.newContext({
    viewport: { width: 1024, height: 768 },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/en`, { waitUntil: 'networkidle' });
  await shot(page, 'header-tablet-1024');
  await ctx.close();
}

// Mobile closed / open
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/en`, { waitUntil: 'networkidle' });
  await shot(page, 'mobile-header-closed-390');
  await page.getByTestId('mobile-nav-open').click();
  await page.getByTestId('mobile-nav-panel').waitFor({ state: 'visible' });
  await shot(page, 'mobile-header-open-390');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByTestId('mobile-nav-close').click();
  await page.goto(`${base}/en/aviation`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(300);
  await shot(page, 'footer-mobile-390');
  await ctx.close();
}

// Keyboard focus evidence on desktop nav
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/en`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab'); // brand
  await page.keyboard.press('Tab'); // first nav
  await shot(page, 'keyboard-nav-focus-1440');
  await ctx.close();
}

await browser.close();
child.kill('SIGTERM');
console.log('done →', out);

async function expectActive(page, name) {
  const link = page.getByTestId('primary-nav').getByRole('link', { name });
  await link.waitFor({ state: 'visible' });
}

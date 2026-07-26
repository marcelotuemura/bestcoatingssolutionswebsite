/**
 * Phase 5G About page evidence.
 * Requires `.next` production build:
 *   node scripts/capture-phase5g-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = '/opt/cursor/artifacts/phase5g-screenshots';
await mkdir(out, { recursive: true });
const PORT = Number(process.env.PHASE5G_SHOT_PORT ?? 3031);
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

async function shot(page, name, fullPage = false) {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage });
  console.log('wrote', name);
}

for (const vp of [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1366', width: 1366, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'iphone-390', width: 390, height: 844 },
]) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/en/about`, { waitUntil: 'networkidle' });
  await shot(page, `about-${vp.name}-hero`);
  await shot(page, `about-${vp.name}-full`, true);
  await page.locator('#why-bcs-exists').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, `about-${vp.name}-why`);
  await page.getByTestId('about-standards').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, `about-${vp.name}-standards`);
  await page
    .getByTestId('about-professional-background')
    .scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, `about-${vp.name}-background`);
  await page.locator('#estimate-cta').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, `about-${vp.name}-invitation`);
  await ctx.close();
}

{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/es/about`, { waitUntil: 'networkidle' });
  await shot(page, 'about-spanish-1440-hero');
  await page.getByTestId('about-standards').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, 'about-spanish-1440-standards');
  await ctx.close();
}

await browser.close();
child.kill('SIGTERM');
console.log('done →', out);

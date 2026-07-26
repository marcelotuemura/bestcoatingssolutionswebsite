/**
 * Phase 5F Aviation division evidence.
 * Requires `.next` production build:
 *   node scripts/capture-phase5f-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = '/opt/cursor/artifacts/phase5f-screenshots';
await mkdir(out, { recursive: true });
const PORT = Number(process.env.PHASE5F_SHOT_PORT ?? 3030);
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
  await page.goto(`${base}/en/aviation`, { waitUntil: 'networkidle' });
  await shot(page, `aviation-${vp.name}-hero`);
  await shot(page, `aviation-${vp.name}-full`, true);
  await page.getByTestId('division-process').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, `aviation-${vp.name}-process`);
  await page.locator('#capabilities').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, `aviation-${vp.name}-capabilities`);
  await page.locator('#scope').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, `aviation-${vp.name}-scope`);
  await ctx.close();
}

{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/es/aviation`, { waitUntil: 'networkidle' });
  await shot(page, 'aviation-spanish-1440-hero');
  await page.getByTestId('division-process').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, 'aviation-spanish-1440-process');
  // Side-by-side brand consistency: marine vs aviation heroes
  await page.goto(`${base}/en/marine`, { waitUntil: 'networkidle' });
  await shot(page, 'compare-marine-hero-1440');
  await page.goto(`${base}/en/aviation`, { waitUntil: 'networkidle' });
  await shot(page, 'compare-aviation-hero-1440');
  await ctx.close();
}

await browser.close();
child.kill('SIGTERM');
console.log('done →', out);

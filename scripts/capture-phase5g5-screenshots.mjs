/**
 * Phase 5G.5 Brand Consistency Audit evidence.
 * Requires `.next` production build:
 *   node scripts/capture-phase5g5-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = '/opt/cursor/artifacts/phase5g5-screenshots';
await mkdir(out, { recursive: true });
const PORT = Number(process.env.PHASE5G5_SHOT_PORT ?? 3033);
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

const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

for (const route of [
  { path: '/en', name: 'home' },
  { path: '/en/marine', name: 'marine' },
  { path: '/en/aviation', name: 'aviation' },
  { path: '/en/about', name: 'about' },
  { path: '/en/projects', name: 'projects' },
  { path: '/en/contact', name: 'contact' },
]) {
  await page.goto(`${base}${route.path}`, { waitUntil: 'networkidle' });
  await sleep(400);
  await shot(page, `${route.name}-hero`);
  const cta = page.getByTestId('header-primary-cta');
  if (await cta.count()) {
    await shot(page, `${route.name}-header-cta`);
  }
}

await page.goto(`${base}/en/aviation`, { waitUntil: 'networkidle' });
await sleep(300);
await expectCta(page, 'contact');
await page.goto(`${base}/en/about`, { waitUntil: 'networkidle' });
await sleep(300);
await expectCta(page, 'contact');
await page.goto(`${base}/en/marine`, { waitUntil: 'networkidle' });
await sleep(300);
await expectCta(page, 'estimate');

await page.goto(`${base}/es/services/color-matching`, {
  waitUntil: 'networkidle',
});
await sleep(300);
await shot(page, 'es-color-matching-hero');

await ctx.close();
await browser.close();
child.kill('SIGTERM');
console.log('done →', out);

async function expectCta(page, mode) {
  const cta = page.getByTestId('header-primary-cta');
  const attr = await cta.getAttribute('data-cta-mode');
  if (attr !== mode) {
    throw new Error(`Expected header CTA mode ${mode}, got ${attr}`);
  }
  await shot(page, `header-cta-${mode}`);
}

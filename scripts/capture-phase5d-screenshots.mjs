/**
 * Phase 5D homepage evidence screenshots.
 * Requires `.next` production build:
 *   node scripts/capture-phase5d-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = '/opt/cursor/artifacts/phase5d-screenshots';
await mkdir(out, { recursive: true });
const PORT = Number(process.env.PHASE5D_SHOT_PORT ?? 3028);
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

const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1366', width: 1366, height: 768 },
  { name: 'tablet-portrait-768', width: 768, height: 1024 },
  { name: 'tablet-landscape-1024', width: 1024, height: 768 },
  { name: 'iphone-portrait-390', width: 390, height: 844 },
  { name: 'iphone-landscape-844', width: 844, height: 390 },
];

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/en`, { waitUntil: 'networkidle' });
  await shot(page, `home-${vp.name}-hero`);
  await shot(page, `home-${vp.name}-full`, true);
  await page.locator('#divisions').scrollIntoViewIfNeeded();
  await sleep(250);
  await shot(page, `home-${vp.name}-divisions`);
  await ctx.close();
}

// Hero height ladder
for (const height of [700, 900, 1100]) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/en`, { waitUntil: 'networkidle' });
  await shot(page, `home-hero-height-${height}`);
  await ctx.close();
}

// Division interactions
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/en`, { waitUntil: 'networkidle' });
  await page.getByTestId('division-marine').scrollIntoViewIfNeeded();
  await page
    .getByTestId('division-marine')
    .getByRole('link', { name: /Explore Marine/i })
    .hover();
  await sleep(200);
  await shot(page, 'division-marine-cta-hover');
  await page.getByTestId('division-aviation').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, 'division-aviation-focus');
  await page.locator('#featured-project').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, 'featured-work-stages');
  await page.locator('#request-estimate').scrollIntoViewIfNeeded();
  await sleep(200);
  await shot(page, 'estimate-cta');
  await ctx.close();
}

// Spanish homepage
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/es`, { waitUntil: 'networkidle' });
  await shot(page, 'home-spanish-1440-hero');
  await ctx.close();
}

// Lightweight performance / CLS / LCP observations via PerformanceObserver APIs
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/en`, { waitUntil: 'networkidle' });
  const metrics = await page.evaluate(async () => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paints = performance.getEntriesByType('paint');
    let lcp = null;
    try {
      const list = await new Promise((resolve) => {
        const entries = [];
        const observer = new PerformanceObserver((list) => {
          entries.push(...list.getEntries());
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(entries);
        }, 500);
      });
      const last = list[list.length - 1];
      lcp = last
        ? {
            startTime: last.startTime,
            size: last.size,
            tag: last.element?.tagName,
          }
        : null;
    } catch {
      lcp = null;
    }
    let cls = 0;
    try {
      const shifts = await new Promise((resolve) => {
        const entries = [];
        const observer = new PerformanceObserver((list) => {
          entries.push(...list.getEntries());
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(entries);
        }, 300);
      });
      cls = shifts
        .filter((entry) => !entry.hadRecentInput)
        .reduce((sum, entry) => sum + entry.value, 0);
    } catch {
      cls = -1;
    }
    return {
      domContentLoaded: nav?.domContentLoadedEventEnd ?? null,
      loadEventEnd: nav?.loadEventEnd ?? null,
      fcp:
        paints.find((p) => p.name === 'first-contentful-paint')?.startTime ??
        null,
      lcp,
      cls,
      transferSize: nav?.transferSize ?? null,
    };
  });
  await writeFile(
    `${out}/perf-observations.json`,
    JSON.stringify(metrics, null, 2),
  );
  console.log('wrote perf-observations.json', metrics);
  await ctx.close();
}

await browser.close();
child.kill('SIGTERM');
console.log('done →', out);

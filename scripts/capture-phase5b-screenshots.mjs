import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
const PORT = 3026;
const base = `http://127.0.0.1:${PORT}`;
const out = '/opt/cursor/artifacts/phase5b-screenshots';
const child = spawn('pnpm', ['exec', 'next', 'start', '-p', String(PORT)], {
  cwd: '/workspace',
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(base);
    if (r.ok || r.status < 500) break;
  } catch {}
  await sleep(500);
}
const browser = await chromium.launch();
for (const [w, h, label] of [
  [1440, 900, 'desktop'],
  [390, 844, 'mobile'],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(base + '/en/design-system', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.screenshot({
    path: `${out}/design-system-${label}-${w}.png`,
    fullPage: true,
  });
  await page.goto(base + '/en', { waitUntil: 'networkidle', timeout: 60000 });
  await page.screenshot({
    path: `${out}/home-type-${label}-${w}.png`,
    fullPage: false,
  });
  await ctx.close();
  console.log('ok', label);
}
await browser.close();
child.kill('SIGTERM');

/**
 * Phase 5A current-state screenshots (desktop 1440 + mobile 390).
 * Requires an existing `.next` production build.
 *
 * Usage: node scripts/capture-phase5a-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = '/opt/cursor/artifacts/phase5a-screenshots';
await mkdir(out, { recursive: true });
const PORT = Number(process.env.PHASE5A_SHOT_PORT ?? 3025);
const base = `http://127.0.0.1:${PORT}`;

const child = spawn('pnpm', ['exec', 'next', 'start', '-p', String(PORT)], {
  cwd: root,
  env: { ...process.env, PORT: String(PORT), BCS_INCLUDE_TEST_FIXTURES: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let ready = false;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(base);
    if (r.ok || r.status < 500) {
      ready = true;
      break;
    }
  } catch {
    /* retry */
  }
  await sleep(500);
}
if (!ready) {
  console.error('server failed to start');
  child.kill();
  process.exit(1);
}

const browser = await chromium.launch();
const pages = [
  { path: '/en', name: 'home' },
  { path: '/en/about', name: 'about' },
  { path: '/en/marine', name: 'marine' },
  { path: '/en/aviation', name: 'aviation' },
  { path: '/en/projects', name: 'projects' },
  { path: '/en/contact', name: 'contact' },
];
const viewports = [
  { w: 1440, h: 900, label: 'desktop' },
  { w: 390, h: 844, label: 'mobile' },
];

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
  });
  const page = await context.newPage();
  for (const p of pages) {
    await page.goto(base + p.path, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.screenshot({
      path: `${out}/${p.name}-${vp.label}-${vp.w}.png`,
      fullPage: true,
    });
    console.log('wrote', `${p.name}-${vp.label}-${vp.w}.png`);
  }
  await context.close();
}

await browser.close();
child.kill('SIGTERM');
console.log('done →', out);

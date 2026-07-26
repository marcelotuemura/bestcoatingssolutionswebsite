/**
 * Capture Phase 7 Visual Gallery screenshots with CSS loaded and a real upload.
 * Requires MEDIA_PUBLICATION_DATABASE_URL (or runs bootstrap).
 */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import sharp from 'sharp';

const out = '/opt/cursor/artifacts/screenshots';
await mkdir(out, { recursive: true });

const secret =
  process.env.MEDIA_INTELLIGENCE_ACCESS_SECRET ??
  'e2e-media-access-secret-32ch!!';
const port = process.env.PHASE7_CAPTURE_PORT ?? '3027';

async function ensureDbUrl() {
  if (process.env.MEDIA_PUBLICATION_DATABASE_URL) {
    return process.env.MEDIA_PUBLICATION_DATABASE_URL;
  }
  return await new Promise((resolve, reject) => {
    const child = spawn(
      'pnpm',
      [
        'exec',
        'node',
        '--import',
        './scripts/register-ts-alias.mjs',
        '--experimental-strip-types',
        'scripts/bootstrap-publication-pg.ts',
      ],
      { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`bootstrap failed: ${stderr || stdout}`));
        return;
      }
      const lines = stdout.trim().split('\n').filter(Boolean);
      resolve(lines[lines.length - 1]);
    });
  });
}

const dbUrl = await ensureDbUrl();
console.log('DB ready');

console.log('Building…');
await new Promise((resolve, reject) => {
  const child = spawn('pnpm', ['build'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      MEDIA_PUBLICATION_DATABASE_URL: dbUrl,
      DATABASE_URL: dbUrl,
      MEDIA_PUBLICATION_REPOSITORY: 'postgres',
      MEDIA_INTELLIGENCE_ENABLED: 'true',
      MEDIA_INTELLIGENCE_ACCESS_SECRET: secret,
      MEDIA_INTELLIGENCE_SESSION_SECRET:
        process.env.MEDIA_INTELLIGENCE_SESSION_SECRET ??
        'e2e-media-session-secret-32ch!',
    },
    stdio: 'inherit',
  });
  child.on('exit', (code) =>
    code === 0 ? resolve() : reject(new Error(`build failed ${code}`)),
  );
});

const env = {
  ...process.env,
  MEDIA_PUBLICATION_DATABASE_URL: dbUrl,
  DATABASE_URL: dbUrl,
  MEDIA_PUBLICATION_REPOSITORY: 'postgres',
  MEDIA_INTELLIGENCE_ENABLED: 'true',
  MEDIA_INTELLIGENCE_ACCESS_SECRET: secret,
  MEDIA_INTELLIGENCE_SESSION_SECRET:
    process.env.MEDIA_INTELLIGENCE_SESSION_SECRET ??
    'e2e-media-session-secret-32ch!',
  MEDIA_LOGIN_RATE_LIMIT_MAX: '500',
  PORT: String(port),
};

const server = spawn('pnpm', ['exec', 'next', 'start', '-p', String(port)], {
  cwd: process.cwd(),
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let ready = false;
for (let i = 0; i < 60; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/media/login`);
    if (res.status < 500) {
      ready = true;
      break;
    }
  } catch {
    // retry
  }
  await sleep(1000);
}
if (!ready) {
  server.kill('SIGTERM');
  throw new Error('Server failed to start');
}

const browser = await chromium.launch();
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});

async function login(page) {
  await page.goto(`http://127.0.0.1:${port}/media/login`, {
    waitUntil: 'networkidle',
  });
  await page.getByTestId('media-access-secret').fill(secret);
  await page.getByTestId('media-login-submit').click();
  await page.waitForURL(/\/media(?!\/login)/);
}

await login(desktop);

// Upload a real colorful image so thumbnails are visible
const imageBuf = await sharp({
  create: {
    width: 1200,
    height: 800,
    channels: 3,
    background: { r: 12, g: 74, b: 110 },
  },
})
  .jpeg({ quality: 90 })
  .composite([
    {
      input: Buffer.from(
        `<svg width="1200" height="800"><rect width="1200" height="800" fill="#0c4a6e"/><text x="80" y="420" font-size="72" fill="#7dd3fc" font-family="Arial">BCS Gallery Upload</text></svg>`,
      ),
      top: 0,
      left: 0,
    },
  ])
  .toBuffer();

await desktop.goto(`http://127.0.0.1:${port}/media/upload`, {
  waitUntil: 'networkidle',
});
await desktop.waitForSelector('[data-testid="upload-dropzone"]');
await desktop.screenshot({
  path: `${out}/phase7-upload.png`,
  fullPage: true,
});

await desktop.getByTestId('file-input').setInputFiles({
  name: 'bcs-gallery-demo.jpg',
  mimeType: 'image/jpeg',
  buffer: imageBuf,
});
await desktop.waitForSelector('[data-testid="upload-file-list"]');
await desktop.getByTestId('upload-submit').click();

// Capture mid-upload if possible
await sleep(200);
await desktop.screenshot({
  path: `${out}/phase7-upload-progress.png`,
  fullPage: true,
});

await desktop
  .locator(
    '[data-testid="upload-file-done"], [data-testid="upload-file-duplicate"], [data-testid="upload-file-error"]',
  )
  .first()
  .waitFor({ timeout: 60_000 });

await desktop.screenshot({
  path: `${out}/phase7-upload.png`,
  fullPage: true,
});

const openPreview = desktop.locator('a[href*="/media/assets/"]').first();
let assetUrl = null;
if (await openPreview.count()) {
  assetUrl = await openPreview.getAttribute('href');
}

await desktop.goto(
  `http://127.0.0.1:${port}/media/library?source=workspace&view=grid`,
  { waitUntil: 'networkidle' },
);
await desktop.waitForTimeout(800);
await desktop.screenshot({
  path: `${out}/phase7-gallery-desktop.png`,
  fullPage: true,
});

if (assetUrl) {
  await desktop.goto(`http://127.0.0.1:${port}${assetUrl}`, {
    waitUntil: 'networkidle',
  });
  await desktop.waitForTimeout(600);
  await desktop.screenshot({
    path: `${out}/phase7-asset-preview.png`,
    fullPage: true,
  });
}

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
await login(mobile);
await mobile.goto(
  `http://127.0.0.1:${port}/media/library?source=workspace&view=grid`,
  { waitUntil: 'networkidle' },
);
await mobile.waitForTimeout(800);
await mobile.screenshot({
  path: `${out}/phase7-gallery-mobile.png`,
  fullPage: true,
});

await browser.close();
server.kill('SIGTERM');

await writeFile(
  `${out}/phase7-capture-meta.json`,
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      assetUrl,
      files: [
        'phase7-gallery-desktop.png',
        'phase7-gallery-mobile.png',
        'phase7-upload.png',
        'phase7-upload-progress.png',
        'phase7-asset-preview.png',
      ],
    },
    null,
    2,
  ),
);

console.log('Screenshots written to', out);

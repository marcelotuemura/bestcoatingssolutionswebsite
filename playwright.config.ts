import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * End-to-end test configuration.
 *
 * Playwright boots the production build (`next start`) so E2E runs mirror what
 * users receive. On CI the run is retried and parallelism is constrained for
 * deterministic results.
 *
 * Media Phase 6 publications require PostgreSQL — webServer bootstraps a local
 * publication database before `next build` / `next start`.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'bash scripts/playwright-with-publication-pg.sh',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      BCS_INCLUDE_TEST_FIXTURES: '1',
      MEDIA_INTELLIGENCE_ENABLED: 'true',
      MEDIA_INTELLIGENCE_ACCESS_SECRET: 'e2e-media-access-secret-32ch!!',
      MEDIA_INTELLIGENCE_SESSION_SECRET: 'e2e-media-session-secret-32ch!',
      MEDIA_INTELLIGENCE_LOCAL_BYPASS: 'false',
      MEDIA_LOGIN_RATE_LIMIT_MAX: '500',
      MEDIA_PUBLICATION_REPOSITORY: 'postgres',
      // Explicit opt-in only — not a production persistence mechanism.
      MEDIA_GALLERY_STORAGE_MODE: 'local',
      MEDIA_SUPABASE_ENV: 'development',
    },
  },
});

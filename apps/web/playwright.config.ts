import { defineConfig, devices } from '@playwright/test';

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Step 1 e2e smoke config. Boots `next dev` and runs a minimal RTL render
 * check. The full critical-journey suite is built in Step 17.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm dev`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

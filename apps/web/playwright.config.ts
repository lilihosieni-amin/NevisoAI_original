import { defineConfig, devices } from '@playwright/test';

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * e2e against a built/served web app. CI runs `next build` then `next start`
 * via the webServer below, then drives the home/health pages.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    locale: 'fa-IR',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

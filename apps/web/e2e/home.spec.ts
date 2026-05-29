import { test, expect } from '@playwright/test';

test('home page loads with Persian RTL content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.getByRole('heading', { name: 'نویسو' })).toBeVisible();
});

test('health page renders the service-up indicator', async ({ page }) => {
  await page.goto('/health');
  await expect(page.getByTestId('web-health')).toContainText('سرویس وب فعال است');
});

test('Vazirmatn is served from our own origin (no foreign CDN)', async ({ page }) => {
  const fontRequests: string[] = [];
  page.on('request', (req) => {
    if (req.resourceType() === 'font') fontRequests.push(req.url());
  });
  await page.goto('/');
  await page.waitForTimeout(500);
  for (const url of fontRequests) {
    expect(url).toContain('localhost:4000');
    expect(url).not.toMatch(/fonts\.(googleapis|gstatic)\.com|cdnjs|unpkg|jsdelivr/);
  }
});

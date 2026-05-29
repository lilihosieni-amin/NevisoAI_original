import { test, expect } from '@playwright/test';

test('admin home page loads with Persian RTL content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.getByRole('heading', { name: 'پنل مدیریت نویسو' })).toBeVisible();
});

test('admin health page renders the service-up indicator', async ({ page }) => {
  await page.goto('/health');
  await expect(page.getByTestId('admin-health')).toContainText('پنل مدیریت فعال است');
});

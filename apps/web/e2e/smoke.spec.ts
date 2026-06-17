import { test, expect } from '@playwright/test';

test('home renders RTL with Persian content', async ({ page }) => {
  await page.goto('/');
  // RTL is a hard requirement (ARD §3.2).
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.getByText('پلتفرم هوشمند جزوه‌نویسی')).toBeVisible();
});

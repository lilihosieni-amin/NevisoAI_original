import { test, expect, type Route } from '@playwright/test';

/**
 * Drives the admin two-step login (password → OTP → dashboard) against the
 * built admin app, with the GraphQL backend faked at the network boundary.
 */
function fakeGraphql(payloadFor: (op: string) => unknown) {
  return async (route: Route): Promise<void> => {
    const body = route.request().postDataJSON() as { operationName?: string };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payloadFor(body.operationName ?? '')),
    });
  };
}

test('admin completes two-step login and reaches the dashboard shell', async ({ page }) => {
  await page.route('**/graphql', (route) =>
    fakeGraphql((op) => {
      switch (op) {
        case 'AdminRefreshToken':
          return { errors: [{ message: 'forbidden', extensions: { code: 'ADMIN_FORBIDDEN' } }] };
        case 'AdminLoginStep1':
          return {
            data: {
              adminLoginStep1: {
                challengeId: 'c1',
                expiresIn: 300,
                maskedMobile: '0912****233',
                __typename: 'AdminLoginChallenge',
              },
            },
          };
        case 'AdminLoginStep2':
          return {
            data: {
              adminLoginStep2: {
                accessToken: 'fake-admin',
                admin: {
                  id: 'a1',
                  email: 'ops@nevisoai.ir',
                  displayName: 'اپس',
                  role: 'SUPER_ADMIN',
                  __typename: 'AdminProfile',
                },
                __typename: 'AdminAuthTokens',
              },
            },
          };
        case 'AdminMe':
          return {
            data: {
              adminMe: {
                id: 'a1',
                email: 'ops@nevisoai.ir',
                displayName: 'اپس',
                role: 'SUPER_ADMIN',
                __typename: 'AdminProfile',
              },
            },
          };
        default:
          return { data: {} };
      }
    })(route),
  );

  await page.goto('/login');

  await page.getByLabel('ایمیل').fill('ops@nevisoai.ir');
  await page.getByLabel('رمز عبور').fill('secret123');
  await page.getByRole('button', { name: 'ادامه' }).click();

  // OTP step (masked mobile shown).
  await expect(page.getByText(/0912\*\*\*\*233/)).toBeVisible();
  await page.getByLabel('کد تأیید').fill('123456');
  await page.getByRole('button', { name: 'ورود به پنل' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('admin-identity')).toContainText('مدیر ارشد');
});

test('wrong admin credentials show a Persian error, no leak', async ({ page }) => {
  await page.route('**/graphql', (route) =>
    fakeGraphql((op) => {
      if (op === 'AdminRefreshToken')
        return { errors: [{ message: 'x', extensions: { code: 'ADMIN_FORBIDDEN' } }] };
      if (op === 'AdminLoginStep1')
        return { errors: [{ message: 'nope', extensions: { code: 'ADMIN_CREDENTIALS_INVALID' } }] };
      return { data: {} };
    })(route),
  );

  await page.goto('/login');
  await page.getByLabel('ایمیل').fill('ghost@nevisoai.ir');
  await page.getByLabel('رمز عبور').fill('whatever1');
  await page.getByRole('button', { name: 'ادامه' }).click();

  await expect(page.getByText('ایمیل یا رمز عبور نادرست است.')).toBeVisible();
});

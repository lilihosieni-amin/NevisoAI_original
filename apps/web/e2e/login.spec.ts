import { test, expect, type Route } from '@playwright/test';

/**
 * Drives the user OTP login flow end-to-end against the built web app, with the
 * GraphQL backend faked at the network boundary (providers faked — the e2e
 * exercises the phone → channel picker → OTP → dashboard outcome).
 */
function fakeGraphql(payloadFor: (op: string) => unknown) {
  return async (route: Route): Promise<void> => {
    const body = route.request().postDataJSON() as { operationName?: string };
    const data = payloadFor(body.operationName ?? '');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  };
}

test('user logs in via OTP and lands on the dashboard with free credits', async ({ page }) => {
  await page.route('**/graphql', (route) =>
    fakeGraphql((op) => {
      switch (op) {
        case 'RefreshToken':
          // No existing session.
          return {
            errors: [{ message: 'UNAUTHENTICATED', extensions: { code: 'UNAUTHENTICATED' } }],
          };
        case 'OtpChannels':
          return { data: { otpChannels: ['SMS', 'BALE'] } };
        case 'RequestOtp':
          return {
            data: { requestOtp: { expiresIn: 120, channel: 'SMS', __typename: 'OtpResponse' } },
          };
        case 'VerifyOtp':
          return {
            data: {
              verifyOtp: { accessToken: 'fake-access', isNewUser: true, __typename: 'AuthTokens' },
            },
          };
        case 'Me':
          return {
            data: {
              me: {
                id: 'u1',
                mobile: '09121234567',
                displayName: null,
                avatarUrl: null,
                creditBalance: 20,
                status: 'ACTIVE',
                preferredOtpChannel: 'SMS',
                hasPassword: false,
                __typename: 'User',
              },
            },
          };
        default:
          return { data: {} };
      }
    })(route),
  );

  await page.goto('/login');

  // Channel picker is shown because both channels are enabled.
  await expect(page.getByRole('button', { name: 'پیامک' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'بله' })).toBeVisible();

  await page.getByLabel('شمارهٔ موبایل').fill('09121234567');
  await page.getByRole('button', { name: 'پیامک' }).click();
  await page.getByRole('button', { name: 'دریافت کد تأیید' }).click();

  // OTP step.
  const codeInput = page.getByLabel('کد تأیید');
  await expect(codeInput).toBeVisible();
  await codeInput.fill('123456');
  await page.getByRole('button', { name: 'ورود' }).click();

  // Dashboard with the free-credit balance (۲۰ in Persian digits).
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('credit-balance')).toContainText('۲۰');
});

test('invalid OTP shows a Persian inline error and no leak', async ({ page }) => {
  await page.route('**/graphql', (route) =>
    fakeGraphql((op) => {
      switch (op) {
        case 'RefreshToken':
          return {
            errors: [{ message: 'UNAUTHENTICATED', extensions: { code: 'UNAUTHENTICATED' } }],
          };
        case 'OtpChannels':
          return { data: { otpChannels: ['SMS'] } };
        case 'RequestOtp':
          return {
            data: { requestOtp: { expiresIn: 120, channel: 'SMS', __typename: 'OtpResponse' } },
          };
        case 'VerifyOtp':
          return { errors: [{ message: 'OTP_INVALID', extensions: { code: 'OTP_INVALID' } }] };
        default:
          return { data: {} };
      }
    })(route),
  );

  await page.goto('/login');
  // Single channel → no picker.
  await expect(page.getByRole('button', { name: 'بله' })).toHaveCount(0);

  await page.getByLabel('شمارهٔ موبایل').fill('09121234567');
  await page.getByRole('button', { name: 'دریافت کد تأیید' }).click();
  await page.getByLabel('کد تأیید').fill('000000');
  await page.getByRole('button', { name: 'ورود' }).click();

  await expect(page.getByText('کد تأیید نادرست است. دوباره تلاش کنید.')).toBeVisible();
});

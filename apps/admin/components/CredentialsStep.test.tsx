import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ADMIN_LOGIN_STEP1 } from '@/lib/operations';
import { CredentialsStep, type Challenge } from './CredentialsStep';

function fill(): void {
  fireEvent.change(screen.getByLabelText('ایمیل'), { target: { value: 'ops@nevisoai.ir' } });
  fireEvent.change(screen.getByLabelText('رمز عبور'), { target: { value: 'secret123' } });
  fireEvent.click(screen.getByRole('button', { name: 'ادامه' }));
}

describe('CredentialsStep', () => {
  it('emits the challenge on valid credentials', async () => {
    const mock = {
      request: {
        query: ADMIN_LOGIN_STEP1,
        variables: { email: 'ops@nevisoai.ir', password: 'secret123' },
      },
      result: {
        data: {
          adminLoginStep1: {
            challengeId: 'c1',
            expiresIn: 300,
            maskedMobile: '0912****233',
            __typename: 'AdminLoginChallenge',
          },
        },
      },
    };
    let challenge: Challenge | null = null;
    render(
      <MockedProvider mocks={[mock]} addTypename={false}>
        <CredentialsStep onChallenge={(c: Challenge) => (challenge = c)} />
      </MockedProvider>,
    );
    fill();
    await waitFor(() => expect(challenge).not.toBeNull());
    expect(challenge!).toMatchObject({ challengeId: 'c1', maskedMobile: '0912****233' });
  });

  it('shows the Persian credentials error without leaking detail', async () => {
    const mock = {
      request: {
        query: ADMIN_LOGIN_STEP1,
        variables: { email: 'ops@nevisoai.ir', password: 'secret123' },
      },
      result: { errors: [{ message: 'boom', extensions: { code: 'ADMIN_CREDENTIALS_INVALID' } }] },
    };
    render(
      <MockedProvider mocks={[mock]} addTypename={false}>
        <CredentialsStep onChallenge={jest.fn()} />
      </MockedProvider>,
    );
    fill();
    expect(await screen.findByRole('alert')).toHaveTextContent('ایمیل یا رمز عبور نادرست است');
  });
});

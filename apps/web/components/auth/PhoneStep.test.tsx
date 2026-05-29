import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OTP_CHANNELS, REQUEST_OTP } from '@/lib/operations';
import { PhoneStep, type OtpSent } from './PhoneStep';

const channelsMock: MockedResponse = {
  request: { query: OTP_CHANNELS },
  result: { data: { otpChannels: ['SMS', 'BALE'] } },
};

function renderWith(mocks: MockedResponse[], onSent: (s: OtpSent) => void = jest.fn()) {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PhoneStep onSent={onSent} />
    </MockedProvider>,
  );
  return onSent;
}

describe('PhoneStep', () => {
  it('shows the channel picker only when both channels are enabled', async () => {
    renderWith([channelsMock]);
    expect(await screen.findByText('پیامک')).toBeInTheDocument();
    expect(screen.getByText('بله')).toBeInTheDocument();
  });

  it('rejects an invalid mobile inline (no request sent)', async () => {
    renderWith([channelsMock]);
    await screen.findByText('پیامک');
    fireEvent.change(screen.getByLabelText('شمارهٔ موبایل'), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'ارسال کد' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('نامعتبر');
  });

  it('requires a channel choice in BOTH mode', async () => {
    renderWith([channelsMock]);
    await screen.findByText('پیامک');
    fireEvent.change(screen.getByLabelText('شمارهٔ موبایل'), { target: { value: '09121234567' } });
    fireEvent.click(screen.getByRole('button', { name: 'ارسال کد' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('روش دریافت کد');
  });

  it('sends the OTP and reports the channel up when valid', async () => {
    const sentMock = {
      request: { query: REQUEST_OTP, variables: { mobile: '09121234567', channel: 'SMS' } },
      result: {
        data: { requestOtp: { expiresIn: 120, channel: 'SMS', __typename: 'OtpResponse' } },
      },
    };
    let received: OtpSent | null = null;
    renderWith([channelsMock, sentMock], (s: OtpSent) => (received = s));

    await screen.findByText('پیامک');
    fireEvent.change(screen.getByLabelText('شمارهٔ موبایل'), { target: { value: '09121234567' } });
    fireEvent.click(screen.getByRole('button', { name: 'پیامک' }));
    fireEvent.click(screen.getByRole('button', { name: 'ارسال کد' }));

    await waitFor(() => expect(received).not.toBeNull());
    expect(received!).toMatchObject({
      mobile: '09121234567',
      channel: 'SMS',
      requestedChannel: 'SMS',
    });
  });
});

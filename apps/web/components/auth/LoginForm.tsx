'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, type ApolloError } from '@apollo/client';
import { normalizeMobile, toAsciiDigits, toPersianDigits } from '@neviso/phone';
import { toPersianMessage } from '../../lib/error-map';
import { useAuthStore } from '../../lib/auth-store';
import { LOGIN, OTP_CHANNELS, REQUEST_OTP, VERIFY_OTP } from '../../lib/graphql/auth';
import { NevisoLogo, SparkIcon } from '../icons';
import { OtpInput } from './OtpInput';

type Channel = 'SMS' | 'BALE';
const CHANNEL_LABEL: Record<Channel, string> = { SMS: 'پیامک', BALE: 'بله' };
const RESEND_SECONDS = 120;
const FREE_CREDITS = 60; // FR-55

function persianError(e: unknown): string {
  const code = (e as ApolloError)?.graphQLErrors?.[0]?.extensions?.code;
  return toPersianMessage(code ?? 'NETWORK_ERROR');
}

/** OTP-first login, password optional after first login (design template §02). */
export function LoginForm() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [method, setMethod] = useState<'otp' | 'password'>('otp');
  const [mobile, setMobile] = useState(''); // bare ASCII digits
  const [password, setPassword] = useState('');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [sentChannel, setSentChannel] = useState<Channel>('SMS');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { data: channelsData } = useQuery<{ otpChannels: Channel[] }>(OTP_CHANNELS);
  const channels = useMemo<Channel[]>(() => channelsData?.otpChannels ?? [], [channelsData]);
  const showPicker = channels.length > 1;

  // Default the channel selection when both are offered.
  useEffect(() => {
    if (showPicker && !channel) setChannel(channels[0]);
  }, [showPicker, channel, channels]);

  const [requestOtp, { loading: requesting }] = useMutation(REQUEST_OTP);
  const [verifyOtp, { loading: verifying }] = useMutation(VERIFY_OTP);
  const [login, { loading: loggingIn }] = useMutation(LOGIN);

  const isValid = useMemo(() => normalizeMobile(mobile) !== null, [mobile]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const onLand = (isNewUser: boolean, token: string) => {
    setAccessToken(token);
    router.push(isNewUser ? '/dashboard?welcome=1' : '/dashboard');
  };

  const handleRequestOtp = async () => {
    setError(null);
    setInfo(null);
    if (!isValid) {
      setError(toPersianMessage('INVALID_MOBILE'));
      return;
    }
    try {
      const res = await requestOtp({
        variables: { mobile: normalizeMobile(mobile), channel: showPicker ? channel : null },
      });
      const actual = res.data.requestOtp.channel as Channel;
      setSentChannel(actual);
      if (showPicker && channel && actual !== channel) {
        setInfo(`کد به جای «${CHANNEL_LABEL[channel]}»، با «${CHANNEL_LABEL[actual]}» ارسال شد.`);
      }
      setCode('');
      setCountdown(res.data.requestOtp.expiresIn ?? RESEND_SECONDS);
      setStep('otp');
    } catch (e) {
      setError(persianError(e));
    }
  };

  const handleVerify = async (fullCode: string) => {
    setError(null);
    try {
      const res = await verifyOtp({ variables: { mobile: normalizeMobile(mobile), code: fullCode } });
      onLand(res.data.verifyOtp.isNewUser, res.data.verifyOtp.accessToken);
    } catch (e) {
      setError(persianError(e));
      setCode('');
    }
  };

  const handleLogin = async () => {
    setError(null);
    if (!isValid) {
      setError(toPersianMessage('INVALID_MOBILE'));
      return;
    }
    try {
      const res = await login({ variables: { mobile: normalizeMobile(mobile), password } });
      onLand(res.data.login.isNewUser, res.data.login.accessToken);
    } catch (e) {
      setError(persianError(e));
    }
  };

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 400, width: '100%' }}>
      <h1 style={{ font: 'var(--t-h1)', fontSize: 32, margin: '0 0 10px' }}>
        {step === 'phone' ? 'سلام دانشجو 👋' : 'کد را وارد کن'}
      </h1>
      <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 32px' }}>
        {step === 'phone'
          ? 'برای ورود یا ساخت حساب، شمارهٔ موبایلت را وارد کن.'
          : `کد شش رقمی با ${CHANNEL_LABEL[sentChannel]} ارسال شد به ${toPersianDigits('0' + mobile)}`}
      </p>

      {step === 'phone' ? (
        <>
          {/* Phone segmented input */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 8 }}>شمارهٔ موبایل</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                direction: 'ltr',
                padding: '14px 16px',
                background: 'var(--card)',
                border: '1.5px solid var(--ink)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <span style={{ font: 'var(--t-body-md)', color: 'var(--ink-3)' }}>🇮🇷 +۹۸</span>
              <span style={{ width: 1, height: 22, background: 'var(--paper-edge)' }} />
              <input
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                placeholder="۹۱۲ ۳۴۵ ۶۷۸۹"
                value={mobile ? toPersianDigits(mobile) : ''}
                onChange={(e) =>
                  setMobile(toAsciiDigits(e.target.value).replace(/\D/g, '').slice(0, 10))
                }
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  font: 'var(--t-body-md)',
                  fontSize: 17,
                  letterSpacing: 1,
                  color: 'var(--ink)',
                }}
              />
            </div>
          </div>

          {/* Channel picker — only when the admin enabled BOTH */}
          {showPicker && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 8 }}>
                روش دریافت کد
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 4,
                  padding: 4,
                  background: 'var(--paper-2)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                {(['SMS', 'BALE'] as Channel[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    style={{
                      padding: '10px 0',
                      textAlign: 'center',
                      borderRadius: 'var(--r-sm)',
                      border: 'none',
                      cursor: 'pointer',
                      background: channel === c ? 'var(--card)' : 'transparent',
                      boxShadow: channel === c ? 'var(--sh-1)' : 'none',
                      color: channel === c ? 'var(--ink)' : 'var(--ink-3)',
                      font: 'var(--t-body-md)',
                    }}
                  >
                    {CHANNEL_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Method tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
              padding: 4,
              background: 'var(--paper-2)',
              borderRadius: 'var(--r-md)',
              marginBottom: 12,
            }}
          >
            {(['otp', 'password'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                style={{
                  padding: '10px 0',
                  textAlign: 'center',
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: method === m ? 'var(--card)' : 'transparent',
                  boxShadow: method === m ? 'var(--sh-1)' : 'none',
                  color: method === m ? 'var(--ink)' : 'var(--ink-4)',
                  font: 'var(--t-body-md)',
                }}
              >
                {m === 'otp' ? 'کد یک‌بار مصرف' : 'رمز عبور'}
              </button>
            ))}
          </div>

          {method === 'password' && (
            <input
              type="password"
              autoComplete="current-password"
              placeholder="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '14px 16px',
                background: 'var(--card)',
                border: '1.5px solid var(--ink)',
                borderRadius: 'var(--r-md)',
                font: 'var(--t-body-md)',
                outline: 'none',
                marginBottom: 12,
              }}
            />
          )}

          {error && (
            <div style={{ font: 'var(--t-small)', color: 'var(--ruby)', marginBottom: 8 }}>{error}</div>
          )}

          <button
            type="button"
            onClick={method === 'otp' ? handleRequestOtp : handleLogin}
            disabled={requesting || loggingIn}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 0', justifyContent: 'center', marginTop: 4 }}
          >
            {method === 'otp' ? (requesting ? 'در حال ارسال…' : 'ارسال کد') : loggingIn ? 'در حال ورود…' : 'ورود'}
          </button>

          <div
            style={{
              font: 'var(--t-xs)',
              color: 'var(--ink-3)',
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            با ورود، <a style={{ color: 'var(--saffron-deep)' }}>قوانین</a> و{' '}
            <a style={{ color: 'var(--saffron-deep)' }}>حریم خصوصی</a> را پذیرفته‌ای.
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <OtpInput value={code} onChange={setCode} onComplete={handleVerify} />
          </div>

          {/* Free credits banner */}
          <div
            style={{
              background: 'linear-gradient(95deg, var(--saffron-soft), #FFF6E0, var(--saffron-soft))',
              border: '1px solid var(--saffron)',
              borderRadius: 'var(--r-md)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--saffron)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--ink)',
              }}
            >
              <SparkIcon size={18} />
            </div>
            <div>
              <div style={{ font: 'var(--t-body-md)' }}>{toPersianDigits(FREE_CREDITS)} اعتبار رایگان</div>
              <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>
                بعد از اولین ورود، خودکار اضافه می‌شود
              </div>
            </div>
          </div>

          {info && (
            <div style={{ font: 'var(--t-small)', color: 'var(--indigo)', textAlign: 'center', marginBottom: 8 }}>
              {info}
            </div>
          )}
          {error && (
            <div style={{ font: 'var(--t-small)', color: 'var(--ruby)', textAlign: 'center', marginBottom: 8 }}>
              {error}
            </div>
          )}

          <div
            style={{
              font: 'var(--t-small)',
              color: 'var(--ink-3)',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {verifying
              ? 'در حال بررسی…'
              : countdown > 0
                ? `ارسال مجدد کد در ${toPersianDigits(`${mm}:${ss}`)}`
                : ''}
          </div>

          {countdown <= 0 && (
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={requesting}
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
            >
              ارسال مجدد کد
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setError(null);
              setInfo(null);
            }}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            ← تغییر شماره
          </button>
        </>
      )}
    </div>
  );
}

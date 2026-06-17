// 02 — Auth: OTP-first login, password optional after first login

const AuthMobile = () => {
  const [step, setStep] = React.useState('phone'); // 'phone' | 'otp'
  const code = ['۸', '۴', '۲', '_'];
  return (
    <div dir="rtl" style={{
      width: '100%', height: '100%',
      background: 'var(--paper)', fontFamily: 'var(--font)', color: 'var(--ink)',
      display: 'flex', flexDirection: 'column',
      padding: '40px 24px 24px',
    }} className="paper-texture">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
        <NevisoLogo size={36}/>
        <div style={{ font: 'var(--t-h4)' }}>نِویسو</div>
      </div>

      <div style={{ flex: 1 }}>
        <h1 style={{ font: 'var(--t-h1)', fontSize: 32, margin: '0 0 10px' }}>
          {step === 'phone' ? 'سلام دانشجو 👋' : 'کد را وارد کن'}
        </h1>
        <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 32px' }}>
          {step === 'phone'
            ? 'برای ورود یا ساخت حساب، شمارهٔ موبایلت را وارد کن.'
            : 'کد چهار رقمی پیامک شد به ۰۹۱۲ ۳۴۵ ۶۷۸۹'}
        </p>

        {step === 'phone' ? (
          <>
            {/* Phone segmented input */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 8 }}>شمارهٔ موبایل</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, direction: 'ltr',
                padding: '14px 16px', background: 'var(--card)',
                border: '1.5px solid var(--ink)', borderRadius: 'var(--r-md)',
              }}>
                <span style={{ font: 'var(--t-body-md)', color: 'var(--ink-3)' }}>🇮🇷 +۹۸</span>
                <span style={{ width: 1, height: 22, background: 'var(--paper-edge)' }}/>
                <span style={{ font: 'var(--t-body-md)', fontSize: 17, letterSpacing: 1 }}>۹۱۲ ۳۴۵ ۶۷۸۹</span>
              </div>
            </div>

            {/* Method tabs */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 4, padding: 4, background: 'var(--paper-2)',
              borderRadius: 'var(--r-md)', marginBottom: 12,
            }}>
              <div style={{
                padding: '10px 0', textAlign: 'center', borderRadius: 'var(--r-sm)',
                background: 'var(--card)', font: 'var(--t-body-md)',
                boxShadow: 'var(--sh-1)',
              }}>کد یک‌بار مصرف</div>
              <div style={{
                padding: '10px 0', textAlign: 'center', borderRadius: 'var(--r-sm)',
                color: 'var(--ink-4)', font: 'var(--t-body-md)',
              }}>
                رمز عبور
              </div>
            </div>

            <button onClick={() => setStep('otp')} className="btn btn-primary"
              style={{ width: '100%', padding: '14px 0', justifyContent: 'center', marginTop: 16 }}>
              ارسال کد
            </button>

            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', textAlign: 'center', marginTop: 20 }}>
              با ورود، <a style={{ color: 'var(--saffron-deep)' }}>قوانین</a> و <a style={{ color: 'var(--saffron-deep)' }}>حریم خصوصی</a> را پذیرفته‌ای.
            </div>
          </>
        ) : (
          <>
            {/* OTP boxes */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24, direction: 'ltr' }}>
              {code.map((c, i) => (
                <div key={i} style={{
                  width: 60, height: 68, borderRadius: 'var(--r-md)',
                  background: c === '_' ? 'var(--card)' : 'var(--saffron-soft)',
                  border: c === '_' ? '1.5px solid var(--ink)' : '1.5px solid var(--saffron)',
                  display: 'grid', placeItems: 'center',
                  font: 'var(--t-h2)', fontSize: 28, color: 'var(--ink)',
                }}>{c === '_' ? '' : c}</div>
              ))}
            </div>

            {/* AI shimmer: free credits banner */}
            <div style={{
              background: 'linear-gradient(95deg, var(--saffron-soft), #FFF6E0, var(--saffron-soft))',
              border: '1px solid var(--saffron)',
              borderRadius: 'var(--r-md)', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'var(--saffron)',
                display: 'grid', placeItems: 'center', color: 'var(--ink)',
              }}><SparkIcon size={18}/></div>
              <div>
                <div style={{ font: 'var(--t-body-md)' }}>۲۵۰ اعتبار رایگان</div>
                <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>بعد از اولین ورود، خودکار اضافه می‌شود</div>
              </div>
            </div>

            <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', textAlign: 'center', marginBottom: 8 }}>
              ارسال مجدد کد در ۰۰:۴۸
            </div>
            <button onClick={() => setStep('phone')} className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}>
              ← تغییر شماره
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const AuthDesktop = () => {
  return (
    <div dir="rtl" style={{
      width: '100%', height: '100%',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      fontFamily: 'var(--font)',
    }}>
      {/* Right (RTL primary) — form */}
      <div style={{
        background: 'var(--paper)',
        padding: '48px 64px',
        display: 'flex', flexDirection: 'column',
      }} className="paper-texture">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <NevisoLogo size={32}/>
          <div style={{ font: 'var(--t-h4)' }}>نِویسو</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400 }}>
          <h1 style={{ font: 'var(--t-h1)', fontSize: 34, margin: '0 0 10px' }}>سلام دانشجو 👋</h1>
          <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 28px' }}>
            با شمارهٔ موبایلت وارد شو. اولین ورود = ۲۵۰ اعتبار رایگان.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 8 }}>شمارهٔ موبایل</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, direction: 'ltr',
              padding: '14px 16px', background: 'var(--card)',
              border: '1.5px solid var(--ink)', borderRadius: 'var(--r-md)',
            }}>
              <span style={{ font: 'var(--t-body-md)', color: 'var(--ink-3)' }}>🇮🇷 +۹۸</span>
              <span style={{ width: 1, height: 22, background: 'var(--paper-edge)' }}/>
              <span style={{ font: 'var(--t-body-md)', fontSize: 17, letterSpacing: 1 }}>۹۱۲ ۳۴۵ ۶۷۸۹</span>
            </div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 4, padding: 4, background: 'var(--paper-2)',
            borderRadius: 'var(--r-md)', marginBottom: 16,
          }}>
            <div style={{
              padding: '10px 0', textAlign: 'center', borderRadius: 'var(--r-sm)',
              background: 'var(--card)', font: 'var(--t-body-md)', boxShadow: 'var(--sh-1)',
            }}>کد یک‌بار مصرف</div>
            <div style={{
              padding: '10px 0', textAlign: 'center', borderRadius: 'var(--r-sm)',
              color: 'var(--ink-4)', font: 'var(--t-body-md)',
            }}>رمز عبور · غیرفعال</div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px 0', justifyContent: 'center' }}>
            ارسال کد
          </button>
          <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', textAlign: 'center', marginTop: 16 }}>
            با ورود، <a style={{ color: 'var(--saffron-deep)' }}>قوانین</a> و <a style={{ color: 'var(--saffron-deep)' }}>حریم خصوصی</a> را پذیرفته‌ای.
          </div>
        </div>
      </div>

      {/* Left — illustration / brand */}
      <div style={{
        background: 'var(--slate)', color: 'var(--paper)',
        padding: '48px', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        {/* Floating notebooks */}
        <div style={{
          position: 'absolute', top: 60, right: 40,
          width: 200, height: 270, transform: 'rotate(-8deg)',
          background: 'var(--card)', borderRadius: '4px 16px 16px 4px',
          boxShadow: 'var(--sh-3)', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 12, background: '#6B8B6E' }}/>
        </div>
        <div style={{
          position: 'absolute', top: 100, right: 160,
          width: 220, height: 300, transform: 'rotate(4deg)',
          background: 'var(--card)', borderRadius: '4px 16px 16px 4px',
          boxShadow: 'var(--sh-3)', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 14, background: 'var(--saffron)' }}/>
          <div style={{
            padding: '20px 20px 20px 26px', color: 'var(--ink)',
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 22px, rgba(120,95,50,0.12) 22px, rgba(120,95,50,0.12) 23px)',
            height: '100%',
          }}>
            <div className="chip chip-saffron" style={{ marginBottom: 10 }}>ریاضی</div>
            <div style={{ font: 'var(--t-h4)', fontSize: 15 }}>سری فوریه</div>
          </div>
        </div>
        <div style={{
          position: 'absolute', top: 200, right: 300,
          color: 'var(--saffron)',
        }}><SparkIcon size={32}/></div>

        <blockquote style={{
          position: 'relative', font: 'var(--t-h3)', lineHeight: 1.5,
          margin: 0, maxWidth: 380,
        }}>
          «از وقتی نِویسو دارم، دیگه شب امتحان دنبال جزوهٔ بقیه نمی‌گردم.»
          <div style={{ font: 'var(--t-small)', color: 'var(--saffron)', marginTop: 12, fontWeight: 600 }}>
            — مریم، دانشجوی پزشکی · ۱۴۰۳
          </div>
        </blockquote>
      </div>
    </div>
  );
};

window.AuthMobile = AuthMobile;
window.AuthDesktop = AuthDesktop;

// 01 — Landing page (desktop + mobile)
// Marketing homepage: hero, features, pricing teaser, CTA.

const LandingDesktop = () => {
  return (
    <div dir="rtl" style={{
      width: '100%', minHeight: '100%',
      background: 'var(--paper)',
      fontFamily: 'var(--font)', color: 'var(--ink)',
      overflow: 'hidden',
    }} className="paper-texture">
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NevisoLogo size={36}/>
          <div style={{ font: 'var(--t-h4)' }}>نِویسو</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, font: 'var(--t-body-md)' }}>
          <a style={{ color: 'var(--ink-2)' }}>ویژگی‌ها</a>
          <a style={{ color: 'var(--ink-2)' }}>قیمت</a>
          <a style={{ color: 'var(--ink-2)' }}>سؤالات</a>
          <a style={{ color: 'var(--ink-2)' }}>بلاگ</a>
          <button className="btn btn-ghost">ورود</button>
          <button className="btn btn-primary">شروع رایگان</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1.05fr 1fr',
        gap: 56, padding: '32px 56px 64px',
        alignItems: 'center',
      }}>
        <div>
          <div className="chip chip-saffron" style={{ marginBottom: 18, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SparkSmall/>
            ۲۵۰ اعتبار رایگان برای ورود اول
          </div>
          <h1 style={{
            font: 'var(--t-display)', fontSize: 64, lineHeight: 1.05,
            margin: '0 0 18px', letterSpacing: -1,
          }}>
            صدای کلاس را بده،<br/>
            <span style={{
              background: 'linear-gradient(95deg, var(--saffron-deep), var(--saffron))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>جزوهٔ تمیز</span> تحویل بگیر.
          </h1>
          <p style={{ font: 'var(--t-body)', fontSize: 17, color: 'var(--ink-2)', maxWidth: 540, margin: '0 0 28px' }}>
            نِویسو با هوش مصنوعی فارسی، ضبط صدا و عکس تخته را در چند دقیقه تبدیل به جزوه‌ای ساختاریافته،
            قابل ویرایش و قابل دانلود می‌کند. مخصوص دانشجوهای ایرانی.
          </p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <button className="btn btn-primary" style={{ padding: '14px 24px', fontSize: 16 }}>
              همین حالا امتحان کن
              <FwdIcon size={16} stroke="var(--paper)"/>
            </button>
            <button className="btn btn-outline" style={{ padding: '14px 24px', fontSize: 16 }}>
              <PlayIcon size={14}/> مشاهدهٔ دمو
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, font: 'var(--t-small)', color: 'var(--ink-3)' }}>
            <div style={{ display: 'flex' }}>
              {['#E8A53D', '#6B8B6E', '#455A8F', '#B0413E'].map((c, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: c, border: '2px solid var(--paper)',
                  marginInlineStart: i ? -8 : 0,
                }}/>
              ))}
            </div>
            بیش از ۲٬۴۰۰ دانشجو از ۳۸ دانشگاه
          </div>
        </div>

        {/* Hero illustration: stacked notebook */}
        <HeroIllustration/>
      </section>

      {/* Feature band */}
      <section style={{
        background: 'var(--slate)', color: 'var(--paper)',
        padding: '56px 56px',
        borderRadius: 'var(--r-xl)',
        margin: '0 56px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <div>
            <div style={{ font: 'var(--t-xs)', color: 'var(--saffron)', letterSpacing: 2, marginBottom: 8 }}>ویژگی‌ها</div>
            <h2 style={{ font: 'var(--t-h1)', margin: 0, fontWeight: 700 }}>
              کلاس، جزوه، آزمون.<br/>همه در یک‌جا.
            </h2>
          </div>
          <div style={{ font: 'var(--t-body)', color: '#C7C5BF', maxWidth: 320 }}>
            از لحظهٔ ضبط صدا تا شب امتحان، نِویسو کنارت است.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          <FeatureCard icon={<MicIcon size={22} stroke="#1B1B1F"/>} title="صدا و عکس را بفرست" body="ضبط صدای کلاس و عکس‌های تخته را آپلود کن. هوش مصنوعی، خودش ادغام می‌کند." />
          <FeatureCard icon={<SparkIcon size={22} stroke="#1B1B1F"/>} title="جزوهٔ ساختاریافته" body="عنوان، تیتر، فهرست، جدول — همه به‌صورت خودکار. فارسی روان." />
          <FeatureCard icon={<ChatIcon size={22} stroke="#1B1B1F"/>} title="با جزوه‌ها چت کن" body="سؤال بپرس، AI از پوشهٔ درست جواب می‌دهد. بدون توهم، بدون پراکندگی." />
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '72px 56px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 2, marginBottom: 8 }}>چطور کار می‌کند</div>
          <h2 style={{ font: 'var(--t-h1)', margin: 0 }}>سه گام تا جزوهٔ آماده</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <Step num="۰۱" title="آپلود" body="صدای ضبط‌شده و عکس‌های تخته را بفرست. پوشهٔ درس را انتخاب کن." />
          <Step num="۰۲" title="پردازش" body="هوش مصنوعی متن را می‌نویسد و عنوان پیشنهاد می‌دهد. کم‌تر از ۳ دقیقه." />
          <Step num="۰۳" title="مطالعه" body="در ویرایشگر تمیز کن، با چت‌بات سؤال بپرس، PDF بگیر." />
        </div>
      </section>

      {/* Pricing teaser */}
      <section style={{ padding: '24px 56px 72px' }}>
        <div style={{
          background: 'var(--card-soft)', border: '1px solid var(--paper-edge)',
          borderRadius: 'var(--r-xl)', padding: '40px 48px',
          display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 40, alignItems: 'center',
        }}>
          <div>
            <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 2, marginBottom: 8 }}>قیمت</div>
            <h2 style={{ font: 'var(--t-h2)', margin: '0 0 12px' }}>فقط برای جزوه هزینه بده.</h2>
            <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 20px' }}>
              بدون اشتراک و بدون انقضا. اعتبار بخر و هر وقت خواستی جزوه بساز.
            </p>
            <button className="btn btn-primary">مشاهدهٔ بسته‌های اعتبار</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <PlanMini title="۱۰۰ اعتبار" price="۲۵٬۰۰۰" sub="تومان · ≈ ۲ جزوه" feature="بدون انقضا" />
            <PlanMini title="۵۰۰ اعتبار" price="۹۹٬۰۰۰" sub="تومان · ≈ ۱۰ جزوه" feature="صرفه‌جویی ٪۲۰" highlight />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--paper-edge)',
        padding: '32px 56px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        font: 'var(--t-small)', color: 'var(--ink-3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NevisoLogo size={24}/>
          <span>نِویسو · neviso.ir · ۱۴۰۴</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <span>قوانین</span><span>حریم خصوصی</span><span>تماس</span>
        </div>
      </footer>
    </div>
  );
};

// Hero illustration: stacked spine notebooks + audio waveform card
const HeroIllustration = () => (
  <div style={{ position: 'relative', height: 460 }}>
    {/* Back notebook */}
    <div style={{
      position: 'absolute', right: 30, top: 50,
      width: 240, height: 320, transform: 'rotate(-6deg)',
      background: 'var(--card)', borderRadius: '6px 18px 18px 6px',
      boxShadow: 'var(--sh-3)', border: '1px solid var(--paper-edge)',
    }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 14, background: '#6B8B6E' }}/>
      <div style={{
        padding: '24px 24px 24px 30px',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 22px, rgba(120,95,50,0.10) 22px, rgba(120,95,50,0.10) 23px)',
        height: '100%',
      }}>
        <div className="chip chip-sage" style={{ marginBottom: 10 }}>فیزیک ۲</div>
        <div style={{ font: 'var(--t-h4)', fontSize: 16, marginBottom: 6 }}>قانون فارادی</div>
        <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>جلسهٔ ۱۲ — ۲۲ آبان</div>
      </div>
    </div>

    {/* Front notebook */}
    <div style={{
      position: 'absolute', right: 90, top: 90,
      width: 260, height: 340, transform: 'rotate(3deg)',
      background: 'var(--card)', borderRadius: '6px 20px 20px 6px',
      boxShadow: 'var(--sh-3)', border: '1px solid var(--paper-edge)',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 16, background: 'var(--saffron)' }}/>
      <div style={{
        padding: '22px 22px 22px 30px',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 24px, rgba(120,95,50,0.10) 24px, rgba(120,95,50,0.10) 25px)',
        height: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="chip chip-saffron">ریاضی مهندسی</div>
          <div style={{ font: 'var(--t-xs)', color: 'var(--ink-4)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><SparkSmall stroke="var(--saffron-deep)"/> AI</div>
        </div>
        <div style={{ font: 'var(--t-h4)', fontSize: 17, marginBottom: 6 }}>سری فوریه</div>
        <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginBottom: 14 }}>جلسهٔ ۸ — ۲۵ آبان</div>
        <div style={{ font: 'var(--t-body)', fontSize: 13, lineHeight: 1.8 }}>
          • تابع متناوب با دورهٔ ۲π<br/>
          • ضرایب a₀ و aₙ، bₙ<br/>
          • مثال: تابع پله‌ای<br/>
          • همگرایی نقطه‌به‌نقطه
        </div>
      </div>
    </div>

    {/* Audio card — front */}
    <div style={{
      position: 'absolute', right: 0, bottom: 30,
      width: 280, padding: '16px 18px',
      background: 'var(--ink)', color: 'var(--paper)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--sh-3)',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: 'var(--saffron)', display: 'grid', placeItems: 'center',
        color: 'var(--ink)',
      }}><PlayIcon size={16}/></div>
      <div style={{ flex: 1 }}>
        <div style={{ font: 'var(--t-xs)', color: 'var(--saffron)', marginBottom: 4 }}>صدای کلاس</div>
        <Waveform/>
      </div>
    </div>

    {/* Floating sparks */}
    <div style={{ position: 'absolute', right: 320, top: 30, color: 'var(--saffron)' }}><SparkIcon size={28}/></div>
    <div style={{ position: 'absolute', right: 20, top: 280, color: 'var(--saffron-deep)' }}><SparkIcon size={18}/></div>
  </div>
);

const Waveform = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
    {[6,12,18,14,8,16,22,10,6,14,18,12,8,16,20,10,14,18,8,12,16,10,6,12,18,14].map((h, i) => (
      <div key={i} style={{
        width: 3, height: h,
        background: i < 14 ? 'var(--saffron)' : 'rgba(255,255,255,0.3)',
        borderRadius: 2,
      }}/>
    ))}
  </div>
);

const FeatureCard = ({ icon, title, body }) => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--r-lg)',
    padding: '24px 22px',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: 'var(--saffron)', color: 'var(--ink)',
      display: 'grid', placeItems: 'center',
      fontSize: 20, marginBottom: 16,
    }}>{icon}</div>
    <div style={{ font: 'var(--t-h4)', marginBottom: 6 }}>{title}</div>
    <div style={{ font: 'var(--t-body)', color: '#C7C5BF', fontSize: 14 }}>{body}</div>
  </div>
);

const Step = ({ num, title, body }) => (
  <div style={{
    background: 'var(--card-soft)', border: '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-lg)', padding: '24px 22px',
    position: 'relative',
  }}>
    <div style={{
      font: 'var(--t-h1)', fontSize: 48, fontWeight: 800,
      color: 'var(--saffron)', lineHeight: 1, marginBottom: 12,
      WebkitTextStroke: '1px var(--saffron-deep)',
    }}>{num}</div>
    <div style={{ font: 'var(--t-h4)', marginBottom: 6 }}>{title}</div>
    <div style={{ font: 'var(--t-body)', color: 'var(--ink-2)', fontSize: 14 }}>{body}</div>
  </div>
);

const PlanMini = ({ title, price, sub, feature, highlight }) => (
  <div style={{
    background: highlight ? 'var(--ink)' : 'var(--card)',
    color: highlight ? 'var(--paper)' : 'var(--ink)',
    border: highlight ? 'none' : '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-md)', padding: '18px 20px',
  }}>
    <div style={{ font: 'var(--t-xs)', color: highlight ? 'var(--saffron)' : 'var(--ink-3)', marginBottom: 6 }}>{title}</div>
    <div style={{ font: 'var(--t-h2)', margin: '0 0 2px' }}>{price}</div>
    <div style={{ font: 'var(--t-xs)', color: highlight ? '#C7C5BF' : 'var(--ink-3)', marginBottom: 12 }}>{sub}</div>
    <div style={{ font: 'var(--t-small)', color: highlight ? '#E5DDC2' : 'var(--ink-2)' }}>✓ {feature}</div>
  </div>
);

// ───────────── Mobile ─────────────
const LandingMobile = () => {
  return (
    <div dir="rtl" style={{
      width: '100%', minHeight: '100%',
      background: 'var(--paper)',
      fontFamily: 'var(--font)', color: 'var(--ink)',
      overflow: 'hidden',
    }} className="paper-texture">
      {/* Mobile nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NevisoLogo size={28}/>
          <div style={{ font: 'var(--t-h4)', fontSize: 16 }}>نِویسو</div>
        </div>
        <button className="btn btn-ghost" style={{ padding: '6px 8px' }}>☰</button>
      </nav>

      {/* Hero */}
      <section style={{ padding: '12px 20px 24px' }}>
        <div className="chip chip-saffron" style={{ marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <SparkSmall/> ۲۵۰ اعتبار رایگان
        </div>
        <h1 style={{
          font: 'var(--t-h1)', fontSize: 34, lineHeight: 1.15,
          margin: '0 0 12px', letterSpacing: -0.5,
        }}>
          صدای کلاس را بده،<br/>
          <span style={{
            background: 'linear-gradient(95deg, var(--saffron-deep), var(--saffron))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>جزوهٔ تمیز</span> بگیر.
        </h1>
        <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 18px' }}>
          هوش مصنوعی فارسی، ضبط کلاس را به جزوهٔ ساختاریافته تبدیل می‌کند.
        </p>
        <button className="btn btn-primary" style={{ width: '100%', padding: '14px 0', justifyContent: 'center', fontSize: 15 }}>
          همین حالا امتحان کن <FwdIcon size={16} stroke="var(--paper)"/>
        </button>

        {/* Compact illustration */}
        <div style={{ position: 'relative', height: 220, marginTop: 28 }}>
          <div style={{
            position: 'absolute', right: 24, top: 0,
            width: 160, height: 200, transform: 'rotate(-4deg)',
            background: 'var(--card)', borderRadius: '4px 14px 14px 4px',
            boxShadow: 'var(--sh-3)', border: '1px solid var(--paper-edge)', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 10, background: '#6B8B6E' }}/>
            <div style={{
              padding: '14px 14px 14px 18px',
              backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 18px, rgba(120,95,50,0.10) 18px, rgba(120,95,50,0.10) 19px)',
              height: '100%',
            }}>
              <div className="chip chip-sage" style={{ marginBottom: 8, fontSize: 9 }}>فیزیک</div>
              <div style={{ font: 'var(--t-h4)', fontSize: 13 }}>قانون فارادی</div>
            </div>
          </div>
          <div style={{
            position: 'absolute', right: 80, top: 30,
            width: 170, height: 200, transform: 'rotate(3deg)',
            background: 'var(--card)', borderRadius: '4px 14px 14px 4px',
            boxShadow: 'var(--sh-3)', border: '1px solid var(--paper-edge)', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 10, background: 'var(--saffron)' }}/>
            <div style={{
              padding: '14px 14px 14px 18px',
              backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 18px, rgba(120,95,50,0.10) 18px, rgba(120,95,50,0.10) 19px)',
              height: '100%',
            }}>
              <div className="chip chip-saffron" style={{ marginBottom: 8, fontSize: 9 }}>ریاضی</div>
              <div style={{ font: 'var(--t-h4)', fontSize: 13, marginBottom: 4 }}>سری فوریه</div>
              <div style={{ font: 'var(--t-small)', fontSize: 10, color: 'var(--ink-3)', lineHeight: 1.6 }}>
                • تابع متناوب<br/>
                • ضرایب aₙ، bₙ<br/>
                • مثال پله‌ای
              </div>
            </div>
          </div>
          <div style={{
            position: 'absolute', right: 0, bottom: 0,
            width: '90%', padding: '12px 14px',
            background: 'var(--ink)', color: 'var(--paper)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--sh-3)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--saffron)', display: 'grid', placeItems: 'center',
              color: 'var(--ink)',
            }}><PlayIcon size={12}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ font: 'var(--t-xs)', color: 'var(--saffron)' }}>صدای کلاس</div>
              <Waveform/>
            </div>
          </div>
        </div>
      </section>

      {/* Features stack */}
      <section style={{
        background: 'var(--slate)', color: 'var(--paper)',
        padding: '32px 20px', margin: '16px 16px',
        borderRadius: 'var(--r-lg)',
      }}>
        <div style={{ font: 'var(--t-xs)', color: 'var(--saffron)', letterSpacing: 2, marginBottom: 6 }}>ویژگی‌ها</div>
        <h2 style={{ font: 'var(--t-h2)', margin: '0 0 20px', fontSize: 24 }}>کلاس، جزوه، آزمون</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FeatureCard icon={<MicIcon size={20} stroke="#1B1B1F"/>} title="صدا و عکس را بفرست" body="ضبط کلاس و عکس‌های تخته را آپلود کن." />
          <FeatureCard icon={<SparkIcon size={20} stroke="#1B1B1F"/>}  title="جزوهٔ ساختاریافته" body="عنوان، تیتر، فهرست — همه خودکار." />
          <FeatureCard icon={<ChatIcon size={20} stroke="#1B1B1F"/>} title="با جزوه‌ها چت کن" body="سؤال بپرس، AI از پوشهٔ درست جواب می‌دهد." />
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '24px 20px 40px' }}>
        <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 2, marginBottom: 6 }}>قیمت</div>
        <h2 style={{ font: 'var(--t-h2)', margin: '0 0 16px', fontSize: 24 }}>فقط برای جزوه هزینه بده.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <PlanMini title="۱۰۰ اعتبار" price="۲۵٬۰۰۰" sub="تومان" feature="≈ ۲ جزوه" />
          <PlanMini title="۵۰۰ اعتبار" price="۹۹٬۰۰۰" sub="تومان" feature="صرفه ٪۲۰" highlight />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 20, padding: '14px 0', justifyContent: 'center' }}>
          شروع رایگان <FwdIcon size={16} stroke="var(--paper)"/>
        </button>
      </section>
    </div>
  );
};

window.LandingDesktop = LandingDesktop;
window.LandingMobile = LandingMobile;
window.HeroIllustration = HeroIllustration;
window.Waveform = Waveform;

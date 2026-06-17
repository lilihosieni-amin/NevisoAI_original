// 00 — Foundation: design system overview
// Shows: logo concept, color tokens, type scale, components, notebook spine motif.

const Foundation = () => {
  return (
    <div dir="rtl" style={{
      width: '100%', height: '100%',
      background: 'var(--paper)',
      padding: '40px 48px',
      fontFamily: 'var(--font)',
      color: 'var(--ink)',
      overflow: 'hidden',
    }}>
      {/* Top row: logo + tagline + reasoning */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 40, marginBottom: 36 }}>
        <div>
          <NevisoLogo size={72} />
          <div style={{ font: 'var(--t-h2)', marginTop: 20, lineHeight: 1.2 }}>
            نِویسو
            <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 22, marginInlineStart: 12 }}>/ Neviso</span>
          </div>
          <div style={{ font: 'var(--t-body)', color: 'var(--ink-2)', marginTop: 8, maxWidth: 380 }}>
            دفترچهٔ هوشمند دانشجو — صدا و عکس کلاس را به جزوهٔ تمیز تبدیل می‌کند.
          </div>
        </div>
        <div style={{
          background: 'var(--card-soft)',
          border: '1px solid var(--paper-edge)',
          borderRadius: 'var(--r-lg)',
          padding: '20px 24px',
        }}>
          <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 1, marginBottom: 10 }}>
            DESIGN DIRECTION
          </div>
          <div style={{ font: 'var(--t-h4)', marginBottom: 8 }}>
            دفترچهٔ کاغذی، با روح مدرن
          </div>
          <div style={{ font: 'var(--t-body)', color: 'var(--ink-2)' }}>
            Calm Academic × Modern Friendly. سطوح کاغذی گرم، جوهرِ تیره،
            لهجهٔ زعفرانی، و استعارهٔ شیرازهٔ دفترچه برای پوشه‌ها.
            گوشه‌های نرم، تایپوگرافی واضح فارسی، حس صمیمی و قابل اعتماد.
          </div>
        </div>
      </div>

      {/* Mid row: palette + type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, marginBottom: 36 }}>
        {/* Palette */}
        <div>
          <SectionLabel num="01" label="پالت رنگی" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            <Swatch name="کاغذ" hex="#FAF6EC" token="--paper" textDark />
            <Swatch name="کاغذ ۲" hex="#F2EBD9" token="--paper-2" textDark />
            <Swatch name="جوهر" hex="#1B1B1F" token="--ink" />
            <Swatch name="زعفران" hex="#E8A53D" token="--saffron" textDark />
            <Swatch name="مریم‌گلی" hex="#6B8B6E" token="--sage" />
            <Swatch name="یاقوت" hex="#B0413E" token="--ruby" />
          </div>
        </div>
        {/* Type scale */}
        <div>
          <SectionLabel num="02" label="تایپوگرافی — Vazirmatn" />
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--paper-edge)',
            borderRadius: 'var(--r-md)',
            padding: '18px 20px',
          }}>
            <TypeRow label="Display / 56" weight={700} size={32}>دفترچهٔ هوشمند</TypeRow>
            <TypeRow label="H2 / 28"      weight={700} size={22}>عنوان درس</TypeRow>
            <TypeRow label="H4 / 18"      weight={600} size={16}>جلسهٔ بیست‌و‌سوم</TypeRow>
            <TypeRow label="Body / 15"    weight={400} size={14}>
              متن جزوه پس از پردازش هوش مصنوعی به صورت مرتب نمایش داده می‌شود.
            </TypeRow>
            <TypeRow label="Small / 13"   weight={400} size={12} muted>
              ۱۲ دقیقه پیش • پوشهٔ ریاضی مهندسی
            </TypeRow>
          </div>
        </div>
      </div>

      {/* Bottom row: notebook spine + components */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 32 }}>
        <div>
          <SectionLabel num="03" label="استعارهٔ شیرازهٔ دفترچه" />
          <div style={{ display: 'flex', gap: 14 }}>
            <SpineCard color="#E8A53D" title="ریاضی ۲" count={12} />
            <SpineCard color="#6B8B6E" title="فیزیک" count={8} />
            <SpineCard color="#455A8F" title="ادبیات" count={5} />
          </div>
          <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginTop: 14 }}>
            هر پوشه مثل یک دفترچه با شیرازهٔ رنگی — نشانه‌گذاری بصری سریع، حس آکادمیک.
          </div>
        </div>
        <div>
          <SectionLabel num="04" label="اجزای پایه" />
          <div style={{
            background: 'var(--card)', border: '1px solid var(--paper-edge)',
            borderRadius: 'var(--r-md)', padding: '16px 18px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn btn-primary">ورود به نِویسو</button>
              <button className="btn btn-accent">آپلود جدید</button>
              <button className="btn btn-outline">انصراف</button>
              <button className="btn btn-ghost">بعداً</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="chip chip-saffron">۳۲۰ اعتبار</span>
              <span className="chip chip-sage">آماده</span>
              <span className="chip chip-ruby">ناموفق</span>
              <span className="chip chip-indigo">در حال پردازش</span>
              <span className="chip">پوشهٔ جدید</span>
            </div>
            <div style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: '12px 14px', background: 'var(--paper)',
              borderRadius: 'var(--r-sm)', border: '1px solid var(--paper-edge)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'var(--saffron-soft)', display: 'grid', placeItems: 'center',
                color: 'var(--saffron-deep)', fontWeight: 700,
              }}><SparkIcon size={20}/></div>
              <div style={{ font: 'var(--t-small)', color: 'var(--ink-2)' }}>
                لحظهٔ AI: درخشش زعفرانی نرم، حرکت ملایم، احساس جادو
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── helpers ──

const SectionLabel = ({ num, label }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
    <span style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 1 }}>{num}</span>
    <span style={{ font: 'var(--t-h4)', color: 'var(--ink)' }}>{label}</span>
  </div>
);

const Swatch = ({ name, hex, token, textDark }) => (
  <div style={{
    background: hex,
    borderRadius: 'var(--r-md)',
    height: 96,
    padding: 12,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    color: textDark ? 'var(--ink)' : 'var(--paper)',
    border: textDark ? '1px solid var(--paper-edge)' : 'none',
  }}>
    <div style={{ font: 'var(--t-body-md)' }}>{name}</div>
    <div>
      <div style={{ font: 'var(--t-xs)', opacity: 0.75 }}>{token}</div>
      <div style={{ font: 'var(--t-xs)', opacity: 0.6 }}>{hex}</div>
    </div>
  </div>
);

const TypeRow = ({ label, size, weight, muted, children }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '90px 1fr',
    alignItems: 'center', padding: '8px 0',
    borderBottom: '1px dashed var(--paper-edge)',
  }}>
    <div style={{ font: 'var(--t-xs)', color: 'var(--ink-4)' }}>{label}</div>
    <div style={{
      fontSize: size, fontWeight: weight, lineHeight: 1.3,
      color: muted ? 'var(--ink-3)' : 'var(--ink)',
    }}>{children}</div>
  </div>
);

const SpineCard = ({ color, title, count }) => (
  <div style={{
    width: 110, height: 150, position: 'relative',
    borderRadius: '4px 14px 14px 4px', // spine on the right (RTL bind)
    background: 'var(--card-soft)',
    border: '1px solid var(--paper-edge)',
    boxShadow: 'var(--sh-spine)',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '14px 14px 14px 18px',
  }}>
    {/* Spine */}
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0,
      width: 10, background: color,
      boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.15)',
    }} />
    {/* Ruled lines */}
    <div style={{
      position: 'absolute', inset: 0, opacity: 0.4,
      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 16px, rgba(120,95,50,0.18) 16px, rgba(120,95,50,0.18) 17px)',
    }} />
    <div style={{ position: 'relative', font: 'var(--t-h4)', fontSize: 15 }}>{title}</div>
    <div style={{ position: 'relative', font: 'var(--t-xs)', color: 'var(--ink-3)' }}>
      {count} جزوه
    </div>
  </div>
);

const NevisoLogo = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    {/* Notebook body */}
    <rect x="8" y="6" width="44" height="52" rx="6" fill="#FFFFFF" stroke="#1B1B1F" strokeWidth="2.5"/>
    {/* Spine */}
    <rect x="48" y="6" width="6" height="52" rx="2" fill="#E8A53D" stroke="#1B1B1F" strokeWidth="2.5"/>
    {/* Pen/highlight */}
    <path d="M16 22 L40 22 M16 30 L34 30 M16 38 L36 38 M16 46 L28 46" stroke="#1B1B1F" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Spark */}
    <path d="M58 14 L60 18 L64 20 L60 22 L58 26 L56 22 L52 20 L56 18 Z" fill="#E8A53D" stroke="#1B1B1F" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

window.Foundation = Foundation;
window.NevisoLogo = NevisoLogo;
window.SpineCard = SpineCard;

// 09 — Plans & Pricing / Credit top-up

const Plans = () => {
  return (
    <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
      <DashHeader credits="۳۲۰" notif={3}/>

      <div style={{ padding: '36px 32px 8px', textAlign: 'center' }}>
        <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 2, marginBottom: 8 }}>شارژ اعتبار</div>
        <h1 style={{ font: 'var(--t-h1)', fontSize: 36, margin: '0 0 10px' }}>
          فقط برای چیزی که استفاده می‌کنی، هزینه بده.
        </h1>
        <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', maxWidth: 540, margin: '0 auto' }}>
          بدون اشتراک، بدون تاریخ انقضا. اعتبار بخر و هر وقت خواستی جزوه بساز. هرچه بیشتر بخری، ارزان‌تر.
        </p>
      </div>

      {/* Current balance */}
      <div style={{ padding: '20px 32px 8px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 'var(--r-lg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--saffron)', color: 'var(--ink)', display: 'grid', placeItems: 'center' }}><CoinIcon size={22} stroke="var(--ink)"/></div>
            <div>
              <div style={{ font: 'var(--t-xs)', color: '#C7C5BF' }}>موجودی فعلی</div>
              <div style={{ font: 'var(--t-h2)', fontSize: 28 }}>۳۲۰ <span style={{ font: 'var(--t-small)', color: '#C7C5BF', fontWeight: 400 }}>اعتبار</span></div>
            </div>
          </div>
          <div style={{ font: 'var(--t-small)', color: '#C7C5BF', textAlign: 'left' }}>
            هر جزوه ≈ <strong style={{ color: 'var(--saffron)' }}>۵۰ اعتبار</strong><br/>
            کافی برای حدود ۶ جزوه
          </div>
        </div>
      </div>

      {/* Credit packs */}
      <div style={{ padding: '20px 32px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <CreditPack credits="۱۰۰" price="۲۵٬۰۰۰" perUnit="۲۵۰ تومان / اعتبار" sub="≈ ۲ جزوه" />
          <CreditPack credits="۵۰۰" price="۹۹٬۰۰۰" perUnit="۱۹۸ تومان / اعتبار" sub="≈ ۱۰ جزوه" save="٪۲۰" popular />
          <CreditPack credits="۱٬۰۰۰" price="۱۷۹٬۰۰۰" perUnit="۱۷۹ تومان / اعتبار" sub="≈ ۲۰ جزوه" save="٪۲۸" />
          <CreditPack credits="۳٬۰۰۰" price="۴۹۹٬۰۰۰" perUnit="۱۶۶ تومان / اعتبار" sub="≈ ۶۰ جزوه" save="٪۳۳" />
        </div>
        {/* Reassurance row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 20, flexWrap: 'wrap' }}>
          <Reassure>اعتبارها هیچ‌وقت منقضی نمی‌شوند</Reassure>
          <Reassure>۲۵۰ اعتبار رایگان برای کاربر جدید</Reassure>
          <Reassure>پرداخت امن با درگاه ایرانی</Reassure>
        </div>
      </div>

      {/* Payment + history */}
      <div style={{ padding: '0 32px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          padding: '20px 22px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
        }}>
          <div style={{ font: 'var(--t-h4)', marginBottom: 12 }}>پرداخت با درگاه ایرانی</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <PayBadge label="زرین‌پال" active/>
            <PayBadge label="پی‌پینگ"/>
            <PayBadge label="ایدی‌پی"/>
          </div>
          <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>
            ✓ امن، رمزنگاری شده، با ضمانت بازگشت در صورت خطا
          </div>
        </div>
        <div style={{
          padding: '20px 22px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
        }}>
          <div style={{ font: 'var(--t-h4)', marginBottom: 12 }}>تاریخچهٔ پرداخت‌ها</div>
          <PayRow date="۲۲ مهر" item="۵۰۰ اعتبار" amount="۹۹٬۰۰۰"/>
          <PayRow date="۸ شهریور" item="۱۰۰ اعتبار" amount="۲۵٬۰۰۰"/>
          <PayRow date="۲۰ مرداد" item="۲۵۰ اعتبار هدیه" amount="—" gift/>
        </div>
      </div>
    </div>
  );
};

const ToggleOpt = ({ active, children }) => (
  <button style={{
    padding: '8px 22px', borderRadius: 999,
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--paper)' : 'var(--ink-2)',
    font: 'var(--t-body-md)',
  }}>{children}</button>
);

const PlanCard = ({ name, price, unit, desc, features, cta, highlight, badge, ctaDisabled }) => (
  <div style={{
    position: 'relative',
    background: highlight ? 'var(--ink)' : 'var(--card)',
    color: highlight ? 'var(--paper)' : 'var(--ink)',
    border: highlight ? 'none' : '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-lg)', padding: '28px 24px',
  }}>
    {badge && (
      <div style={{
        position: 'absolute', top: -10, right: 20,
        padding: '4px 12px', background: 'var(--saffron)',
        color: 'var(--ink)', borderRadius: 999,
        font: 'var(--t-xs)', fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}><StarIcon size={11} stroke="var(--ink)"/> {badge}</div>
    )}
    <div style={{ font: 'var(--t-xs)', color: highlight ? 'var(--saffron)' : 'var(--ink-3)', letterSpacing: 1.5, marginBottom: 8 }}>
      {name.toUpperCase()}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
      <span style={{ font: 'var(--t-display)', fontSize: 40, fontWeight: 700 }}>{price}</span>
      <span style={{ font: 'var(--t-small)', color: highlight ? '#C7C5BF' : 'var(--ink-3)' }}>{unit}</span>
    </div>
    <div style={{ font: 'var(--t-body)', color: highlight ? '#C7C5BF' : 'var(--ink-2)', marginBottom: 20, fontSize: 14 }}>
      {desc}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
      {features.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, font: 'var(--t-small)' }}>
          <span style={{ color: highlight ? 'var(--saffron)' : 'var(--sage)' }}>✓</span>
          <span style={{ color: highlight ? 'var(--paper)' : 'var(--ink-2)' }}>{f}</span>
        </div>
      ))}
    </div>
    <button
      className={highlight ? 'btn btn-accent' : 'btn btn-primary'}
      style={{
        width: '100%', justifyContent: 'center', padding: '12px 0',
        opacity: ctaDisabled ? 0.5 : 1, cursor: ctaDisabled ? 'default' : 'pointer',
        ...(highlight ? {} : {}),
      }}>{cta}</button>
  </div>
);

const CreditPack = ({ credits, price, perUnit, sub, save, popular }) => (
  <div style={{
    position: 'relative',
    background: 'var(--card)', borderRadius: 'var(--r-md)',
    border: popular ? '2px solid var(--saffron)' : '1px solid var(--paper-edge)',
    padding: '20px 18px',
  }}>
    {popular && (
      <div style={{
        position: 'absolute', top: -10, right: 14,
        padding: '2px 8px', background: 'var(--saffron)',
        color: 'var(--ink)', borderRadius: 999, font: 'var(--t-xs)', fontWeight: 700,
      }}>محبوب</div>
    )}
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
      <span style={{ font: 'var(--t-h2)', fontSize: 30, fontWeight: 700 }}>{credits}</span>
      <span style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>اعتبار</span>
    </div>
    <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', marginBottom: 14 }}>{sub}</div>
    <div style={{ font: 'var(--t-h4)', fontSize: 18 }}>{price}<span style={{ font: 'var(--t-small)', color: 'var(--ink-3)', fontWeight: 400 }}> تومان</span></div>
    <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 12 }}>{perUnit}</div>
    {save
      ? <span className="chip chip-sage" style={{ marginBottom: 12 }}>صرفه‌جویی {save}</span>
      : <div style={{ height: 22, marginBottom: 12 }}/>}
    <button className={popular ? 'btn btn-accent' : 'btn btn-primary'} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>خرید</button>
  </div>
);

const Reassure = ({ children }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--t-small)', color: 'var(--ink-2)' }}>
    <span style={{ color: 'var(--sage)' }}><CheckIcon size={15} strokeWidth={3}/></span>
    {children}
  </div>
);

const PayBadge = ({ label, active }) => (
  <div style={{
    padding: '8px 14px',
    background: active ? 'var(--paper-2)' : 'transparent',
    border: active ? '1.5px solid var(--ink)' : '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-sm)',
    font: 'var(--t-small)', fontWeight: active ? 600 : 400,
  }}>{label}</div>
);

const PayRow = ({ date, item, amount, gift }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px dashed var(--paper-edge)',
    font: 'var(--t-small)',
  }}>
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ color: 'var(--ink-3)' }}>{date}</span>
      <span>{item}</span>
    </div>
    <span style={{ color: gift ? 'var(--saffron-deep)' : 'var(--ink)', fontWeight: 600 }}>
      {amount}{!gift && ' تومان'}
    </span>
  </div>
);

window.Plans = Plans;

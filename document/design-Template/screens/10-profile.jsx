// 10 — Profile & settings

const Profile = () => {
  return (
    <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
      <DashHeader credits="۳۲۰" notif={3}/>

      <div style={{
        padding: '28px 32px', display: 'grid', gridTemplateColumns: '240px 1fr',
        gap: 24, maxWidth: 1100, margin: '0 auto',
      }}>
        {/* Sidebar */}
        <aside style={{
          background: 'var(--card-soft)', border: '1px solid var(--paper-edge)',
          borderRadius: 'var(--r-md)', padding: '20px 14px',
          height: 'fit-content',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px 18px', borderBottom: '1px solid var(--paper-edge)', marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)',
              color: 'var(--paper)', display: 'grid', placeItems: 'center',
              font: 'var(--t-h4)',
            }}>ع</div>
            <div>
              <div style={{ font: 'var(--t-body-md)' }}>علی رضایی</div>
              <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>۰۹۱۲ ۳۴۵ ۶۷۸۹</div>
            </div>
          </div>
          <SettNav icon={<UserIcon size={15}/>} label="حساب کاربری" active/>
          <SettNav icon={<LockIcon size={15}/>} label="امنیت و رمز عبور"/>
          <SettNav icon={<CoinIcon size={15}/>} label="اعتبار و تاریخچهٔ خرید"/>
          <SettNav icon={<BellIcon size={15}/>} label="اعلان‌ها"/>
          <SettNav icon={<GlobeIcon size={15}/>} label="زبان و منطقهٔ زمانی"/>
          <SettNav icon={<InfoIcon size={15}/>} label="دربارهٔ نِویسو"/>
          <SettNav icon={<DoorIcon size={15}/>} label="خروج" danger/>
        </aside>

        {/* Main */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Account card */}
          <Card title="حساب کاربری" desc="اطلاعات حساب و پروفایلت را اینجا تغییر بده.">
            <Row label="نام و نام خانوادگی" value="علی رضایی" editable/>
            <Row label="شمارهٔ موبایل" value="۰۹۱۲ ۳۴۵ ۶۷۸۹" badge="تأیید شده"/>
            <Row label="ایمیل (اختیاری)" value="ali@example.com" editable/>
            <Row label="دانشگاه" value="شریف" editable/>
            <Row label="رشته" value="مهندسی برق" editable/>
          </Card>

          {/* Security card */}
          <Card title="رمز عبور" desc="بعد از اولین ورود، می‌توانی رمز عبور تعیین کنی تا نیازی به OTP نباشد.">
            <div style={{
              padding: '14px 16px', background: 'var(--paper-2)',
              borderRadius: 'var(--r-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ font: 'var(--t-body-md)', marginBottom: 2 }}>رمز عبور تنظیم نشده</div>
                <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>هنوز فقط با OTP وارد می‌شوی.</div>
              </div>
              <button className="btn btn-primary">تنظیم رمز</button>
            </div>
          </Card>

          {/* Credit summary + purchase history */}
          <Card title="اعتبار و تاریخچهٔ خرید">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <SummaryBox label="موجودی اعتبار" value="۳۲۰" sub="شارژ اعتبار" link/>
              <SummaryBox label="مصرف این ماه" value="۸۰" sub="اعتبار"/>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 8 }}>خریدهای اخیر</div>
              <PurchaseRow date="۲۲ مهر" item="۵۰۰ اعتبار" amount="۹۹٬۰۰۰"/>
              <PurchaseRow date="۸ شهریور" item="۱۰۰ اعتبار" amount="۲۵٬۰۰۰"/>
              <PurchaseRow date="۲۰ مرداد" item="۲۵۰ اعتبار هدیه" amount="—" gift/>
            </div>
            <div style={{
              marginTop: 14, padding: '12px 14px', background: 'var(--saffron-soft)',
              borderRadius: 'var(--r-sm)', font: 'var(--t-small)', color: 'var(--ink-2)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <SparkSmall stroke="var(--saffron-deep)"/> با هر دعوت دوست به نِویسو، ۵۰ اعتبار جایزه می‌گیری.
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

const SettNav = ({ icon, label, active, danger }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 'var(--r-sm)', marginBottom: 2,
    background: active ? 'var(--paper-2)' : 'transparent',
    color: danger ? 'var(--ruby)' : (active ? 'var(--ink)' : 'var(--ink-2)'),
    font: 'var(--t-body-md)', fontSize: 14,
    cursor: 'pointer',
  }}>
    <span style={{ display: 'inline-flex' }}>{icon}</span>{label}
  </div>
);

const Card = ({ title, desc, children }) => (
  <div style={{
    background: 'var(--card)', border: '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-md)', padding: '24px 26px',
  }}>
    <div style={{ marginBottom: desc ? 16 : 18 }}>
      <h3 style={{ font: 'var(--t-h3)', fontSize: 18, margin: 0 }}>{title}</h3>
      {desc && <p style={{ font: 'var(--t-small)', color: 'var(--ink-3)', margin: '4px 0 0' }}>{desc}</p>}
    </div>
    {children}
  </div>
);

const Row = ({ label, value, editable, badge }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '180px 1fr auto',
    alignItems: 'center', padding: '12px 0',
    borderBottom: '1px dashed var(--paper-edge)',
    gap: 12,
  }}>
    <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>{label}</div>
    <div style={{ font: 'var(--t-body-md)', display: 'flex', gap: 8, alignItems: 'center' }}>
      {value}
      {badge && <span className="chip chip-sage" style={{ fontSize: 10 }}>{badge}</span>}
    </div>
    {editable && <button style={{ font: 'var(--t-small)', color: 'var(--saffron-deep)', background: 'none' }}>ویرایش</button>}
  </div>
);

const PurchaseRow = ({ date, item, amount, gift }) => (
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

const SummaryBox = ({ label, value, sub, link }) => (
  <div style={{
    padding: '16px 18px', background: 'var(--paper)',
    borderRadius: 'var(--r-sm)', border: '1px solid var(--paper-edge)',
  }}>
    <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
    <div style={{ font: 'var(--t-h2)', fontSize: 24, marginBottom: 6 }}>{value}</div>
    <div style={{ font: 'var(--t-small)', color: link ? 'var(--saffron-deep)' : 'var(--ink-3)', cursor: 'pointer' }}>{sub} ←</div>
  </div>
);

window.Profile = Profile;

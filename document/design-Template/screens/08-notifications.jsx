// 08 — Notifications slide-in panel

const Notifications = () => {
  return (
    <div dir="rtl" style={{
      width: '100%', height: '100%',
      background: 'var(--card)', fontFamily: 'var(--font)',
      borderInlineEnd: '1px solid var(--paper-edge)',
      display: 'flex', flexDirection: 'column',
      boxShadow: 'var(--sh-3)',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 22px 16px', borderBottom: '1px solid var(--paper-edge)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h2 style={{ font: 'var(--t-h3)', fontSize: 19, margin: 0 }}>اعلان‌ها</h2>
          <button style={{ font: 'var(--t-small)', color: 'var(--saffron-deep)', background: 'none' }}>
            علامت‌گذاری همه به‌عنوان خوانده‌شده
          </button>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <NotifTab active>همه</NotifTab>
          <NotifTab>خوانده‌نشده <span style={{ color: 'var(--ruby)', marginInlineStart: 4 }}>۳</span></NotifTab>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '12px 0' }}>
        <NotifGroup label="امروز" />
        <NotifItem
          status="ready" title="سری فوریه" folder="ریاضی مهندسی"
          time="۲ دقیقه پیش" unread/>
        <NotifItem
          status="ready" title="انتگرال‌های نامعین" folder="ریاضی مهندسی"
          time="۱۸ دقیقه پیش" unread/>
        <NotifItem
          status="failed" title="جلسهٔ بیستم" folder="فیزیک ۲"
          time="۱ ساعت پیش" unread/>

        <NotifGroup label="دیروز" />
        <NotifItem
          status="ready" title="قانون فارادی" folder="فیزیک ۲" time="۱۹:۰۲"/>
        <NotifItem
          status="ready" title="ساختمان داده" folder="برنامه‌نویسی" time="۱۴:۲۰"/>

        <NotifGroup label="هفتهٔ پیش" />
        <NotifItem status="ready" title="نظامی گنجوی" folder="ادبیات" time="۱۸ آبان"/>
        <NotifItem status="ready" title="مدار RC" folder="مدارها" time="۱۶ آبان"/>
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 22px', borderTop: '1px solid var(--paper-edge)',
        font: 'var(--t-xs)', color: 'var(--ink-3)', textAlign: 'center',
      }}>
        ۵۰ اعلان اخیر · <a style={{ color: 'var(--saffron-deep)' }}>تنظیمات اعلان</a>
      </div>
    </div>
  );
};

const NotifTab = ({ active, children }) => (
  <button style={{
    padding: '6px 12px', borderRadius: 'var(--r-sm)',
    background: active ? 'var(--paper-2)' : 'transparent',
    font: 'var(--t-small)', color: 'var(--ink-2)',
  }}>{children}</button>
);

const NotifGroup = ({ label }) => (
  <div style={{
    padding: '10px 22px 4px', font: 'var(--t-xs)',
    color: 'var(--ink-3)', letterSpacing: 1,
  }}>{label}</div>
);

const NotifItem = ({ status, title, folder, time, unread }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '12px 22px', position: 'relative',
    cursor: 'pointer',
    background: unread ? 'var(--saffron-soft)' : 'transparent',
  }}>
    {unread && (
      <div style={{
        position: 'absolute', right: 10, top: 22,
        width: 6, height: 6, borderRadius: '50%', background: 'var(--saffron)',
      }}/>
    )}
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: status === 'failed' ? 'var(--ruby-soft)' : 'var(--sage-soft)',
      color: status === 'failed' ? 'var(--ruby)' : '#3E5A3F',
      display: 'grid', placeItems: 'center',
    }}>
      {status === 'failed' ? <AlertIcon size={16}/> : <SparkIcon size={16}/>}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: 'var(--t-body)', fontSize: 13.5 }}>
        {status === 'failed' ? (
          <>پردازش «<strong>{title}</strong>» <span style={{ color: 'var(--ruby)' }}>ناموفق بود</span></>
        ) : (
          <>جزوهٔ «<strong>{title}</strong>» آماده شد</>
        )}
      </div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '1px 6px', background: 'var(--paper-2)', borderRadius: 4,
        }}><FolderIcon size={11}/> {folder}</span>
        <span>•</span>
        <span>{time}</span>
      </div>
      {status === 'failed' && (
        <button style={{
          marginTop: 8, padding: '4px 10px', borderRadius: 6,
          background: 'var(--ink)', color: 'var(--paper)',
          font: 'var(--t-xs)',
        }}>تلاش دوباره ←</button>
      )}
    </div>
  </div>
);

window.Notifications = Notifications;

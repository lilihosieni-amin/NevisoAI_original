// Mobile shared chrome — top bar + bottom tab nav. 390px frame.

const MTopBar = ({ title, credits = '۲۶۵', back, action }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderBottom: '1px solid var(--paper-edge)',
    background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 5,
  }}>
    {back ? (
      <button style={{
        width: 36, height: 36, borderRadius: 11, background: 'var(--card)',
        border: '1px solid var(--paper-edge)',
        display: 'grid', placeItems: 'center', color: 'var(--ink)',
      }}><BackIcon size={18}/></button>
    ) : (
      <NevisoLogo size={26}/>
    )}
    <div style={{ flex: 1, font: 'var(--t-h4)', fontSize: 17 }}>{title}</div>
    {action || (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'var(--saffron-soft)', color: 'var(--saffron-deep)',
          padding: '5px 10px', borderRadius: 999, font: 'var(--t-xs)', fontWeight: 600,
        }}>
          <SparkSmall/> {credits}
        </div>
        <button style={{
          width: 34, height: 34, borderRadius: '50%', background: 'var(--paper-2)',
          display: 'grid', placeItems: 'center', color: 'var(--ink)', position: 'relative',
        }}>
          <BellIcon size={15}/>
          <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: 'var(--ruby)', border: '1.5px solid var(--paper)' }}/>
        </button>
      </div>
    )}
  </div>
);

const MBottomNav = ({ active = 'home' }) => {
  const items = [
    { id: 'home', label: 'پوشه‌ها', icon: BooksIcon },
    { id: 'chat', label: 'چت‌بات', icon: ChatIcon },
    { id: 'add',  label: '', icon: null },
    { id: 'plans', label: 'اعتبار', icon: CoinIcon },
    { id: 'me',   label: 'پروفایل', icon: UserIcon },
  ];
  return (
    <div style={{
      position: 'sticky', bottom: 0, zIndex: 5,
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      alignItems: 'center',
      padding: '8px 8px 12px', background: 'var(--card)',
      borderTop: '1px solid var(--paper-edge)',
    }}>
      {items.map(it => it.id === 'add' ? (
        <div key="add" style={{ display: 'grid', placeItems: 'center' }}>
          <button style={{
            width: 52, height: 52, borderRadius: '50%', marginTop: -28,
            background: 'var(--saffron)', color: 'var(--ink)',
            display: 'grid', placeItems: 'center',
            boxShadow: 'var(--sh-3)', border: '3px solid var(--paper)',
          }}><PlusIcon size={24} stroke="var(--ink)"/></button>
        </div>
      ) : (
        <button key={it.id} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: active === it.id ? 'var(--ink)' : 'var(--ink-4)',
        }}>
          <it.icon size={20} stroke={active === it.id ? 'var(--saffron-deep)' : 'var(--ink-4)'}/>
          <span style={{ font: 'var(--t-xs)', fontSize: 10 }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
};

// Phone frame wrapper for canvas
const MFrame = ({ children, noNav, activeNav }) => (
  <div dir="rtl" style={{
    width: '100%', height: '100%',
    background: 'var(--paper)', fontFamily: 'var(--font)', color: 'var(--ink)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }} className="paper-texture">
    <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
    {!noNav && <MBottomNav active={activeNav}/>}
  </div>
);

Object.assign(window, { MTopBar, MBottomNav, MFrame });

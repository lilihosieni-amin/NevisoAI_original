// Mobile screens — part 2: Editor, Chatbot, Plans, Profile, New-folder sheet

// ───────── Editor ─────────
const MEditor = () => (
  <MFrame noNav>
    <MTopBar title="" back action={
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--paper-2)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><PdfIcon size={15}/></button>
        <button style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--saffron)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><ChatIcon size={15} stroke="var(--ink)"/></button>
      </div>
    }/>
    <div style={{ padding: '8px 18px 16px' }}>
      <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 1, marginBottom: 8 }}>
        ریاضی مهندسی · ۲۵ آبان
      </div>
      <h1 style={{ font: 'var(--t-h1)', fontSize: 26, margin: '0 0 12px', lineHeight: 1.2 }}>
        سری فوریه — تابع‌های متناوب
      </h1>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="chip">۱۲ دقیقه مطالعه</span>
        <span className="chip chip-sage">آماده</span>
        <span className="chip">✓ ذخیره خودکار</span>
      </div>

      {/* Audio player at top */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
        padding: '10px 14px', background: 'var(--ink)', color: 'var(--paper)',
        borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-2)',
      }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--saffron)', color: 'var(--ink)', display: 'grid', placeItems: 'center' }}><PlayIcon size={14}/></div>
        <div style={{ flex: 1 }}>
          <div style={{ font: 'var(--t-xs)', color: 'var(--saffron)' }}>صدای کلاس · ۵۲:۱۸</div>
          <div style={{ height: 20, display: 'flex', alignItems: 'center', gap: 2, marginTop: 3 }}>
            {[8,14,20,16,10,18,22,12,8,16,20,14,10,16,12,8,14,18,10,8].map((h, i) => (
              <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: i < 8 ? 'var(--saffron)' : 'rgba(255,255,255,0.25)' }}/>
            ))}
          </div>
        </div>
        <span style={{ font: 'var(--t-xs)' }}>۱۸:۲۴</span>
      </div>

      {/* Toolbar (scrollable) */}
      <div style={{
        display: 'flex', gap: 2, overflowX: 'auto', padding: '6px 8px', marginBottom: 16,
        background: 'var(--card)', border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
      }}>
        {['↶','↷','B','I','U','≡','•','۱.','⊞','✦'].map((t, i) => (
          <button key={i} style={{
            minWidth: 32, height: 30, borderRadius: 6, font: 'var(--t-body-md)', fontSize: 13,
            color: 'var(--ink)', flexShrink: 0,
          }}>{t}</button>
        ))}
      </div>

      <div style={{ font: 'var(--t-body)', fontSize: 15, lineHeight: 1.9 }}>
        <p style={{ margin: '0 0 14px' }}>
          <strong>تعریف:</strong> سری فوریه نمایش یک تابع متناوب به‌صورت مجموعی از سینوس‌ها و کسینوس‌ها است.
        </p>
        <div style={{
          padding: '12px 14px', background: 'var(--paper-2)', borderRadius: 'var(--r-sm)',
          fontStyle: 'italic', borderInlineStart: '3px solid var(--saffron)', margin: '0 0 16px',
        }}>
          f(x) = a₀/2 + Σ [aₙ cos(nπx/L) + bₙ sin(nπx/L)]
        </div>
        <p style={{ margin: '0 0 10px' }}><strong>ضرایب فوریه:</strong></p>
        <ul style={{ margin: '0 0 16px', paddingInlineStart: 22 }}>
          <li>aₙ = <span style={{ background: 'var(--saffron-soft)', padding: '0 4px' }}>۱/L</span> ∫ f(x) cos(nπx/L) dx</li>
          <li>bₙ = ۱/L ∫ f(x) sin(nπx/L) dx</li>
        </ul>
        <p style={{ margin: 0, color: 'var(--ink-2)' }}>
          <strong>نکته:</strong> در نقاط ناپیوستگی، سری به میانگین حد چپ و راست همگرا می‌شود (قضیهٔ دیریکله).
        </p>
      </div>
    </div>
  </MFrame>
);

// ───────── Chatbot ─────────
const MChatbot = () => (
  <MFrame noNav>
    <MTopBar title="چت‌بات" back action={
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--paper-2)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }} title="تاریخچهٔ گفتگو"><ClockIcon size={16}/></button>
        <button style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--ink)', display: 'grid', placeItems: 'center', color: 'var(--paper)' }} title="گفتگوی جدید"><PlusIcon size={16} stroke="var(--paper)"/></button>
      </div>
    }/>

    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    {/* folder + sources strip */}
    <div style={{
      padding: '10px 16px', background: 'var(--card-soft)',
      borderBottom: '1px solid var(--paper-edge)',
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    }}>
      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
        background: 'var(--card)', border: '1px solid var(--paper-edge)', borderRadius: 999,
        font: 'var(--t-xs)', fontWeight: 600, color: 'var(--ink)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8A53D' }}/>
        ریاضی مهندسی <ChevDown size={12}/>
      </button>
      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
        background: 'var(--saffron-soft)', border: '1px solid var(--saffron)', borderRadius: 999,
        font: 'var(--t-xs)', fontWeight: 600, color: 'var(--saffron-deep)',
      }}>
        <BooksIcon size={13} stroke="var(--saffron-deep)"/> منابع گفتگو ۸/۱۲
      </button>
    </div>

    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      <MMsg ai>
        سلام علی 👋 از <strong>۸ جزوهٔ ریاضی مهندسی</strong> اطلاعات دارم. چه سؤالی داری؟
      </MMsg>
      <MMsg>اثبات قضیهٔ دیریکله را توضیح بده؟</MMsg>
      <MMsg ai>
        قضیهٔ دیریکله می‌گوید اگر تابع متناوب و تکه‌ای پیوسته باشد، سری فوریه‌اش در نقاط پیوستگی به خود تابع و در نقاط ناپیوستگی به میانگین حد چپ و راست همگرا می‌شود:
        <div style={{ padding: '8px 12px', background: 'var(--saffron-soft)', borderRadius: 8, marginTop: 8, fontStyle: 'italic' }}>
          S(x₀) = ½ [f(x₀⁺) + f(x₀⁻)]
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <span className="chip" style={{ fontSize: 9 }}>سری فوریه § ۲</span>
          <span className="chip" style={{ fontSize: 9 }}>سری تیلور § ۴</span>
        </div>
      </MMsg>
    </div>

    {/* Composer */}
    <div style={{ padding: '10px 16px 16px', background: 'var(--paper)', borderTop: '1px solid var(--paper-edge)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 8px 8px 14px', background: 'var(--card)',
        border: '1.5px solid var(--ink)', borderRadius: 999,
      }}>
        <span style={{ flex: 1, font: 'var(--t-body)', color: 'var(--ink-4)' }}>سؤالت را بنویس...</span>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)', color: 'var(--paper)', display: 'grid', placeItems: 'center' }}><SendIcon size={15} stroke="var(--paper)"/></button>
      </div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', textAlign: 'center', marginTop: 6 }}>
        ۱ اعتبار به ازای هر سؤال
      </div>
    </div>
    </div>
  </MFrame>
);

// ───────── Chat sources (bottom sheet) ─────────
const MChatSources = () => {
  const notes = [
    { name: 'سری فوریه', sel: true }, { name: 'انتگرال‌های نامعین', sel: true },
    { name: 'حد و پیوستگی', sel: true }, { name: 'مشتق چندمتغیره', sel: true },
    { name: 'تابع‌های هیپربولیک', sel: false }, { name: 'سری تیلور', sel: true },
    { name: 'انتگرال معین', sel: true }, { name: 'دنباله‌ها', sel: true },
    { name: 'قضیهٔ میانگین', sel: false }, { name: 'کاربرد مشتق', sel: true },
  ];
  return (
    <div dir="rtl" style={{ position: 'relative', width: '100%', height: '100%', fontFamily: 'var(--font)' }}>
      <div style={{ filter: 'blur(2px) saturate(0.6)', pointerEvents: 'none', height: '100%' }}>
        <MChatbot/>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(27,27,31,0.45)' }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '82%',
        background: 'var(--card)', borderRadius: '24px 24px 0 0',
        boxShadow: 'var(--sh-3)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '12px 20px 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--paper-edge)', margin: '0 auto 14px' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ font: 'var(--t-h3)', fontSize: 18, margin: 0 }}>منابع گفتگو</h2>
              <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 2 }}>۸ از ۱۲ جزوه انتخاب شده</div>
            </div>
            <button style={{ font: 'var(--t-small)', color: 'var(--saffron-deep)', background: 'none', fontWeight: 600 }}>انتخاب همه</button>
          </div>
        </div>
        <div style={{ padding: '8px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notes.map((n, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 'var(--r-sm)',
              background: n.sel ? 'var(--card)' : 'transparent',
              border: n.sel ? '1px solid var(--paper-edge)' : '1px solid transparent',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: n.sel ? 'var(--saffron)' : 'transparent',
                border: n.sel ? 'none' : '1.5px solid var(--paper-edge)',
                display: 'grid', placeItems: 'center',
              }}>{n.sel && <CheckIcon size={13} strokeWidth={3} stroke="var(--ink)"/>}</div>
              <span style={{ flex: 1, font: 'var(--t-body-md)', fontSize: 14, color: n.sel ? 'var(--ink)' : 'var(--ink-3)' }}>{n.name}</span>
              <MicIcon size={14} stroke="var(--ink-4)"/>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px 20px', borderTop: '1px solid var(--paper-edge)' }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>تأیید منابع</button>
        </div>
      </div>
    </div>
  );
};

// ───────── Chat history (slide-over) ─────────
const MChatHistory = () => {
  const groups = [
    { label: 'امروز', items: [
      { title: 'اثبات قضیهٔ دیریکله', folder: 'ریاضی', active: true },
      { title: 'تفاوت سری و انتگرال فوریه', folder: 'ریاضی' },
    ]},
    { label: 'هفتهٔ گذشته', items: [
      { title: 'معادلهٔ موج', folder: 'فیزیک' },
      { title: 'درختان دودویی', folder: 'برنامه‌نویسی' },
      { title: 'مفهوم آنتروپی', folder: 'فیزیک' },
    ]},
    { label: 'قدیمی‌تر', items: [
      { title: 'انتگرال دوگانه', folder: 'ریاضی' },
      { title: 'قانون گاوس', folder: 'فیزیک' },
    ]},
  ];
  return (
    <MFrame noNav>
      <MTopBar title="تاریخچهٔ گفتگو" back action={
        <button style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--ink)', display: 'grid', placeItems: 'center', color: 'var(--paper)' }}><PlusIcon size={16} stroke="var(--paper)"/></button>
      }/>
      <div style={{ padding: '14px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
          padding: '10px 14px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)', color: 'var(--ink-4)',
        }}>
          <SearchIcon size={16} stroke="var(--ink-3)"/>
          <span style={{ font: 'var(--t-body)' }}>جستجو در گفتگوها...</span>
        </div>
        {groups.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 18 }}>
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 8 }}>{g.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {g.items.map((it, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', background: 'var(--card)',
                  border: it.active ? '1.5px solid var(--saffron)' : '1px solid var(--paper-edge)',
                  borderRadius: 'var(--r-md)',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--saffron-soft)', color: 'var(--saffron-deep)', display: 'grid', placeItems: 'center' }}><ChatIcon size={15}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: 'var(--t-body-md)', fontSize: 14 }}>{it.title}</div>
                    <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{it.folder}</div>
                  </div>
                  <span style={{ color: 'var(--ink-4)', fontSize: 18 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MFrame>
  );
};

const MMsg = ({ ai, children }) => (
  <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: ai ? 'row' : 'row-reverse' }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
      background: ai ? 'var(--saffron)' : 'var(--ink)', color: ai ? 'var(--ink)' : 'var(--paper)',
      display: 'grid', placeItems: 'center', fontWeight: 700,
    }}>{ai ? <SparkIcon size={14}/> : 'ع'}</div>
    <div style={{
      maxWidth: '78%', padding: '12px 14px',
      background: ai ? 'var(--card)' : 'var(--ink)', color: ai ? 'var(--ink)' : 'var(--paper)',
      border: ai ? '1px solid var(--paper-edge)' : 'none',
      borderRadius: ai ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
      font: 'var(--t-body)', fontSize: 14,
    }}>{children}</div>
  </div>
);

// ───────── Plans (credits only) ─────────
const MPlans = () => (
  <MFrame activeNav="plans">
    <MTopBar title="شارژ اعتبار"/>
    <div style={{ padding: '16px' }}>
      {/* Balance */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 18px', background: 'var(--ink)', color: 'var(--paper)',
        borderRadius: 'var(--r-lg)', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--saffron)', color: 'var(--ink)', display: 'grid', placeItems: 'center' }}><CoinIcon size={20} stroke="var(--ink)"/></div>
          <div>
            <div style={{ font: 'var(--t-xs)', color: '#C7C5BF' }}>موجودی فعلی</div>
            <div style={{ font: 'var(--t-h3)', fontSize: 22 }}>۳۲۰ <span style={{ font: 'var(--t-xs)', color: '#C7C5BF', fontWeight: 400 }}>اعتبار</span></div>
          </div>
        </div>
        <div style={{ font: 'var(--t-xs)', color: '#C7C5BF', textAlign: 'left' }}>هر جزوه<br/>≈ <strong style={{ color: 'var(--saffron)' }}>۵۰ اعتبار</strong></div>
      </div>

      <h2 style={{ font: 'var(--t-h3)', fontSize: 18, margin: '0 0 4px' }}>بستهٔ اعتبار بخر</h2>
      <p style={{ font: 'var(--t-small)', color: 'var(--ink-3)', margin: '0 0 14px' }}>
        بدون اشتراک و بدون انقضا. هرچه بیشتر، ارزان‌تر.
      </p>

      {/* credit packs — one per row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <MCreditPack credits="۱۰۰" price="۲۵٬۰۰۰" sub="≈ ۲ جزوه"/>
        <MCreditPack credits="۵۰۰" price="۹۹٬۰۰۰" sub="≈ ۱۰ جزوه" save="٪۲۰" popular/>
        <MCreditPack credits="۱٬۰۰۰" price="۱۷۹٬۰۰۰" sub="≈ ۲۰ جزوه" save="٪۲۸"/>
        <MCreditPack credits="۳٬۰۰۰" price="۴۹۹٬۰۰۰" sub="≈ ۶۰ جزوه" save="٪۳۳"/>
      </div>

      {/* reassurance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <MReassure>اعتبارها هیچ‌وقت منقضی نمی‌شوند</MReassure>
        <MReassure>۲۵۰ اعتبار رایگان برای کاربر جدید</MReassure>
        <MReassure>پرداخت امن با درگاه ایرانی (زرین‌پال)</MReassure>
      </div>
    </div>
  </MFrame>
);

const MReassure = ({ children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', background: 'var(--card)',
    border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
    font: 'var(--t-small)', color: 'var(--ink-2)',
  }}>
    <span style={{ color: 'var(--sage)' }}><CheckIcon size={15} strokeWidth={3}/></span>
    {children}
  </div>
);

const MCreditPack = ({ credits, price, sub, save, popular }) => (
  <div style={{
    position: 'relative', background: 'var(--card)', borderRadius: 'var(--r-md)',
    border: popular ? '2px solid var(--saffron)' : '1px solid var(--paper-edge)',
    padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
  }}>
    {/* left: credits + sub */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ font: 'var(--t-h3)', fontSize: 22 }}>{credits}</span>
        <span style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>اعتبار</span>
        {popular && <span style={{ font: 'var(--t-xs)', color: 'var(--ink)', background: 'var(--saffron)', padding: '1px 8px', borderRadius: 999, fontWeight: 700, marginInlineStart: 4 }}>محبوب</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <span style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)' }}>{sub}</span>
        {save && <span className="chip chip-sage" style={{ fontSize: 10 }}>صرفه {save}</span>}
      </div>
    </div>
    {/* right: price + buy */}
    <div style={{ textAlign: 'left', flexShrink: 0 }}>
      <div style={{ font: 'var(--t-body-md)', marginBottom: 6 }}>{price} <span style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>تومان</span></div>
      <button className={popular ? 'btn btn-accent' : 'btn btn-primary'} style={{ padding: '8px 20px', fontSize: 13 }}>خرید</button>
    </div>
  </div>
);

// ───────── Profile ─────────
const MProfile = () => (
  <MFrame activeNav="me">
    <MTopBar title="پروفایل"/>
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderBottom: '1px solid var(--paper-edge)' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--ink)', color: 'var(--paper)', display: 'grid', placeItems: 'center', font: 'var(--t-h1)', fontSize: 30, marginBottom: 8 }}>ع</div>
      <div style={{ font: 'var(--t-h4)' }}>علی رضایی</div>
      <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', direction: 'ltr' }}>+۹۸ ۹۱۲ ۳۴۵ ۶۷۸۹</div>
    </div>

    {/* Summary cards */}
    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ padding: '14px 16px', background: 'var(--card)', border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)' }}>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 4 }}>مصرف این ماه</div>
        <div style={{ font: 'var(--t-h3)', fontSize: 20 }}>۸۰</div>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 4 }}>اعتبار</div>
      </div>
      <div style={{ padding: '14px 16px', background: 'var(--card)', border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)' }}>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 4 }}>اعتبار</div>
        <div style={{ font: 'var(--t-h3)', fontSize: 20 }}>۳۲۰</div>
        <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', marginTop: 4 }}>شارژ ←</div>
      </div>
    </div>

    {/* Settings list */}
    <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <MSettRow icon={UserIcon} label="حساب کاربری"/>
      <MSettRow icon={LockIcon} label="امنیت و رمز عبور"/>
      <MSettRow icon={BellIcon} label="اعلان‌ها"/>
      <MSettRow icon={GlobeIcon} label="زبان و منطقهٔ زمانی"/>
      <MSettRow icon={InfoIcon} label="دربارهٔ نِویسو"/>
      <MSettRow icon={DoorIcon} label="خروج" danger/>
    </div>
  </MFrame>
);

const MSettRow = ({ icon: Icon, label, danger }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 14px', background: 'var(--card)',
    border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
    color: danger ? 'var(--ruby)' : 'var(--ink)',
  }}>
    <Icon size={18} stroke={danger ? 'var(--ruby)' : 'var(--ink-2)'}/>
    <span style={{ flex: 1, font: 'var(--t-body-md)', fontSize: 14 }}>{label}</span>
    {!danger && <span style={{ color: 'var(--ink-4)', fontSize: 18 }}>›</span>}
  </div>
);

// ───────── New folder (bottom sheet) ─────────
const MNewFolder = () => (
  <div dir="rtl" style={{ position: 'relative', width: '100%', height: '100%', fontFamily: 'var(--font)' }}>
    <div style={{ filter: 'blur(2px) saturate(0.6)', pointerEvents: 'none', height: '100%' }}>
      <MDashboard/>
    </div>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(27,27,31,0.45)' }}/>
    {/* Sheet */}
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: 'var(--card)', borderRadius: '24px 24px 0 0',
      boxShadow: 'var(--sh-3)', padding: '12px 20px 24px',
    }}>
      <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--paper-edge)', margin: '0 auto 18px' }}/>
      <h2 style={{ font: 'var(--t-h3)', fontSize: 20, margin: '0 0 4px' }}>پوشهٔ جدید</h2>
      <p style={{ font: 'var(--t-small)', color: 'var(--ink-3)', margin: '0 0 20px' }}>یک دفترچهٔ جدید بساز.</p>

      {/* Preview + name */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
        <div style={{
          width: 64, height: 84, position: 'relative', flexShrink: 0,
          background: 'var(--card-soft)', borderRadius: '4px 12px 12px 4px',
          boxShadow: 'var(--sh-spine)', border: '1px solid var(--paper-edge)', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 10, background: '#E8A53D' }}/>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 11px, rgba(120,95,50,0.10) 11px, rgba(120,95,50,0.10) 12px)' }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 8 }}>نام پوشه</div>
          <div style={{
            padding: '12px 14px', background: 'var(--paper)',
            border: '1.5px solid var(--ink)', borderRadius: 'var(--r-sm)',
            font: 'var(--t-body-md)', color: 'var(--ink-4)',
          }}>مثلاً ریاضی مهندسی</div>
        </div>
      </div>

      {/* Colors */}
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 10 }}>رنگ شیرازه</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {['#E8A53D','#6B8B6E','#455A8F','#B0413E','#7A5AE0','#2E8A8A','#8B5A3C'].map((c, i) => (
          <div key={c} style={{
            width: 34, height: 34, borderRadius: 10, background: c,
            border: i === 0 ? '2px solid var(--ink)' : '2px solid transparent',
            outline: i === 0 ? '2px solid var(--card)' : 'none', outlineOffset: -4,
          }}/>
        ))}
      </div>

      {/* Cover upload */}
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 10 }}>کاور (اختیاری)</div>
      <button style={{
        width: '100%', padding: '14px', marginBottom: 24,
        background: 'transparent', border: '1.5px dashed var(--paper-edge)',
        borderRadius: 'var(--r-sm)', color: 'var(--ink-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        font: 'var(--t-small)',
      }}>
        <ImageIcon size={16}/> آپلود تصویر کاور
      </button>

      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 0' }}>ساخت پوشه</button>
    </div>
  </div>
);

Object.assign(window, { MEditor, MChatbot, MChatSources, MChatHistory, MPlans, MProfile, MNewFolder });

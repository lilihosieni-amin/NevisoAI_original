// 05 — Upload flow: 3 steps. Step 1 file pick, Step 2 folder+date, Step 3 processing.

const StepDots = ({ active }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
    {[1, 2, 3].map(n => (
      <React.Fragment key={n}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: active >= n ? 'var(--ink)' : 'var(--paper-2)',
          color: active >= n ? 'var(--paper)' : 'var(--ink-3)',
          display: 'grid', placeItems: 'center',
          font: 'var(--t-body-md)', fontSize: 13,
        }}>{n}</div>
        {n < 3 && <div style={{
          flex: 1, height: 2, background: active > n ? 'var(--ink)' : 'var(--paper-2)',
        }}/>}
      </React.Fragment>
    ))}
  </div>
);

const UploadFrame = ({ step, title, sub, children, primary = 'ادامه', back = true }) => (
  <div dir="rtl" style={{
    background: 'var(--paper)', minHeight: '100%',
    padding: '40px 56px', fontFamily: 'var(--font)',
  }} className="paper-texture">
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
      <NevisoLogo size={28}/>
      <div style={{ font: 'var(--t-h4)' }}>نِویسو</div>
      <div style={{ marginInlineStart: 'auto' }}>
        {step !== 3 && (
          <button className="btn" style={{
            background: 'var(--ruby-soft)', color: 'var(--ruby)',
            padding: '8px 14px', fontSize: 13,
          }}><XIcon size={14} stroke="var(--ruby)"/> انصراف از آپلود</button>
        )}
      </div>
    </div>
    <StepDots active={step}/>
    <h1 style={{ font: 'var(--t-h1)', fontSize: 28, margin: '0 0 8px' }}>{title}</h1>
    <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 28px' }}>{sub}</p>
    {children}
    {step < 3 ? (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        {back ? <button className="btn btn-ghost"><BackIcon size={16}/> قبلی</button> : <span/>}
        <button className="btn btn-primary">{primary} <FwdIcon size={16} stroke="var(--paper)"/></button>
      </div>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <button className="btn btn-outline"><BackIcon size={16}/> بازگشت به خانه</button>
      </div>
    )}
  </div>
);

const Upload1 = () => (
  <UploadFrame
    step={1}
    title="فایل‌های کلاس را اضافه کن"
    sub="می‌توانی صدای ضبط‌شده، عکس‌های تخته یا هر دو را همزمان آپلود کنی."
    back={false}
  >
    {/* Big drop zone */}
    <div style={{
      border: '2px dashed var(--saffron)', borderRadius: 'var(--r-lg)',
      padding: '40px 24px', textAlign: 'center',
      background: 'linear-gradient(180deg, var(--saffron-soft), transparent)',
    }}>
      <div style={{
        width: 56, height: 56, margin: '0 auto 14px',
        borderRadius: 16, background: 'var(--saffron)',
        display: 'grid', placeItems: 'center', fontSize: 24, color: 'var(--ink)',
      }}>↑</div>
      <div style={{ font: 'var(--t-h4)', marginBottom: 6 }}>فایل‌ها را اینجا رها کن</div>
      <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginBottom: 14 }}>
        MP3, M4A, WAV — حداکثر ۲ ساعت · JPG, PNG, HEIC — حداکثر ۲۰ تصویر
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn btn-outline"><MicIcon size={14}/> انتخاب صدا</button>
        <button className="btn btn-outline"><CameraIcon size={14}/> انتخاب عکس</button>
      </div>
    </div>

    {/* Already added */}
    <div style={{ marginTop: 24 }}>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 10 }}>اضافه شده (۳)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FileRow kind="audio" name="lecture-25aban.m4a" size="۴۸٫۲ مگابایت" dur="۵۲:۱۸" />
        <FileRow kind="image" name="board-1.jpg" size="۲٫۱ مگابایت" />
        <FileRow kind="image" name="board-2.jpg" size="۱٫۸ مگابایت" />
      </div>
    </div>

    {/* Credit cost */}
    <div style={{
      marginTop: 20, padding: '14px 18px',
      background: 'var(--card)', border: '1px solid var(--paper-edge)',
      borderRadius: 'var(--r-md)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>هزینهٔ تخمینی</div>
        <div style={{ font: 'var(--t-h4)' }}>۵۵ اعتبار</div>
      </div>
      <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>موجودی شما: <strong style={{ color: 'var(--ink)' }}>۳۲۰ اعتبار</strong></div>
    </div>
  </UploadFrame>
);

const FileRow = ({ kind, name, size, dur }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px', background: 'var(--card)',
    border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: 'var(--saffron-soft)', color: 'var(--saffron-deep)',
      display: 'grid', placeItems: 'center',
    }}>{kind === 'image' ? <CameraIcon size={15}/> : <MicIcon size={15}/>}</div>
    <div style={{ flex: 1 }}>
      <div style={{ font: 'var(--t-body-md)', fontSize: 14 }}>{name}</div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{size} {dur && `· ${dur}`}</div>
    </div>
    <span style={{ color: 'var(--ink-3)', cursor: 'pointer' }}>×</span>
  </div>
);

const Upload2 = () => (
  <UploadFrame
    step={2}
    title="پوشه و تاریخ را مشخص کن"
    sub="پوشه را برای دسته‌بندی انتخاب کن. اگر تاریخ را خالی بگذاری، امروز ثبت می‌شود."
  >
    {/* Folder picker */}
    <div style={{ marginBottom: 24 }}>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 10 }}>پوشه</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { title: 'ریاضی مهندسی', color: '#E8A53D', selected: true },
          { title: 'فیزیک ۲', color: '#6B8B6E' },
          { title: 'برنامه‌نویسی', color: '#455A8F' },
          { title: 'ادبیات', color: '#B0413E' },
        ].map((f, i) => (
          <div key={i} style={{
            position: 'relative',
            background: 'var(--card)', borderRadius: 'var(--r-sm)',
            border: f.selected ? '2px solid var(--ink)' : '1px solid var(--paper-edge)',
            padding: '14px 14px 14px 18px', cursor: 'pointer',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, background: f.color }}/>
            <div style={{ font: 'var(--t-body-md)' }}>{f.title}</div>
            {f.selected && <div style={{ position: 'absolute', top: 8, left: 10, font: 16 }}>✓</div>}
          </div>
        ))}
        <div style={{
          background: 'transparent', borderRadius: 'var(--r-sm)',
          border: '2px dashed var(--paper-edge)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: 'var(--ink-3)', font: 'var(--t-body-md)', padding: '14px',
          cursor: 'pointer',
        }}>＋ پوشهٔ جدید</div>
      </div>
    </div>

    {/* Date */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
      <div>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 8 }}>تاریخ ضبط</div>
        <div style={{
          padding: '12px 14px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
          font: 'var(--t-body-md)', display: 'inline-flex', alignItems: 'center', gap: 8,
        }}><CalendarIcon size={16} stroke="var(--ink-3)"/> پنج‌شنبه ۲۹ آبان ۱۴۰۴</div>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 6 }}>پیش‌فرض: امروز</div>
      </div>
      <div>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 8 }}>عنوان (اختیاری)</div>
        <div style={{
          padding: '12px 14px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
          font: 'var(--t-body-md)', color: 'var(--ink-4)',
        }}>هوش مصنوعی پیشنهاد می‌دهد…</div>
      </div>
    </div>

    {/* AI summary banner */}
    <div style={{
      padding: '14px 18px',
      background: 'linear-gradient(95deg, var(--saffron-soft), #FFF6E0)',
      border: '1px solid var(--saffron)', borderRadius: 'var(--r-md)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--saffron)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}><SparkIcon size={16}/></div>
      <div style={{ flex: 1, font: 'var(--t-small)', color: 'var(--ink-2)' }}>
        پس از پردازش، نِویسو یک عنوان مناسب برای جزوه پیشنهاد می‌دهد. بعد می‌توانی آن را تغییر دهی.
      </div>
    </div>
  </UploadFrame>
);

const UploadProgress = () => (
  <UploadFrame
    step={3}
    title="در حال آپلود صدا..."
    sub="فایل در حال ارسال به سرور است. لطفاً صفحه را نبند."
    back={false}
  >
    <div style={{
      background: 'var(--card)', border: '1px solid var(--paper-edge)',
      borderRadius: 'var(--r-lg)', padding: '28px 28px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: 'var(--saffron-soft)',
          color: 'var(--saffron-deep)', display: 'grid', placeItems: 'center', flexShrink: 0,
        }}><MicIcon size={24}/></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: 'var(--t-h4)', fontSize: 16 }}>lecture-25aban.m4a</div>
          <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>۴۸٫۲ مگابایت · ۵۲:۱۸</div>
        </div>
        <div style={{ font: 'var(--t-h3)', fontSize: 22, color: 'var(--saffron-deep)' }}>۴۵٪</div>
      </div>
      <div style={{ height: 10, background: 'var(--paper-2)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          width: '45%', height: '100%', borderRadius: 999,
          background: 'linear-gradient(90deg, var(--saffron-deep), var(--saffron))',
          backgroundSize: '200% 100%', animation: 'upshimmer 1.5s linear infinite',
        }}/>
      </div>
      <style>{`@keyframes upshimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, font: 'var(--t-small)', color: 'var(--ink-3)' }}>
        <span>۲۱٫۷ از ۴۸٫۲ مگابایت</span>
        <span>≈ ۱۱ ثانیه باقی‌مانده</span>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <UploadItemDone name="board-1.jpg" meta="۲٫۱ مگابایت" />
      <UploadItemDone name="board-2.jpg" meta="۱٫۸ مگابایت" />
    </div>

    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
      <button className="btn" style={{ background: 'var(--ruby-soft)', color: 'var(--ruby)' }}><XIcon size={15} stroke="var(--ruby)"/> لغو آپلود</button>
    </div>
  </UploadFrame>
);

const UploadItemDone = ({ name, meta }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px', background: 'var(--card)',
    border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8, background: 'var(--sage-soft)',
      color: '#3E5A3F', display: 'grid', placeItems: 'center',
    }}><CameraIcon size={15}/></div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: 'var(--t-body-md)', fontSize: 14 }}>{name}</div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{meta}</div>
    </div>
    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--sage)', color: 'white', display: 'grid', placeItems: 'center' }}>
      <CheckIcon size={13} strokeWidth={3} stroke="white"/>
    </div>
  </div>
);

const UploadProcessing = () => (
  <UploadFrame
    step={3}
    title="صدا با موفقیت آپلود شد"
    sub="جزوه‌ات در صف آماده‌سازی قرار گرفت."
    back={false}
  >
    {/* Success card */}
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--slate)', color: 'var(--paper)',
      borderRadius: 'var(--r-lg)', padding: '40px 32px',
      marginBottom: 24,
    }}>
      <style>{`@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
                @keyframes spark { 0%,100% { transform: scale(1); opacity:.5 } 50% { transform: scale(1.4); opacity:1 } }
                @keyframes pop { 0% { transform: scale(0.6); opacity: 0 } 60% { transform: scale(1.1) } 100% { transform: scale(1); opacity: 1 } }`}</style>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', width: 84, height: 84 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'var(--sage)', display: 'grid', placeItems: 'center',
            color: 'white',
            boxShadow: '0 0 40px rgba(107,139,110,0.5)',
            animation: 'pop 0.5s ease-out',
          }}><CheckIcon size={40} strokeWidth={3} stroke="white"/></div>
          <div style={{ position: 'absolute', top: -6, right: -6, color: 'var(--saffron)', animation: 'spark 1.4s ease-in-out infinite' }}><SparkIcon size={18}/></div>
          <div style={{ position: 'absolute', bottom: 0, left: -10, color: 'var(--saffron)', animation: 'spark 1.8s ease-in-out infinite .3s' }}><SparkIcon size={14}/></div>
        </div>
        <div style={{ font: 'var(--t-h2)', textAlign: 'center', margin: 0 }}>
          آپلود کامل شد ✓
        </div>
        <div style={{ font: 'var(--t-body)', color: '#C7C5BF', textAlign: 'center', maxWidth: 380 }}>
          نِویسو دارد جزوه‌ات را آماده می‌کند. وقتی متن آماده شد، با یک اعلان خبرت می‌کنیم —
          لازم نیست منتظر بمانی.
        </div>
      </div>
    </div>

    {/* Info row */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 18px', background: 'var(--saffron-soft)',
      border: '1px solid var(--saffron)', borderRadius: 'var(--r-md)',
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--saffron)', color: 'var(--ink)', display: 'grid', placeItems: 'center' }}><BellIcon size={16}/></div>
      <div style={{ flex: 1, font: 'var(--t-small)', color: 'var(--ink-2)' }}>
        زمان تخمینی آماده‌سازی: <strong style={{ color: 'var(--ink)' }}>کمتر از ۳ دقیقه</strong>. می‌توانی از این صفحه خارج شوی.
      </div>
    </div>
  </UploadFrame>
);

const Stage = ({ label, status }) => (
  <div style={{
    padding: '12px 14px',
    background: status === 'pending' ? 'var(--paper-2)' : 'var(--card)',
    border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
    display: 'flex', alignItems: 'center', gap: 8,
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: status === 'done' ? 'var(--sage)' : status === 'active' ? 'var(--saffron)' : 'var(--paper-edge)',
      color: 'white', display: 'grid', placeItems: 'center',
    }}>{status === 'done' ? <CheckIcon size={11} strokeWidth={3}/> : status === 'active' ? <span style={{ font: 'var(--t-xs)', color: 'var(--ink)' }}>···</span> : null}</div>
    <span style={{ font: 'var(--t-small)', color: status === 'pending' ? 'var(--ink-4)' : 'var(--ink)' }}>{label}</span>
  </div>
);

window.Upload1 = Upload1;
window.Upload2 = Upload2;
window.UploadProgress = UploadProgress;
window.UploadProcessing = UploadProcessing;

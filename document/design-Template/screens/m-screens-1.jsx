// Mobile screens — part 1: Dashboard, Folder detail, Upload (3 steps)

// ───────── Dashboard ─────────
const MDashboard = () => {
  const folders = [
    { title: 'ریاضی مهندسی', count: 12, color: '#E8A53D' },
    { title: 'فیزیک ۲', count: 8, color: '#6B8B6E' },
    { title: 'برنامه‌نویسی', count: 15, color: '#455A8F' },
    { title: 'ادبیات فارسی', count: 5, color: '#B0413E' },
  ];
  return (
    <MFrame activeNav="home">
      <MTopBar title="نِویسو"/>
      <div style={{ padding: '18px 16px 8px' }}>
        <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 1, marginBottom: 4 }}>پنج‌شنبه · ۲۹ آبان</div>
        <h1 style={{ font: 'var(--t-h1)', fontSize: 26, margin: 0 }}>سلام علی 👋</h1>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
          color: 'var(--ink-4)',
        }}>
          <SearchIcon size={16} stroke="var(--ink-3)"/>
          <span style={{ font: 'var(--t-body)' }}>جستجوی پوشه یا جزوه...</span>
        </div>
      </div>

      {/* Folders grid 2-col */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h2 style={{ font: 'var(--t-h3)', fontSize: 18, margin: 0 }}>پوشه‌های من</h2>
          <button style={{ font: 'var(--t-small)', color: 'var(--saffron-deep)', background: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>مشاهدهٔ همه <FwdIcon size={14} stroke="var(--saffron-deep)"/></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {folders.map((f, i) => <MFolderCard key={i} {...f}/>)}
          <button style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, minHeight: 120, background: 'transparent',
            border: '2px dashed var(--paper-edge)', borderRadius: 'var(--r-md)',
            color: 'var(--ink-3)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, background: 'var(--paper-2)',
              display: 'grid', placeItems: 'center', fontSize: 22,
            }}>＋</div>
            <span style={{ font: 'var(--t-small)', fontWeight: 600 }}>پوشهٔ جدید</span>
          </button>
        </div>
      </div>

      {/* Recent */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h2 style={{ font: 'var(--t-h3)', fontSize: 18, margin: 0 }}>جزوه‌های اخیر</h2>
          <button style={{ font: 'var(--t-small)', color: 'var(--saffron-deep)', background: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>مشاهدهٔ همه <FwdIcon size={14} stroke="var(--saffron-deep)"/></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MNoteRow title="سری فوریه" folder="ریاضی" color="#E8A53D" time="۲ ساعت پیش"/>
          <MNoteRow title="قانون فارادی" folder="فیزیک ۲" color="#6B8B6E" time="دیروز"/>
          <MNoteRow title="ساختمان داده" folder="برنامه‌نویسی" color="#455A8F" time="دیروز"/>
        </div>
      </div>
    </MFrame>
  );
};

const MStat = ({ label, value }) => (
  <div style={{
    flex: 1, background: 'var(--card)', border: '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-md)', padding: '12px 14px',
  }}>
    <div style={{ font: 'var(--t-h2)', fontSize: 22 }}>{value}</div>
    <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{label}</div>
  </div>
);

const MFolderCard = ({ title, count, color }) => (
  <div style={{
    background: 'var(--card)', borderRadius: 'var(--r-md)',
    border: '1px solid var(--paper-edge)', overflow: 'hidden', position: 'relative',
    boxShadow: 'var(--sh-1)',
  }}>
    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, background: color }}/>
    <div style={{
      height: 70, background: `linear-gradient(140deg, ${color}22, ${color}55)`,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 10, right: 12, width: 30, height: 30, borderRadius: 8,
        background: color, color: 'white', display: 'grid', placeItems: 'center',
      }}><NotebookIconShared size={15} stroke="white"/></div>
    </div>
    <div style={{ padding: '10px 12px 12px' }}>
      <div style={{ font: 'var(--t-body-md)', fontSize: 14, marginBottom: 2 }}>{title}</div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{count} جزوه</div>
    </div>
  </div>
);

const MNoteRow = ({ title, folder, color, time }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px', background: 'var(--card)',
    border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, background: color }}/>
    <div style={{
      width: 36, height: 36, borderRadius: 9, background: `${color}22`, color,
      display: 'grid', placeItems: 'center',
    }}><MicIcon size={16}/></div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: 'var(--t-body-md)', fontSize: 14 }}>{title}</div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{folder} · {time}</div>
    </div>
    <span style={{ color: 'var(--ink-4)', fontSize: 18 }}>›</span>
  </div>
);

// ───────── Folder detail ─────────
const MFolder = () => {
  const notes = [
    { title: 'سری فوریه', date: '۲۵ آبان', dur: '۵۲:۱۸', kind: 'audio', status: 'done' },
    { title: 'انتگرال‌های نامعین', date: '۲۲ آبان', dur: '۴۸:۰۳', kind: 'audio', status: 'done' },
    { title: 'حد و پیوستگی', date: '۱۸ آبان', dur: '—', kind: 'image', status: 'done' },
    { title: 'مشتق چندمتغیره', date: '۱۵ آبان', dur: '۳۹:۲۰', kind: 'audio', status: 'done' },
    { title: 'انتگرال معین', date: '۴ آبان', dur: '—', kind: 'audio', status: 'failed' },
  ];
  return (
    <MFrame activeNav="home">
      <MTopBar title="ریاضی مهندسی" back/>
      {/* Hero */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', gap: 14, alignItems: 'center', borderBottom: '1px solid var(--paper-edge)' }}>
        <div style={{
          width: 56, height: 76, position: 'relative', flexShrink: 0,
          background: 'var(--card)', borderRadius: '3px 10px 10px 3px',
          boxShadow: 'var(--sh-2)', border: '1px solid var(--paper-edge)', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 9, background: '#E8A53D' }}/>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 9px, rgba(120,95,50,0.10) 9px, rgba(120,95,50,0.10) 10px)' }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>۱۲ جزوه · ۸ ساعت ضبط</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn btn-outline" style={{ padding: '7px 12px', fontSize: 12 }}><ChatIcon size={13}/> چت</button>
            <button className="btn btn-outline" style={{ padding: '7px 12px', fontSize: 12 }}><PdfIcon size={13}/> PDF</button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
          color: 'var(--ink-4)',
        }}>
          <SearchIcon size={16} stroke="var(--ink-3)"/>
          <span style={{ font: 'var(--t-body)' }}>جستجو در این پوشه...</span>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 16px', overflowX: 'auto' }}>
        <span className="chip chip-saffron">همه (۵)</span>
        <span className="chip">صدا</span>
        <span className="chip">عکس</span>
        <span className="chip">ترکیبی</span>
      </div>

      {/* Notes */}
      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notes.map((n, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', background: 'var(--card)',
            border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: n.status === 'failed' ? 'var(--ruby-soft)' : 'var(--saffron-soft)',
              color: n.status === 'failed' ? 'var(--ruby)' : 'var(--saffron-deep)',
              display: 'grid', placeItems: 'center',
            }}>{n.kind === 'image' ? <CameraIcon size={15}/> : <MicIcon size={15}/>}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: 'var(--t-body-md)', fontSize: 14 }}>{n.title}</div>
              <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', display: 'flex', gap: 6, alignItems: 'center' }}>
                جلسهٔ {n.date}
                {n.status === 'failed' && <span className="chip chip-ruby" style={{ fontSize: 9, padding: '1px 6px' }}>ناموفق</span>}
                {n.dur !== '—' && n.status !== 'failed' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><PlayIcon size={9}/> {n.dur}</span>}
              </div>
            </div>
            <span style={{ color: 'var(--ink-4)', fontSize: 18 }}>›</span>
          </div>
        ))}
      </div>
    </MFrame>
  );
};

// ───────── Upload (3 steps in one scroll, step indicator) ─────────
const MUpload = () => (
  <MFrame noNav>
    <MTopBar title="جزوهٔ جدید" back action={<span style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>انصراف</span>}/>
    <div style={{ padding: '16px' }}>
      {/* Step dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {[1,2,3].map(n => (
          <React.Fragment key={n}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: n === 1 ? 'var(--ink)' : 'var(--paper-2)',
              color: n === 1 ? 'var(--paper)' : 'var(--ink-3)',
              display: 'grid', placeItems: 'center', font: 'var(--t-xs)', fontWeight: 600,
            }}>{n}</div>
            {n < 3 && <div style={{ flex: 1, height: 2, background: 'var(--paper-2)' }}/>}
          </React.Fragment>
        ))}
      </div>

      <h1 style={{ font: 'var(--t-h2)', fontSize: 22, margin: '0 0 6px' }}>فایل‌ها را اضافه کن</h1>
      <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 20px', fontSize: 14 }}>
        صدای ضبط‌شده، عکس تخته یا هر دو.
      </p>

      {/* Drop zone */}
      <div style={{
        border: '2px dashed var(--saffron)', borderRadius: 'var(--r-lg)',
        padding: '28px 16px', textAlign: 'center',
        background: 'linear-gradient(180deg, var(--saffron-soft), transparent)',
        marginBottom: 16,
      }}>
        <div style={{
          width: 48, height: 48, margin: '0 auto 10px', borderRadius: 14,
          background: 'var(--saffron)', color: 'var(--ink)',
          display: 'grid', placeItems: 'center', fontSize: 22,
        }}>↑</div>
        <div style={{ font: 'var(--t-body-md)', marginBottom: 12 }}>فایل را انتخاب کن</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn btn-outline" style={{ fontSize: 13 }}><MicIcon size={14}/> صدا</button>
          <button className="btn btn-outline" style={{ fontSize: 13 }}><CameraIcon size={14}/> عکس</button>
        </div>
      </div>

      {/* Added files */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <MFileRow kind="audio" name="lecture-25aban.m4a" meta="۴۸٫۲ MB · ۵۲:۱۸"/>
        <MFileRow kind="image" name="board-1.jpg" meta="۲٫۱ MB"/>
      </div>

      {/* Cost */}
      <div style={{
        padding: '12px 14px', background: 'var(--card)',
        border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
      }}>
        <div>
          <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>هزینهٔ تخمینی</div>
          <div style={{ font: 'var(--t-h4)' }}>۵۵ اعتبار</div>
        </div>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>موجودی: <strong style={{ color: 'var(--ink)' }}>۳۲۰</strong></div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 0' }}>
        ادامه <FwdIcon size={16} stroke="var(--paper)"/>
      </button>
    </div>
  </MFrame>
);

const MFileRow = ({ kind, name, meta }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px', background: 'var(--card)',
    border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8, background: 'var(--saffron-soft)',
      color: 'var(--saffron-deep)', display: 'grid', placeItems: 'center',
    }}>{kind === 'image' ? <CameraIcon size={15}/> : <MicIcon size={15}/>}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: 'var(--t-body-md)', fontSize: 13 }}>{name}</div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{meta}</div>
    </div>
    <span style={{ color: 'var(--ink-3)', fontSize: 18 }}>×</span>
  </div>
);

// ───────── Upload step 2 (folder + date) ─────────
const MUpload2 = () => {
  const folders = [
    { title: 'ریاضی مهندسی', color: '#E8A53D', selected: true },
    { title: 'فیزیک ۲', color: '#6B8B6E' },
    { title: 'برنامه‌نویسی', color: '#455A8F' },
    { title: 'ادبیات', color: '#B0413E' },
  ];
  return (
    <MFrame noNav>
      <MTopBar title="جزوهٔ جدید" back action={<span style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>انصراف</span>}/>
      <div style={{ padding: '16px' }}>
        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          {[1,2,3].map(n => (
            <React.Fragment key={n}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: n <= 2 ? 'var(--ink)' : 'var(--paper-2)',
                color: n <= 2 ? 'var(--paper)' : 'var(--ink-3)',
                display: 'grid', placeItems: 'center', font: 'var(--t-xs)', fontWeight: 600,
              }}>{n}</div>
              {n < 3 && <div style={{ flex: 1, height: 2, background: n < 2 ? 'var(--ink)' : 'var(--paper-2)' }}/>}
            </React.Fragment>
          ))}
        </div>

        <h1 style={{ font: 'var(--t-h2)', fontSize: 22, margin: '0 0 6px' }}>پوشه و تاریخ</h1>
        <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 20px', fontSize: 14 }}>
          پوشه را برای دسته‌بندی انتخاب کن.
        </p>

        {/* Folder picker */}
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 10 }}>پوشه</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          {folders.map((f, i) => (
            <div key={i} style={{
              position: 'relative', overflow: 'hidden',
              background: 'var(--card)', borderRadius: 'var(--r-sm)',
              border: f.selected ? '2px solid var(--ink)' : '1px solid var(--paper-edge)',
              padding: '14px 14px 14px 16px',
            }}>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, background: f.color }}/>
              <div style={{ font: 'var(--t-body-md)', fontSize: 14 }}>{f.title}</div>
              {f.selected && <div style={{ position: 'absolute', top: 8, left: 10, color: 'var(--ink)' }}><CheckIcon size={15} strokeWidth={3}/></div>}
            </div>
          ))}
          <button style={{
            gridColumn: 'span 2', padding: '12px',
            background: 'transparent', border: '1.5px dashed var(--paper-edge)',
            borderRadius: 'var(--r-sm)', color: 'var(--ink-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            font: 'var(--t-body-md)', fontSize: 13,
          }}>＋ پوشهٔ جدید</button>
        </div>

        {/* Date */}
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 8 }}>تاریخ ضبط</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
          font: 'var(--t-body-md)', marginBottom: 16,
        }}>
          <CalendarIcon size={16} stroke="var(--ink-3)"/> پنج‌شنبه ۲۹ آبان ۱۴۰۴
        </div>

        {/* Title (optional) */}
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 8 }}>عنوان (اختیاری)</div>
        <div style={{
          padding: '12px 14px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
          font: 'var(--t-body-md)', color: 'var(--ink-4)', marginBottom: 16,
        }}>هوش مصنوعی پیشنهاد می‌دهد…</div>

        {/* AI note */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: 'var(--saffron-soft)',
          border: '1px solid var(--saffron)', borderRadius: 'var(--r-md)', marginBottom: 24,
        }}>
          <SparkSmall stroke="var(--saffron-deep)"/>
          <span style={{ font: 'var(--t-xs)', color: 'var(--ink-2)' }}>
            بعد از پردازش، نِویسو یک عنوان مناسب پیشنهاد می‌دهد.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: '0 0 auto' }}><BackIcon size={16}/> قبلی</button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>آپلود و پردازش <FwdIcon size={16} stroke="var(--paper)"/></button>
        </div>
      </div>
    </MFrame>
  );
};

// ───────── Upload complete ─────────
const MUploadProgress = () => (  <MFrame noNav>
    <MTopBar title="در حال آپلود" back/>
    <div style={{ padding: '16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
      }}>
        {[1,2,3].map(n => (
          <React.Fragment key={n}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: n <= 3 ? 'var(--ink)' : 'var(--paper-2)',
              color: n <= 3 ? 'var(--paper)' : 'var(--ink-3)',
              display: 'grid', placeItems: 'center', font: 'var(--t-xs)', fontWeight: 600,
            }}>{n}</div>
            {n < 3 && <div style={{ flex: 1, height: 2, background: 'var(--ink)' }}/>}
          </React.Fragment>
        ))}
      </div>
      <h1 style={{ font: 'var(--t-h2)', fontSize: 22, margin: '0 0 6px' }}>در حال آپلود صدا...</h1>
      <p style={{ font: 'var(--t-body)', color: 'var(--ink-2)', margin: '0 0 20px', fontSize: 14 }}>
        فایل در حال ارسال به سرور است. لطفاً صفحه را نبند.
      </p>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--paper-edge)',
        borderRadius: 'var(--r-md)', padding: '18px 16px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--saffron-soft)', color: 'var(--saffron-deep)', display: 'grid', placeItems: 'center' }}><MicIcon size={18}/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: 'var(--t-body-md)', fontSize: 13 }}>lecture-25aban.m4a</div>
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>۴۸٫۲ MB · ۵۲:۱۸</div>
          </div>
          <div style={{ font: 'var(--t-h4)', color: 'var(--saffron-deep)' }}>۴۵٪</div>
        </div>
        <div style={{ height: 8, background: 'var(--paper-2)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: '45%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--saffron-deep), var(--saffron))' }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, font: 'var(--t-xs)', color: 'var(--ink-3)' }}>
          <span>۲۱٫۷ از ۴۸٫۲ MB</span><span>≈ ۱۱ ثانیه</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <MFileDone name="board-1.jpg" meta="۲٫۱ MB"/>
        <MFileDone name="board-2.jpg" meta="۱٫۸ MB"/>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <button className="btn" style={{ background: 'var(--ruby-soft)', color: 'var(--ruby)' }}><XIcon size={15} stroke="var(--ruby)"/> لغو آپلود</button>
      </div>
    </div>
  </MFrame>
);

const MFileDone = ({ name, meta }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px', background: 'var(--card)',
    border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--sage-soft)', color: '#3E5A3F', display: 'grid', placeItems: 'center' }}><CameraIcon size={15}/></div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: 'var(--t-body-md)', fontSize: 13 }}>{name}</div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{meta}</div>
    </div>
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--sage)', display: 'grid', placeItems: 'center' }}><CheckIcon size={12} strokeWidth={3} stroke="white"/></div>
  </div>
);

// ───────── Upload complete ─────────
const MProcessing = () => (
  <MFrame noNav>
    <MTopBar title="آپلود کامل شد" back/>
    <div style={{ padding: '16px' }}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--slate)', color: 'var(--paper)',
        borderRadius: 'var(--r-lg)', padding: '32px 20px', marginBottom: 20,
      }}>
        <style>{`@keyframes pop { 0% { transform: scale(0.6); opacity: 0 } 60% { transform: scale(1.1) } 100% { transform: scale(1); opacity: 1 } }`}</style>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--sage)',
            color: 'white', display: 'grid', placeItems: 'center',
            boxShadow: '0 0 40px rgba(107,139,110,0.5)', animation: 'pop 0.5s ease-out',
          }}><CheckIcon size={36} strokeWidth={3} stroke="white"/></div>
          <div style={{ font: 'var(--t-h3)', fontSize: 20, textAlign: 'center' }}>صدا با موفقیت آپلود شد ✓</div>
          <div style={{ font: 'var(--t-small)', color: '#C7C5BF', textAlign: 'center' }}>
            نِویسو دارد جزوه‌ات را آماده می‌کند. وقتی متن آماده شد با یک اعلان خبرت می‌کنیم — لازم نیست منتظر بمانی.
          </div>
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', background: 'var(--saffron-soft)',
        border: '1px solid var(--saffron)', borderRadius: 'var(--r-md)',
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--saffron)', color: 'var(--ink)', display: 'grid', placeItems: 'center' }}><BellIcon size={16}/></div>
        <div style={{ flex: 1, font: 'var(--t-small)', color: 'var(--ink-2)' }}>
          زمان تخمینی: <strong style={{ color: 'var(--ink)' }}>کمتر از ۳ دقیقه</strong>
        </div>
      </div>
      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}><BackIcon size={16} stroke="var(--paper)"/> بازگشت به خانه</button>
    </div>
  </MFrame>
);

const MStage = ({ label, status }) => (
  <div style={{
    padding: '12px 14px', background: status === 'pending' ? 'var(--paper-2)' : 'var(--card)',
    border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
    display: 'flex', alignItems: 'center', gap: 10,
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: status === 'done' ? 'var(--sage)' : status === 'active' ? 'var(--saffron)' : 'var(--paper-edge)',
      color: 'white', display: 'grid', placeItems: 'center',
    }}>{status === 'done' ? <CheckIcon size={11} strokeWidth={3}/> : status === 'active' ? <span style={{ font: 'var(--t-xs)', color: 'var(--ink)' }}>···</span> : null}</div>
    <span style={{ font: 'var(--t-small)', color: status === 'pending' ? 'var(--ink-4)' : 'var(--ink)' }}>{label}</span>
  </div>
);

Object.assign(window, { MDashboard, MFolder, MUpload, MUpload2, MUploadProgress, MProcessing });

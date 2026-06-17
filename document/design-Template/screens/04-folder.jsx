// 04 — Folder detail

const FolderDetail = () => {
  const notes = [
    { title: 'سری فوریه', date: '۲۵ آبان', dur: '۵۲:۱۸', kind: 'audio', tag: 'صدا', status: 'done' },
    { title: 'انتگرال‌های نامعین', date: '۲۲ آبان', dur: '۴۸:۰۳', kind: 'audio', tag: 'صدا', status: 'done' },
    { title: 'حد و پیوستگی', date: '۱۸ آبان', dur: '—', kind: 'image', tag: 'عکس', status: 'done' },
    { title: 'مشتق توابع چندمتغیره', date: '۱۵ آبان', dur: '۳۹:۲۰', kind: 'audio', tag: 'صدا', status: 'done' },
    { title: 'تابع‌های هیپربولیک', date: '۱۱ آبان', dur: '۴۲:۱۰', kind: 'audio', tag: 'صدا', status: 'done' },
    { title: 'سری تیلور', date: '۸ آبان', dur: '۴۵:۰۰', kind: 'both', tag: 'ترکیبی', status: 'done' },
    { title: 'انتگرال معین', date: '۴ آبان', dur: '۵۰:۲۰', kind: 'audio', tag: 'صدا', status: 'failed' },
  ];

  return (
    <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
      <DashHeader/>

      {/* Breadcrumb + hero */}
      <div style={{
        background: 'linear-gradient(180deg, var(--card-soft), transparent)',
        padding: '20px 32px 32px',
        borderBottom: '1px solid var(--paper-edge)',
      }}>
        <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginBottom: 14 }}>
          <span style={{ cursor: 'pointer' }}>پوشه‌ها</span>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: 'var(--ink)' }}>ریاضی مهندسی</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            {/* Notebook avatar */}
            <div style={{
              width: 80, height: 110, position: 'relative',
              background: 'var(--card)', borderRadius: '4px 14px 14px 4px',
              boxShadow: 'var(--sh-3)', border: '1px solid var(--paper-edge)',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 12, background: '#E8A53D' }}/>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 12px, rgba(120,95,50,0.10) 12px, rgba(120,95,50,0.10) 13px)' }}/>
            </div>
            <div>
              <h1 style={{ font: 'var(--t-h1)', fontSize: 30, margin: '0 0 6px' }}>ریاضی مهندسی</h1>
              <div style={{ display: 'flex', gap: 16, font: 'var(--t-small)', color: 'var(--ink-3)' }}>
                <span>۱۲ جزوه</span>
                <span>•</span>
                <span>۸ ساعت ضبط</span>
                <span>•</span>
                <span>ساخته‌شده ۱۲ مهر</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline"><ChatIcon size={14}/> چت با پوشه</button>
            <button className="btn btn-outline"><PdfIcon size={14}/> PDF کل پوشه</button>
            <button className="btn btn-accent">＋ جزوهٔ جدید</button>
            <button className="btn btn-ghost" style={{ padding: '8px 10px' }}>⋯</button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 32px',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="chip chip-saffron">همه (۷)</span>
          <span className="chip">صدا</span>
          <span className="chip">عکس</span>
          <span className="chip">ترکیبی</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', font: 'var(--t-small)', color: 'var(--ink-3)' }}>
          <input placeholder="جستجو در این پوشه..." style={{
            padding: '8px 12px', borderRadius: 'var(--r-sm)',
            border: '1px solid var(--paper-edge)', background: 'var(--card)',
            font: 'var(--t-small)', width: 200,
          }}/>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>ترتیب: <strong style={{ color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>تاریخ <ChevDown size={13}/></strong></span>
        </div>
      </div>

      {/* Notes list */}
      <div style={{ padding: '0 32px 40px' }}>
        <div style={{
          background: 'var(--card)', border: '1px solid var(--paper-edge)',
          borderRadius: 'var(--r-md)', overflow: 'hidden',
        }}>
          {notes.map((n, i) => <NoteRow key={i} {...n} isLast={i === notes.length - 1} />)}
        </div>
      </div>
    </div>
  );
};

const NoteRow = ({ title, date, dur, kind, tag, status, isLast }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 40px',
    padding: '14px 18px',
    borderBottom: isLast ? 'none' : '1px solid var(--paper-edge)',
    alignItems: 'center', font: 'var(--t-body)', fontSize: 14,
    cursor: 'pointer', gap: 12,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: status === 'failed' ? 'var(--ruby-soft)' : 'var(--saffron-soft)',
      color: status === 'failed' ? 'var(--ruby)' : 'var(--saffron-deep)',
      display: 'grid', placeItems: 'center',
    }}>
      {kind === 'image' ? <CameraIcon size={15}/> : kind === 'both' ? <SparkIcon size={15}/> : <MicIcon size={15}/>}
    </div>
    <div>
      <div style={{ font: 'var(--t-body-md)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}
        {status === 'failed' && <span className="chip chip-ruby" style={{ fontSize: 10 }}>ناموفق</span>}
      </div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>جلسهٔ {date}</div>
    </div>
    <span className="chip" style={{ background: 'var(--paper-2)' }}>{tag}</span>
    <span style={{ font: 'var(--t-small)', color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {dur === '—' ? '—' : (<><PlayIcon size={10}/> {dur}</>)}
    </span>
    <span style={{ color: 'var(--ink-3)', textAlign: 'center' }}>⋯</span>
  </div>
);

window.FolderDetail = FolderDetail;
window.NoteRow = NoteRow;

// 06 — Note editor — 3 directions
// A · Classic notebook (paper-ruled background, toolbar top)
// B · Centered column (clean Notion-ish, audio docked bottom)
// C · Two-column (sidebar with audio waveform + outline)

// Shared note content for all variants
const NOTE_TITLE = 'سری فوریه — تابع‌های متناوب';
const NOTE_FOLDER = 'ریاضی مهندسی';
const NOTE_DATE = 'پنج‌شنبه ۲۵ آبان';

const EditorToolbar = ({ compact }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 4,
    padding: compact ? '6px 8px' : '8px 12px',
    background: 'var(--card)', border: '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-md)', flexWrap: 'wrap',
  }}>
    <ToolBtn>↶</ToolBtn><ToolBtn>↷</ToolBtn>
    <Divider/>
    <ToolBtn>B</ToolBtn><ToolBtn><i>I</i></ToolBtn><ToolBtn><u>U</u></ToolBtn>
    <Divider/>
    <ToolBtn label="A" sub="رنگ" color="#B0413E"/>
    <ToolBtn label="A" sub="هایلایت" color="#E8A53D"/>
    <Divider/>
    <ToolBtn>≡</ToolBtn><ToolBtn>•</ToolBtn><ToolBtn>۱.</ToolBtn>
    <Divider/>
    <ToolBtn>⊞</ToolBtn><ToolBtn>↔</ToolBtn>
    <Divider/>
    <ToolBtn>〈 AI 〉</ToolBtn>
  </div>
);

const ToolBtn = ({ children, label, sub, color }) => (
  <button style={{
    width: 34, height: 32, borderRadius: 6, font: 'var(--t-body-md)', fontSize: 13,
    background: 'transparent', color: 'var(--ink)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  }}>
    {label || children}
    {color && <span style={{
      position: 'absolute', bottom: 4, left: 6, right: 6, height: 3,
      background: color, borderRadius: 2,
    }}/>}
  </button>
);
const Divider = () => <span style={{ width: 1, height: 20, background: 'var(--paper-edge)', margin: '0 4px' }}/>;

const AudioBar = ({ inverted }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '12px 18px',
    background: inverted ? 'var(--ink)' : 'var(--card)',
    color: inverted ? 'var(--paper)' : 'var(--ink)',
    border: inverted ? 'none' : '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-md)',
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: 'var(--saffron)', color: 'var(--ink)',
      display: 'grid', placeItems: 'center',
    }}><PlayIcon size={14}/></div>
    <div style={{ flex: 1 }}>
      <div style={{ font: 'var(--t-xs)', color: inverted ? '#C7C5BF' : 'var(--ink-3)' }}>صدای کلاس · ۵۲:۱۸</div>
      <div style={{ height: 28, display: 'flex', alignItems: 'center', gap: 2, marginTop: 4 }}>
        {[8,12,18,22,16,10,14,20,24,18,12,8,10,14,18,22,18,12,8,14,20,16,10,8,12,18,20,14,10,8,12,16,18,14].map((h, i) => (
          <div key={i} style={{
            width: 3, height: h, borderRadius: 2,
            background: i < 14 ? 'var(--saffron)' : (inverted ? 'rgba(255,255,255,0.25)' : 'var(--paper-edge)'),
          }}/>
        ))}
      </div>
    </div>
    <span style={{ font: 'var(--t-small)' }}>۱۸:۲۴ / ۵۲:۱۸</span>
    <span style={{ font: 'var(--t-small)', opacity: 0.7 }}>1.0×</span>
  </div>
);

const NoteContent = ({ paper }) => (
  <div style={{
    font: 'var(--t-body)', fontSize: 15, lineHeight: 1.9,
    color: 'var(--ink)',
  }}>
    <p style={{ margin: '0 0 14px' }}>
      <strong>تعریف:</strong> سری فوریه نمایش یک تابع متناوب به‌صورت مجموعی از سینوس‌ها و کسینوس‌ها است.
      اگر تابع <em>f(x)</em> دورهٔ <em>2L</em> داشته باشد، می‌توان نوشت:
    </p>
    <div style={{
      padding: '14px 18px', background: paper ? 'rgba(255,255,255,0.5)' : 'var(--paper-2)',
      borderRadius: 'var(--r-sm)', font: 'var(--t-body-md)', fontStyle: 'italic',
      borderInlineStart: '3px solid var(--saffron)', margin: '0 0 18px',
    }}>
      f(x) = a₀/2 + Σ [aₙ cos(nπx/L) + bₙ sin(nπx/L)]
    </div>
    <p style={{ margin: '0 0 12px' }}>
      <strong>ضرایب فوریه:</strong>
    </p>
    <ul style={{ margin: '0 0 18px', paddingInlineStart: 24 }}>
      <li>aₙ = <span style={{ background: 'var(--saffron-soft)', padding: '0 4px' }}>۱/L</span> ∫ f(x) cos(nπx/L) dx</li>
      <li>bₙ = ۱/L ∫ f(x) sin(nπx/L) dx</li>
      <li>a₀ = ۱/L ∫ f(x) dx</li>
    </ul>
    <p style={{ margin: '0 0 12px' }}>
      <strong>مثال:</strong> برای تابع پله‌ای <em>f(x) = sign(x)</em> در بازهٔ <em>[-π, π]</em>،
      ضرایب کسینوسی صفر می‌شوند و فقط مؤلفه‌های سینوسی باقی می‌مانند.
    </p>
    <p style={{ margin: 0, color: 'var(--ink-2)' }}>
      <strong>نکتهٔ مهم:</strong> همگرایی نقطه‌به‌نقطه در نقاط ناپیوستگی، به میانگین حد چپ و راست
      تابع همگرا می‌شود (قضیهٔ دیریکله).
    </p>
  </div>
);

// ─────── A · Classic notebook ───────
const EditorA = () => (
  <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
    <DashHeader credits="۲۶۵" notif={1}/>
    {/* Top bar: title + meta + actions */}
    <div style={{
      padding: '20px 32px 16px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'flex-start', gap: 24,
      borderBottom: '1px solid var(--paper-edge)',
    }}>
      <div>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 6 }}>
          پوشه‌ها › <span className="chip chip-saffron" style={{ marginInlineStart: 4 }}>{NOTE_FOLDER}</span>
        </div>
        <input defaultValue={NOTE_TITLE} style={{
          font: 'var(--t-h1)', fontSize: 28, fontWeight: 700,
          border: 'none', background: 'transparent', color: 'var(--ink)',
          padding: 0, width: '100%',
        }}/>
        <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginTop: 4 }}>
          {NOTE_DATE} · ذخیره خودکار ✓
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-outline"><PdfIcon size={14}/> PDF</button>
        <button className="btn btn-outline"><FolderMoveIcon size={14}/> انتقال</button>
        <button className="btn btn-accent"><ChatIcon size={14}/> با این جزوه چت کن</button>
      </div>
    </div>

    <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 780, maxWidth: '100%' }}>
        <EditorToolbar/>
      </div>
    </div>

    {/* Paper sheet */}
    <div style={{ padding: '0 32px 32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 780, maxWidth: '100%', minHeight: 600,
        background: 'var(--card-soft)', borderRadius: 'var(--r-md)',
        border: '1px solid var(--paper-edge)', boxShadow: 'var(--sh-2)',
        padding: '48px 56px 40px 80px',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(120,95,50,0.10) 31px, rgba(120,95,50,0.10) 32px)',
        position: 'relative',
      }}>
        {/* Spine binding */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 32,
          background: 'linear-gradient(to left, var(--paper-2), transparent)',
          borderInlineStart: '1px dashed var(--ruby)',
        }}/>
        <NoteContent paper/>
      </div>
    </div>

    {/* Floating audio dock */}
    <div style={{
      position: 'sticky', bottom: 24, padding: '0 32px 24px',
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{ width: 780, maxWidth: '100%' }}>
        <AudioBar inverted/>
      </div>
    </div>
  </div>
);

// ─────── B · Centered column ───────
const EditorB = () => (
  <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
    <DashHeader credits="۲۶۵" notif={1}/>
    <div style={{ padding: '40px 32px 24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 720, maxWidth: '100%' }}>
        <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 1.5, marginBottom: 8 }}>
          {NOTE_FOLDER.toUpperCase()} · {NOTE_DATE}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <input defaultValue={NOTE_TITLE} style={{
            font: 'var(--t-display)', fontSize: 40, fontWeight: 700, lineHeight: 1.15,
            border: 'none', background: 'transparent', color: 'var(--ink)',
            padding: 0, flex: 1, minWidth: 0, marginBottom: 18,
          }}/>
          <div style={{ display: 'flex', gap: 8, paddingTop: 8, flexShrink: 0 }}>
            <button className="btn btn-outline" style={{ padding: '10px 12px' }}><PdfIcon size={15}/> PDF</button>
            <button className="btn btn-accent" style={{ padding: '10px 12px' }}><ChatIcon size={15}/> چت با جزوه</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <span className="chip">۱۲ دقیقه مطالعه</span>
          <span className="chip chip-sage">آماده</span>
          <span className="chip">✓ ذخیره خودکار</span>
        </div>

        {/* Audio player at top */}
        <div style={{ marginBottom: 24 }}>
          <AudioBar inverted/>
        </div>

        {/* Inline toolbar (sticky) */}
        <div style={{ position: 'sticky', top: 16, marginBottom: 20, zIndex: 2 }}>
          <EditorToolbar/>
        </div>

        <NoteContent/>
      </div>
    </div>
  </div>
);

// ─────── C · Two-column ───────
const EditorC = () => (
  <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
    <DashHeader credits="۲۶۵" notif={1}/>
    <div style={{
      padding: '20px 32px',
      display: 'grid', gridTemplateColumns: '300px 1fr',
      gap: 24, alignItems: 'flex-start',
    }}>
      {/* Sidebar */}
      <aside style={{
        background: 'var(--card-soft)', border: '1px solid var(--paper-edge)',
        borderRadius: 'var(--r-md)', padding: '20px 18px',
        position: 'sticky', top: 16,
      }}>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 10 }}>صدای کلاس</div>
        <AudioBar inverted/>

        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, margin: '24px 0 10px' }}>فهرست</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <OutlineItem active>تعریف سری فوریه</OutlineItem>
          <OutlineItem>ضرایب فوریه (aₙ، bₙ)</OutlineItem>
          <OutlineItem>مثال: تابع پله‌ای</OutlineItem>
          <OutlineItem>قضیهٔ دیریکله</OutlineItem>
        </div>

        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, margin: '24px 0 10px' }}>اطلاعات</div>
        <Meta label="پوشه"><span className="chip chip-saffron">{NOTE_FOLDER}</span></Meta>
        <Meta label="تاریخ">{NOTE_DATE}</Meta>
        <Meta label="مدت صدا">۵۲:۱۸</Meta>
        <Meta label="مصرف">۵۵ اعتبار</Meta>
      </aside>

      {/* Main */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <input defaultValue={NOTE_TITLE} style={{
              font: 'var(--t-h1)', fontSize: 28, fontWeight: 700,
              border: 'none', background: 'transparent', color: 'var(--ink)',
              padding: 0, width: '100%',
            }}/>
            <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginTop: 4 }}>ذخیرهٔ خودکار ✓ · ۲ دقیقه پیش</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline"><PdfIcon size={14}/> PDF</button>
            <button className="btn btn-accent"><ChatIcon size={14}/> چت</button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <EditorToolbar/>
        </div>

        <div style={{
          background: 'var(--card)', border: '1px solid var(--paper-edge)',
          borderRadius: 'var(--r-md)', padding: '32px 36px',
        }}>
          <NoteContent/>
        </div>
      </div>
    </div>
  </div>
);

const OutlineItem = ({ active, children }) => (
  <div style={{
    padding: '6px 10px', borderRadius: 'var(--r-sm)',
    background: active ? 'var(--saffron-soft)' : 'transparent',
    borderInlineEnd: active ? '3px solid var(--saffron)' : '3px solid transparent',
    font: 'var(--t-small)', color: active ? 'var(--ink)' : 'var(--ink-2)',
    cursor: 'pointer',
  }}>{children}</div>
);

const Meta = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', font: 'var(--t-small)' }}>
    <span style={{ color: 'var(--ink-3)' }}>{label}</span>
    <span style={{ color: 'var(--ink)' }}>{children}</span>
  </div>
);

window.EditorA = EditorA;
window.EditorB = EditorB;
window.EditorC = EditorC;
window.AudioBar = AudioBar;

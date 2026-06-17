// 11 — New folder modal
// Folder = notebook with spine color + name + optional cover image.
// Lives on dashboard and inside the upload flow.

const NewFolderModal = ({ onClose }) => {
  const [color, setColor] = React.useState('#E8A53D');
  const [title, setTitle] = React.useState('');
  const [hasCover, setHasCover] = React.useState(false);

  const colors = [
    { name: 'زعفرانی', hex: '#E8A53D' },
    { name: 'مریم‌گلی', hex: '#6B8B6E' },
    { name: 'نیلی',    hex: '#455A8F' },
    { name: 'یاقوتی',  hex: '#B0413E' },
    { name: 'بنفش',    hex: '#7A5AE0' },
    { name: 'قهوه‌ای', hex: '#8B5A3C' },
    { name: 'فیروزه‌ای', hex: '#2E8A8A' },
    { name: 'دودی',    hex: '#4B5563' },
  ];

  return (
    <div dir="rtl" style={{
      width: 560, background: 'var(--card)',
      border: '1px solid var(--paper-edge)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--sh-3)',
      fontFamily: 'var(--font)', color: 'var(--ink)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--paper-edge)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <h2 style={{ font: 'var(--t-h3)', fontSize: 20, margin: '0 0 4px' }}>پوشهٔ جدید</h2>
          <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>
            یک دفترچهٔ جدید برای دسته‌بندی جزوه‌ها بساز.
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--paper-2)', color: 'var(--ink-2)',
          display: 'grid', placeItems: 'center', fontSize: 16,
        }}>×</button>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24 }}>
        {/* Preview */}
        <div>
          <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 10 }}>
            پیش‌نمایش
          </div>
          <NotebookPreview color={color} title={title || 'بدون عنوان'} hasCover={hasCover}/>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="نام پوشه" required>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثلاً ریاضی مهندسی"
              autoFocus
              style={{
                width: '100%', padding: '12px 14px',
                background: 'var(--paper)', border: '1.5px solid var(--ink)',
                borderRadius: 'var(--r-sm)',
                font: 'var(--t-body-md)', color: 'var(--ink)',
                outline: 'none',
              }}/>
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 4, textAlign: 'left' }}>
              {title.length}/۴۰
            </div>
          </Field>

          <Field label="رنگ شیرازه">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
              {colors.map(c => (
                <button key={c.hex} onClick={() => setColor(c.hex)} title={c.name}
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: c.hex, position: 'relative',
                    border: color === c.hex ? '2px solid var(--ink)' : '2px solid transparent',
                    outline: color === c.hex ? '2px solid var(--paper)' : 'none',
                    outlineOffset: -4,
                    cursor: 'pointer', padding: 0,
                  }}/>
              ))}
            </div>
          </Field>

          <Field label="کاور (اختیاری)">
            {hasCover ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: 'var(--paper)',
                border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 6,
                  background: `linear-gradient(135deg, ${color}55, ${color}88)`,
                  display: 'grid', placeItems: 'center', color: 'white',
                }}><ImageIcon size={18}/></div>
                <div style={{ flex: 1, font: 'var(--t-small)' }}>
                  <div style={{ font: 'var(--t-body-md)', fontSize: 13 }}>cover.jpg</div>
                  <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>۲٫۴ مگابایت</div>
                </div>
                <button onClick={() => setHasCover(false)} style={{
                  font: 'var(--t-xs)', color: 'var(--ruby)', background: 'none',
                }}>حذف</button>
              </div>
            ) : (
              <button onClick={() => setHasCover(true)} style={{
                width: '100%', padding: '14px',
                background: 'transparent', border: '1.5px dashed var(--paper-edge)',
                borderRadius: 'var(--r-sm)', color: 'var(--ink-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                font: 'var(--t-small)',
              }}>
                <ImageIcon size={16}/> آپلود تصویر کاور
              </button>
            )}
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 4 }}>
              اگر کاور انتخاب نکنی، رنگ شیرازه به‌عنوان پس‌زمینهٔ پوشه استفاده می‌شود.
            </div>
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 24px', borderTop: '1px solid var(--paper-edge)',
        background: 'var(--card-soft)',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn btn-ghost">انصراف</button>
          <button className="btn btn-primary" disabled={!title}
            style={{ opacity: title ? 1 : 0.5, cursor: title ? 'pointer' : 'not-allowed' }}>
            ساخت پوشه
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div>
    <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 8 }}>
      {label}{required && <span style={{ color: 'var(--ruby)', marginInlineStart: 4 }}>*</span>}
    </div>
    {children}
  </div>
);

const NotebookPreview = ({ color, title, hasCover }) => (
  <div style={{
    width: 160, height: 220, position: 'relative', margin: '0 auto',
    background: hasCover
      ? `linear-gradient(140deg, ${color}33, ${color}66 60%, ${color}99)`
      : 'var(--card-soft)',
    borderRadius: '6px 16px 16px 6px',
    boxShadow: 'var(--sh-spine)',
    border: '1px solid var(--paper-edge)',
    overflow: 'hidden',
  }}>
    {/* Spine */}
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 14,
      background: color, boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.15)',
    }}/>
    {/* Ruled lines */}
    {!hasCover && (
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.5,
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 18px, rgba(120,95,50,0.10) 18px, rgba(120,95,50,0.10) 19px)',
      }}/>
    )}
    {/* Cover image placeholder pattern */}
    {hasCover && (
      <div style={{
        position: 'absolute', top: 12, right: 24, bottom: 60, left: 14,
        background: `linear-gradient(160deg, ${color}88, ${color}cc)`,
        borderRadius: 4, display: 'grid', placeItems: 'center',
        color: 'rgba(255,255,255,0.6)',
      }}><ImageIcon size={28}/></div>
    )}
    {/* Title strip */}
    <div style={{
      position: 'absolute', bottom: 16, right: 24, left: 14,
      padding: '4px 0',
      font: 'var(--t-h4)', fontSize: 13, color: hasCover ? 'white' : 'var(--ink)',
      textShadow: hasCover ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
      direction: 'rtl',
    }}>{title}</div>
  </div>
);

// Wrapper: dashboard B with the modal overlaid
const NewFolderInContext = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* Dim the dashboard behind */}
    <div style={{ filter: 'blur(2px) saturate(0.6)', pointerEvents: 'none' }}>
      <DashboardB/>
    </div>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(27, 27, 31, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center',
    }}>
      <NewFolderModal onClose={() => {}}/>
    </div>
  </div>
);

window.NewFolderModal = NewFolderModal;
window.NewFolderInContext = NewFolderInContext;
window.NotebookPreview = NotebookPreview;

// 13 — All folders page (from "مشاهدهٔ همه" on dashboard)
// Full folder library: search, sort, filter chips, full grid + new-folder tile.

const ALL_FOLDERS = [
  { title: 'ریاضی مهندسی', count: 12, color: '#E8A53D', term: 'پاییز ۱۴۰۴', updated: 'امروز' },
  { title: 'فیزیک ۲', count: 8, color: '#6B8B6E', term: 'پاییز ۱۴۰۴', updated: 'دیروز' },
  { title: 'برنامه‌نویسی', count: 15, color: '#455A8F', term: 'پاییز ۱۴۰۴', updated: 'امروز' },
  { title: 'ادبیات فارسی', count: 5, color: '#B0413E', term: 'پاییز ۱۴۰۴', updated: 'هفتهٔ پیش' },
  { title: 'تاریخ علم', count: 3, color: '#8B5A3C', term: 'بهار ۱۴۰۴', updated: '۲ هفته پیش' },
  { title: 'مدارهای الکتریکی', count: 9, color: '#7A5AE0', term: 'پاییز ۱۴۰۴', updated: '۳ روز پیش' },
  { title: 'معادلات دیفرانسیل', count: 11, color: '#2E8A8A', term: 'بهار ۱۴۰۴', updated: 'هفتهٔ پیش' },
  { title: 'شیمی عمومی', count: 6, color: '#C2185B', term: 'بهار ۱۴۰۴', updated: 'ماه پیش' },
  { title: 'زبان تخصصی', count: 4, color: '#4B5563', term: 'پاییز ۱۴۰۴', updated: '۴ روز پیش' },
  { title: 'آمار و احتمال', count: 7, color: '#D97706', term: 'بهار ۱۴۰۴', updated: '۵ روز پیش' },
];

// ───────── Desktop ─────────
const AllFolders = () => {
  return (
    <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
      <DashHeader credits="۳۲۰" notif={3}/>

      {/* Breadcrumb + title */}
      <div style={{ padding: '24px 32px 8px' }}>
        <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginBottom: 12 }}>
          <span style={{ cursor: 'pointer' }}>داشبورد</span>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: 'var(--ink)' }}>همهٔ پوشه‌ها</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ font: 'var(--t-h1)', fontSize: 32, margin: 0 }}>همهٔ پوشه‌ها</h1>
            <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', marginTop: 4 }}>۱۰ پوشه · ۸۰ جزوه</div>
          </div>
          <button className="btn btn-accent" style={{ padding: '12px 22px' }}>
            <span style={{ fontSize: 16 }}>＋</span> پوشهٔ جدید
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '16px 32px 8px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
          color: 'var(--ink-4)',
        }}>
          <SearchIcon size={16} stroke="var(--ink-3)"/>
          <span style={{ font: 'var(--t-body)' }}>جستجوی پوشه...</span>
        </div>
        <button className="btn btn-outline" style={{ padding: '10px 16px' }}><FilterIcon size={15}/> فیلتر</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', font: 'var(--t-small)', color: 'var(--ink-3)' }}>
          <span>ترتیب:</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '8px 12px', background: 'var(--card)',
            border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-sm)',
            color: 'var(--ink)', fontWeight: 600,
          }}>آخرین بروزرسانی <ChevDown size={13}/></span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '0 32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {ALL_FOLDERS.map((f, i) => <FolderCardCover key={i} {...f}/>)}
          <NewFolderCard/>
        </div>
      </div>
    </div>
  );
};

// ───────── Mobile ─────────
const MAllFolders = () => {
  return (
    <MFrame activeNav="home">
      <MTopBar title="همهٔ پوشه‌ها" back/>
      {/* search */}
      <div style={{ padding: '14px 16px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', background: 'var(--card)',
          border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)',
          color: 'var(--ink-4)',
        }}>
          <SearchIcon size={16} stroke="var(--ink-3)"/>
          <span style={{ font: 'var(--t-body)' }}>جستجوی پوشه...</span>
        </div>
      </div>

      {/* sort line */}
      <div style={{ padding: '12px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>۱۰ پوشه</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: 'var(--t-small)', color: 'var(--ink)', fontWeight: 600 }}>
          آخرین بروزرسانی <ChevDown size={12}/>
        </span>
      </div>

      {/* grid */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {ALL_FOLDERS.map((f, i) => <MFolderCard key={i} {...f}/>)}
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
    </MFrame>
  );
};

Object.assign(window, { AllFolders, MAllFolders });

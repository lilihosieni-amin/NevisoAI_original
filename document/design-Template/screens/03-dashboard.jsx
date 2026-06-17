// 03 — Dashboard: 3 directions
// A · Bookshelf — horizontal shelf with notebook spines (most skeuomorphic)
// B · Card grid — notebook cards with covers (most balanced)
// C · Dense list — list rows with spine stripe (most utilitarian)

// Shared header used across all 3
const DashHeader = ({ credits = '۳۲۰', notif = 3 }) => (
  <header style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 32px', borderBottom: '1px solid var(--paper-edge)',
    background: 'var(--paper)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <NevisoLogo size={28}/>
        <div style={{ font: 'var(--t-h4)' }}>نِویسو</div>
      </div>
      <nav style={{ display: 'flex', gap: 6 }}>
        <NavTab active>پوشه‌ها</NavTab>
        <NavTab>چت‌بات</NavTab>
      </nav>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--saffron-soft)', color: 'var(--saffron-deep)',
        padding: '7px 14px', borderRadius: 999, font: 'var(--t-body-md)', fontSize: 13,
      }}>
        <SparkSmall/> {credits} اعتبار
      </div>
      <div style={{ position: 'relative' }}>
        <button style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--paper-2)', display: 'grid', placeItems: 'center',
          color: 'var(--ink)',
        }}><BellIcon size={16}/></button>
        {notif > 0 && <div style={{
          position: 'absolute', top: -2, right: -2,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--ruby)', color: 'white',
          font: 'var(--t-xs)', display: 'grid', placeItems: 'center',
        }}>{notif}</div>}
      </div>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'var(--ink)', color: 'var(--paper)',
        display: 'grid', placeItems: 'center', font: 'var(--t-body-md)',
      }}>ع</div>
    </div>
  </header>
);

const NavTab = ({ active, children }) => (
  <button style={{
    padding: '8px 14px', borderRadius: 'var(--r-sm)',
    font: 'var(--t-body-md)',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--paper)' : 'var(--ink-2)',
  }}>{children}</button>
);

// Greeting + CTA strip
const Greeting = ({ tight }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: tight ? '24px 32px 12px' : '36px 32px 20px',
  }}>
    <div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 1.5, marginBottom: 6 }}>
        پنج‌شنبه · ۲۹ آبان
      </div>
      <h1 style={{ font: 'var(--t-h1)', fontSize: 32, margin: 0 }}>
        سلام علی، آماده‌ای؟
      </h1>
    </div>
    <button className="btn btn-accent" style={{ padding: '12px 22px', fontSize: 15 }}>
      <span style={{ fontSize: 16 }}>＋</span> جزوهٔ جدید
    </button>
  </div>
);

// ────── A · Bookshelf ──────
const DashboardA = () => {
  const folders = [
    { title: 'ریاضی مهندسی', count: 12, color: '#E8A53D', lastUpd: 'دیروز' },
    { title: 'فیزیک ۲',       count: 8,  color: '#6B8B6E', lastUpd: '۳ روز پیش' },
    { title: 'برنامه‌نویسی',  count: 15, color: '#455A8F', lastUpd: 'امروز' },
    { title: 'ادبیات فارسی',   count: 5,  color: '#B0413E', lastUpd: 'هفتهٔ پیش' },
    { title: 'تاریخ علم',      count: 3,  color: '#8B5A3C', lastUpd: '۲ روز پیش' },
  ];
  return (
    <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
      <DashHeader/>
      <Greeting/>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, padding: '0 32px 28px' }}>
        <StatPill label="جزوه" value="۴۳" />
        <StatPill label="ساعت صدا" value="۱۲" />
        <StatPill label="پوشه" value="۵" />
        <StatPill label="مصرف ماه" value="۸۰" suffix="اعتبار" />
      </div>

      {/* Bookshelf */}
      <div style={{ padding: '0 32px 24px' }}>
        <SectionHead label="قفسهٔ من" sub={`${folders.length} پوشه`} />
        <div style={{
          background: 'linear-gradient(to bottom, transparent 0, transparent 270px, #6B4A2A 270px, #5A3D22 286px, #4A3018 286px)',
          paddingTop: 20, paddingBottom: 60, paddingInline: 20,
          borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
          display: 'flex', alignItems: 'flex-end', gap: 18,
          position: 'relative', overflowX: 'hidden',
        }}>
          {folders.map((f, i) => <BigSpine key={i} {...f} />)}
          {/* New folder placeholder */}
          <div style={{
            width: 130, height: 240, borderRadius: '6px 14px 14px 6px',
            border: '2px dashed var(--paper-edge)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6, color: 'var(--ink-3)', background: 'rgba(255,255,255,0.4)',
          }}>
            <div style={{ font: 28 }}>＋</div>
            <div style={{ font: 'var(--t-small)' }}>پوشهٔ جدید</div>
          </div>
        </div>
      </div>

      {/* Recent notes */}
      <div style={{ padding: '0 32px 40px' }}>
        <SectionHead label="جزوه‌های اخیر" sub="آخرین ۴ مورد" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <RecentNote title="سری فوریه" folder="ریاضی مهندسی" color="#E8A53D" time="۲ ساعت پیش" />
          <RecentNote title="قانون فارادی" folder="فیزیک ۲" color="#6B8B6E" time="دیروز" />
          <RecentNote title="ساختمان داده" folder="برنامه‌نویسی" color="#455A8F" time="دیروز" />
          <RecentNote title="نظامی گنجوی" folder="ادبیات" color="#B0413E" time="۳ روز پیش" />
        </div>
      </div>
    </div>
  );
};

const BigSpine = ({ title, count, color, lastUpd }) => (
  <div style={{
    width: 150, height: 250, position: 'relative',
    background: 'var(--card-soft)',
    borderRadius: '6px 16px 16px 6px',
    boxShadow: 'var(--sh-3)',
    border: '1px solid var(--paper-edge)',
    cursor: 'pointer',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 14,
      background: color, boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.15)',
    }}/>
    <div style={{
      position: 'absolute', inset: 0, opacity: 0.5,
      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 22px, rgba(120,95,50,0.10) 22px, rgba(120,95,50,0.10) 23px)',
    }}/>
    <div style={{
      position: 'relative', padding: '20px 20px 18px 26px',
      height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ font: 'var(--t-h4)', fontSize: 16, marginBottom: 4 }}>{title}</div>
        <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{count} جزوه</div>
      </div>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-4)' }}>{lastUpd}</div>
    </div>
  </div>
);

const StatPill = ({ label, value, suffix }) => (
  <div style={{
    flex: 1, background: 'var(--card)', border: '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-md)', padding: '14px 18px',
  }}>
    <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
    <div style={{ font: 'var(--t-h2)', fontSize: 26, fontWeight: 700 }}>
      {value}
      {suffix && <span style={{ font: 'var(--t-small)', color: 'var(--ink-3)', fontWeight: 400, marginInlineStart: 6 }}>{suffix}</span>}
    </div>
  </div>
);

const SectionHead = ({ label, sub, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <h2 style={{ font: 'var(--t-h3)', fontSize: 20, margin: 0 }}>{label}</h2>
      <span style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>{sub}</span>
    </div>
    {action || <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}>مشاهدهٔ همه <FwdIcon size={14}/></button>}
  </div>
);

const RecentNote = ({ title, folder, color, time }) => (
  <div style={{
    background: 'var(--card)', border: '1px solid var(--paper-edge)',
    borderRadius: 'var(--r-md)', padding: '16px 16px 14px',
    position: 'relative', overflow: 'hidden',
    cursor: 'pointer',
  }}>
    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, background: color }}/>
    <div className="chip" style={{ background: 'var(--paper-2)', marginBottom: 10, fontSize: 10 }}>{folder}</div>
    <div style={{ font: 'var(--t-h4)', fontSize: 15, marginBottom: 18 }}>{title}</div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{time}</div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', font: 'var(--t-xs)', color: 'var(--ink-3)' }}>
        <PlayIcon size={10}/> ۴۲ دقیقه
      </div>
    </div>
  </div>
);

// ────── B · Card grid ──────
const DashboardB = () => {
  const folders = [
    { title: 'ریاضی مهندسی', count: 12, color: '#E8A53D', cover: 'integrals' },
    { title: 'فیزیک ۲',       count: 8,  color: '#6B8B6E', cover: 'waves' },
    { title: 'برنامه‌نویسی',  count: 15, color: '#455A8F', cover: 'code' },
    { title: 'ادبیات فارسی',   count: 5,  color: '#B0413E', cover: 'poem' },
    { title: 'تاریخ علم',      count: 3,  color: '#8B5A3C', cover: 'history' },
    { title: 'مدارهای الکتریکی', count: 9, color: '#7A5AE0', cover: 'circuit' },
  ];
  return (
    <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
      <DashHeader/>
      <Greeting/>
      <div style={{ padding: '0 32px 24px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <input placeholder="جستجوی پوشه یا جزوه..." style={{
            flex: 1, padding: '12px 16px', borderRadius: 'var(--r-md)',
            border: '1px solid var(--paper-edge)', background: 'var(--card)',
            font: 'var(--t-body)',
          }}/>
          <button className="btn btn-outline" style={{ padding: '10px 14px' }}>🔍 فیلتر</button>
          <div style={{
            display: 'flex', padding: 3, background: 'var(--paper-2)',
            borderRadius: 'var(--r-sm)', gap: 2,
          }}>
            <span style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--card)', font: 'var(--t-small)', boxShadow: 'var(--sh-1)' }}>⊞</span>
            <span style={{ padding: '6px 10px', borderRadius: 6, font: 'var(--t-small)', color: 'var(--ink-3)' }}>≡</span>
          </div>
        </div>
        <SectionHead label="پوشه‌های من" sub={`${folders.length} پوشه`} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {folders.map((f, i) => <FolderCardCover key={i} {...f} />)}
          <NewFolderCard/>
        </div>
      </div>

      <div style={{ padding: '12px 32px 40px' }}>
        <SectionHead label="جزوه‌های اخیر" sub="" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <RecentNote title="سری فوریه" folder="ریاضی" color="#E8A53D" time="۲ ساعت پیش" />
          <RecentNote title="قانون فارادی" folder="فیزیک ۲" color="#6B8B6E" time="دیروز" />
          <RecentNote title="ساختمان داده" folder="برنامه‌نویسی" color="#455A8F" time="دیروز" />
          <RecentNote title="نظامی گنجوی" folder="ادبیات" color="#B0413E" time="۳ روز پیش" />
        </div>
      </div>
    </div>
  );
};

const FolderCardCover = ({ title, count, color }) => (
  <div style={{
    background: 'var(--card)', borderRadius: 'var(--r-md)',
    border: '1px solid var(--paper-edge)',
    overflow: 'hidden', cursor: 'pointer',
    boxShadow: 'var(--sh-1)',
    position: 'relative',
  }}>
    {/* Spine stripe right */}
    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 8, background: color }}/>
    {/* "Cover" — abstract paper marbling using color */}
    <div style={{
      height: 110, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(140deg, ${color}22, ${color}44 60%, ${color}66)`,
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.5,
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 18px, rgba(120,95,50,0.10) 18px, rgba(120,95,50,0.10) 19px)',
      }}/>
      <div style={{
        position: 'absolute', top: 12, right: 14,
        width: 36, height: 36, borderRadius: 10,
        background: color, color: 'white',
        display: 'grid', placeItems: 'center',
        boxShadow: 'var(--sh-1)',
      }}><NotebookIcon size={18} stroke="white"/></div>
    </div>
    <div style={{ padding: '14px 16px 16px' }}>
      <div style={{ font: 'var(--t-h4)', fontSize: 15, marginBottom: 4 }}>{title}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: 'var(--t-xs)', color: 'var(--ink-3)' }}>
        <span>{count} جزوه</span>
        <span>← باز کن</span>
      </div>
    </div>
  </div>
);

const NewFolderCard = () => (
  <div style={{
    background: 'transparent', borderRadius: 'var(--r-md)',
    border: '2px dashed var(--paper-edge)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 8, color: 'var(--ink-3)', minHeight: 184, cursor: 'pointer',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: 'var(--paper-2)',
      display: 'grid', placeItems: 'center', fontSize: 22,
    }}>＋</div>
    <div style={{ font: 'var(--t-body-md)' }}>پوشهٔ جدید</div>
  </div>
);

// ────── C · Dense list ──────
const DashboardC = () => {
  const folders = [
    { title: 'ریاضی مهندسی', count: 12, color: '#E8A53D', last: 'سری فوریه', updated: 'امروز ۱۴:۲۰' },
    { title: 'فیزیک ۲',       count: 8,  color: '#6B8B6E', last: 'قانون فارادی', updated: 'دیروز ۱۹:۰۲' },
    { title: 'برنامه‌نویسی',  count: 15, color: '#455A8F', last: 'ساختمان داده', updated: '۳ روز پیش' },
    { title: 'ادبیات فارسی',   count: 5,  color: '#B0413E', last: 'نظامی گنجوی', updated: 'هفتهٔ گذشته' },
    { title: 'تاریخ علم',      count: 3,  color: '#8B5A3C', last: 'انقلاب علمی', updated: 'هفتهٔ گذشته' },
    { title: 'مدارهای الکتریکی', count: 9, color: '#7A5AE0', last: 'مدار RC', updated: '۲ هفته پیش' },
  ];
  return (
    <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
      <DashHeader/>
      <Greeting tight/>
      <div style={{ padding: '0 32px 24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
        {/* Sidebar */}
        <aside style={{
          background: 'var(--card-soft)', border: '1px solid var(--paper-edge)',
          borderRadius: 'var(--r-md)', padding: '20px 16px',
          height: 'fit-content',
        }}>
          <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 10 }}>نمایش</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
            <SidebarItem icon={<BooksIcon size={15}/>} label="همه پوشه‌ها" count={6} active />
            <SidebarItem icon={<StarIcon size={15}/>} label="نشانه‌شده" count={3} />
            <SidebarItem icon={<ClockIcon size={15}/>} label="اخیر" count="" />
            <SidebarItem icon={<TrashIcon size={15}/>} label="سطل زباله" count={0} />
          </div>
          <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 10 }}>فیلتر</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span className="chip chip-saffron">امسال</span>
            <span className="chip">ترم پاییز</span>
            <span className="chip">با صدا</span>
          </div>
        </aside>

        {/* Main list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ font: 'var(--t-h3)', fontSize: 20, margin: 0 }}>{folders.length} پوشه</h2>
            <div style={{ display: 'flex', gap: 8, font: 'var(--t-small)', color: 'var(--ink-3)' }}>
              <span>ترتیب: <strong style={{ color: 'var(--ink)' }}>آخرین بروزرسانی ↓</strong></span>
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--paper-edge)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '24px 2fr 1fr 1.5fr 1fr 32px',
              padding: '10px 18px', borderBottom: '1px solid var(--paper-edge)',
              background: 'var(--paper-2)',
              font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 0.5,
            }}>
              <span></span>
              <span>پوشه</span>
              <span>تعداد جزوه</span>
              <span>آخرین جزوه</span>
              <span>به‌روزشده</span>
              <span></span>
            </div>
            {folders.map((f, i) => <DenseRow key={i} {...f} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, count, active }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 'var(--r-sm)',
    background: active ? 'var(--paper-2)' : 'transparent',
    cursor: 'pointer', font: 'var(--t-body-md)', fontSize: 14,
    color: 'var(--ink-2)',
  }}>
    <span style={{ display: 'inline-flex' }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {count !== '' && <span style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{count}</span>}
  </div>
);

const DenseRow = ({ title, count, color, last, updated }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '24px 2fr 1fr 1.5fr 1fr 32px',
    padding: '14px 18px', borderBottom: '1px solid var(--paper-edge)',
    alignItems: 'center', cursor: 'pointer',
    font: 'var(--t-body)', fontSize: 14,
  }}>
    <div style={{ width: 6, height: 28, background: color, borderRadius: 3 }}/>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}22`, display: 'grid', placeItems: 'center' }}><NotebookIcon size={15} stroke={color}/></div>
      <span style={{ font: 'var(--t-body-md)' }}>{title}</span>
    </div>
    <span style={{ color: 'var(--ink-3)' }}>{count} جزوه</span>
    <span style={{ color: 'var(--ink-2)' }}>{last}</span>
    <span style={{ color: 'var(--ink-3)', font: 'var(--t-small)' }}>{updated}</span>
    <span style={{ color: 'var(--ink-3)', textAlign: 'center' }}>⋯</span>
  </div>
);

// Small inline notebook icon — outline, currentColor-driven
const NotebookIcon = ({ size = 16, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19.5z"/>
    <path d="M5 7h2M5 11h2M5 15h2M5 19h2"/>
  </svg>
);

window.NotebookIcon = NotebookIcon;
window.DashboardA = DashboardA;
window.DashboardB = DashboardB;
window.DashboardC = DashboardC;
window.DashHeader = DashHeader;
window.Greeting = Greeting;
window.SectionHead = SectionHead;
window.RecentNote = RecentNote;
window.StatPill = StatPill;

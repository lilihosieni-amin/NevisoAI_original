// 07 — AI Chatbot

const ChatbotDesktop = () => {
  return (
    <div dir="rtl" style={{ background: 'var(--paper)', minHeight: '100%' }} className="paper-texture">
      <DashHeader credits="۲۶۵" notif={1}/>
      <div style={{
        display: 'grid', gridTemplateColumns: '260px 1fr 280px',
        height: 'calc(100% - 65px)', minHeight: 780,
      }}>
        {/* History sidebar */}
        <aside style={{
          background: 'var(--card-soft)', borderInlineEnd: '1px solid var(--paper-edge)',
          padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            ＋ گفتگوی جدید
          </button>
          <div>
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 8, padding: '0 6px' }}>امروز</div>
            <ChatHistItem title="اثبات قضیهٔ دیریکله" folder="ریاضی" active />
            <ChatHistItem title="تفاوت سری و انتگرال فوریه" folder="ریاضی" />
          </div>
          <div>
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: 1, marginBottom: 8, padding: '0 6px' }}>هفتهٔ گذشته</div>
            <ChatHistItem title="معادلهٔ موج" folder="فیزیک" />
            <ChatHistItem title="درختان دودویی" folder="برنامه‌نویسی" />
            <ChatHistItem title="مفهوم آنتروپی" folder="فیزیک" />
          </div>
        </aside>

        {/* Main chat */}
        <main style={{ display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
          {/* Folder selector bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 32px', borderBottom: '1px solid var(--paper-edge)',
            background: 'var(--card-soft)',
          }}>
            <span style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>گفتگو با:</span>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', background: 'var(--card)', border: '1px solid var(--paper-edge)',
              borderRadius: 999, font: 'var(--t-body-md)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8A53D' }}/>
              ریاضی مهندسی
              <span style={{ color: 'var(--ink-3)' }}>▼</span>
            </div>
            <span style={{ font: 'var(--t-small)', color: 'var(--ink-3)' }}>
              ۸ از ۱۲ جزوه انتخاب شده
            </span>
          </div>

          {/* Conversation */}
          <div style={{ flex: 1, padding: '32px 32px 16px', overflowY: 'hidden' }}>
            {/* AI welcome */}
            <ChatMsg ai>
              سلام علی 👋 من از <strong>۸ جزوهٔ پوشهٔ ریاضی مهندسی</strong> اطلاعات دارم.
              می‌توانم به سؤال‌هایی دربارهٔ سری فوریه، انتگرال‌ها و حد جواب بدهم.
              چه سؤالی داری؟
            </ChatMsg>

            <ChatMsg>اثبات قضیهٔ دیریکله را برام توضیح بده؟</ChatMsg>

            <ChatMsg ai sources>
              قضیهٔ دیریکله می‌گوید اگر تابع <em>f(x)</em> در بازه‌ای متناوب و تکه‌ای پیوسته باشد
              و تعداد نقاط ناپیوستگی محدود داشته باشد، سری فوریهٔ آن:
              <br/><br/>
              <strong>۱.</strong> در نقاط پیوستگی، به مقدار خود تابع همگرا می‌شود<br/>
              <strong>۲.</strong> در نقاط ناپیوستگی، به میانگین حد چپ و راست همگرا می‌شود
              <br/><br/>
              یعنی در نقطهٔ ناپیوستگی x₀:
              <div style={{
                padding: '10px 14px', background: 'var(--saffron-soft)',
                borderRadius: 8, marginTop: 8, font: 'var(--t-body-md)', fontStyle: 'italic',
              }}>S(x₀) = ½ [f(x₀⁺) + f(x₀⁻)]</div>
            </ChatMsg>

            <ChatMsg ai typing/>
          </div>

          {/* Composer */}
          <div style={{ padding: '12px 32px 24px' }}>
            <div style={{
              padding: '12px 14px', background: 'var(--card)',
              border: '1.5px solid var(--ink)', borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'flex-end', gap: 10,
            }}>
              <textarea placeholder="از جزوه‌هایت سؤال بپرس..." style={{
                flex: 1, border: 'none', background: 'transparent', resize: 'none',
                font: 'var(--t-body)', minHeight: 24, outline: 'none', color: 'var(--ink)',
              }} rows={2}/>
              <button style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)',
                color: 'var(--paper)', display: 'grid', placeItems: 'center',
              }}><SendIcon size={16}/></button>
            </div>
            <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>پاسخ‌ها فقط از روی جزوه‌های خودت — بدون دانش بیرونی</span>
              <span>۱ اعتبار به ازای هر سؤال</span>
            </div>
          </div>
        </main>

        {/* Context panel */}
        <aside style={{
          background: 'var(--card-soft)', borderInlineStart: '1px solid var(--paper-edge)',
          padding: '20px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ font: 'var(--t-body-md)' }}>منابع گفتگو</div>
            <span style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)' }}>۸/۱۲</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { name: 'سری فوریه', selected: true },
              { name: 'انتگرال‌های نامعین', selected: true },
              { name: 'حد و پیوستگی', selected: true },
              { name: 'مشتق توابع چندمتغیره', selected: true },
              { name: 'تابع‌های هیپربولیک', selected: false },
              { name: 'سری تیلور', selected: true },
              { name: 'انتگرال معین', selected: true },
            ].map((n, i) => <ContextItem key={i} {...n} />)}
          </div>

          <div style={{
            marginTop: 16, padding: '10px 12px',
            background: 'var(--paper-2)', borderRadius: 'var(--r-sm)',
            font: 'var(--t-xs)', color: 'var(--ink-3)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <SparkSmall stroke="var(--saffron-deep)"/> هوش مصنوعی فقط در جزوه‌های انتخاب‌شده جستجو می‌کند.
          </div>
        </aside>
      </div>
    </div>
  );
};

const ChatHistItem = ({ title, folder, active }) => (
  <div style={{
    padding: '8px 10px', borderRadius: 'var(--r-sm)',
    background: active ? 'var(--paper-2)' : 'transparent',
    cursor: 'pointer', marginBottom: 2,
  }}>
    <div style={{ font: 'var(--t-small)', fontWeight: active ? 600 : 400, color: 'var(--ink)' }}>{title}</div>
    <div style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>{folder}</div>
  </div>
);

const ChatMsg = ({ ai, sources, typing, children }) => (
  <div style={{
    display: 'flex', gap: 12, marginBottom: 20,
    flexDirection: ai ? 'row' : 'row-reverse',
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
      background: ai ? 'var(--saffron)' : 'var(--ink)',
      color: ai ? 'var(--ink)' : 'var(--paper)',
      display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700,
    }}>{ai ? <SparkIcon size={14}/> : 'ع'}</div>
    <div style={{ maxWidth: 600 }}>
      <div style={{
        padding: typing ? '12px 16px' : '14px 18px',
        background: ai ? 'var(--card)' : 'var(--ink)',
        color: ai ? 'var(--ink)' : 'var(--paper)',
        border: ai ? '1px solid var(--paper-edge)' : 'none',
        borderRadius: ai ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        font: 'var(--t-body)', fontSize: 14,
      }}>
        {typing ? <TypingDots/> : children}
      </div>
      {sources && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ font: 'var(--t-xs)', color: 'var(--ink-3)' }}>منابع:</span>
          <span className="chip" style={{ fontSize: 10 }}>سری فوریه § ۲</span>
          <span className="chip" style={{ fontSize: 10 }}>سری تیلور § ۴</span>
        </div>
      )}
    </div>
  </div>
);

const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0' }}>
    <style>{`@keyframes blink { 0%, 80%, 100% { opacity: 0.3 } 40% { opacity: 1 } }`}</style>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--saffron-deep)',
        animation: `blink 1.2s ease-in-out infinite ${i * 0.2}s`,
      }}/>
    ))}
  </div>
);

const ContextItem = ({ name, selected }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 'var(--r-sm)',
    background: selected ? 'var(--card)' : 'transparent',
    border: selected ? '1px solid var(--paper-edge)' : '1px solid transparent',
    cursor: 'pointer',
  }}>
    <div style={{
      width: 16, height: 16, borderRadius: 4,
      background: selected ? 'var(--saffron)' : 'transparent',
      border: selected ? 'none' : '1.5px solid var(--paper-edge)',
      display: 'grid', placeItems: 'center', color: 'var(--ink)', fontSize: 11,
    }}>{selected && '✓'}</div>
    <span style={{ font: 'var(--t-small)', color: selected ? 'var(--ink)' : 'var(--ink-3)' }}>{name}</span>
  </div>
);

window.ChatbotDesktop = ChatbotDesktop;

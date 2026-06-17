// Placeholder card — shown while screens are still being designed.
const Placeholder = ({ label, note }) => (
  <div dir="rtl" style={{
    width: '100%', height: '100%',
    background: 'var(--paper)',
    backgroundImage: 'repeating-linear-gradient(45deg, transparent 0, transparent 12px, rgba(120,95,50,0.05) 12px, rgba(120,95,50,0.05) 13px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 12, padding: 24, fontFamily: 'var(--font)',
    border: '2px dashed var(--paper-edge)',
    borderRadius: 'var(--r-lg)',
  }}>
    <div style={{ font: 'var(--t-xs)', color: 'var(--saffron-deep)', letterSpacing: 2 }}>WIP</div>
    <div style={{ font: 'var(--t-h3)', color: 'var(--ink-2)', textAlign: 'center' }}>{label}</div>
    {note && <div style={{ font: 'var(--t-small)', color: 'var(--ink-3)', textAlign: 'center', maxWidth: 240 }}>{note}</div>}
  </div>
);

window.Placeholder = Placeholder;

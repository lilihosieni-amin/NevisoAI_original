import { NevisoLogo } from '../../components/icons';
import { LoginForm } from '../../components/auth/LoginForm';
import { BrandPanel } from '../../components/auth/BrandPanel';

export const metadata = {
  title: 'ورود | نویسو',
};

/** Auth screen — design template §02 (OTP-first, password optional). */
export default function LoginPage() {
  return (
    <main dir="rtl" className="lg:grid lg:grid-cols-2" style={{ minHeight: '100vh' }}>
      {/* Form column */}
      <div
        className="paper-texture"
        style={{
          background: 'var(--paper)',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 24px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <NevisoLogo size={36} />
          <div style={{ font: 'var(--t-h4)' }}>نِویسو</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <LoginForm />
        </div>
      </div>

      {/* Brand column (desktop) */}
      <BrandPanel />
    </main>
  );
}

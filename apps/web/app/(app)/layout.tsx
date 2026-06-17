import { RouteGuard } from '../../components/auth/RouteGuard';
import { DashHeader } from '../../components/layout/DashHeader';

/** Authenticated app shell: guards the route and renders the shared header. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--paper)' }} className="paper-texture">
        <DashHeader />
        {children}
      </div>
    </RouteGuard>
  );
}

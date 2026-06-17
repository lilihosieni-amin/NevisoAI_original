import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '../components/Providers';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Self-hosted Vazirmatn (ARD §3.2 asset policy — never Google Fonts).
const vazirmatn = localFont({
  src: [
    { path: './fonts/Vazirmatn-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Vazirmatn-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Vazirmatn-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/Vazirmatn-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-vazir',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'نویسو',
  description: 'پلتفرم هوشمند جزوه‌نویسی نویسو',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

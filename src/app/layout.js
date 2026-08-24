import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ImpersonationBanner from '@/components/layout/ImpersonationBanner';

export const metadata = {
  title: 'سنترينو — النظام الذكي لحجز ملاعب كرة القدم',
  description: 'احجز ملعبك المفضل في ثوانٍ بدون مكالمات أو انتظار، مع جداول مواعيد لحظية وأسعار شفافة.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>

      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <ImpersonationBanner />
                <Navbar />
                <main style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>{children}</main>
                <Footer />
              </div>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



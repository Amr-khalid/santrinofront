import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ImpersonationBanner from '@/components/layout/ImpersonationBanner';

export const metadata = {
  title: 'سنترينو أرينا — Santrino Sports | منصة حجز الملاعب والأنشطة الرياضية',
  description:
    'اكتشف واحجز ملاعب البادل، كرة القدم، التنس، وحصص السباحة وصالات اللياقة البدنية في ثوانٍ بأسعار شفافة ودفع كاش في الملعب وبدون أي تعارض في المواعيد.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Marhey:wght@400;600;700&family=Readex+Pro:wght@400;500;600;700;800&family=Inter:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
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



'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import Loader from '@/components/ui/Loader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { AlertTriangle } from 'lucide-react';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('لم يتم استلام رمز تفويض Google (code)');
      setLoading(false);
      return;
    }

    const processGoogleCallback = async () => {
      try {
        const res = await apiRequest('/auth/google/callback', {
          method: 'POST',
          body: JSON.stringify({
            code,
            redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/google/callback` : undefined,
          }),
        });

        if (res.success && res.data) {
          localStorage.setItem('santrino_token', res.data.token);
          showToast(`أهلاً بك يا ${res.data.name}`, 'success');
          // Reload window to sync AuthContext state
          window.location.href = '/';
        } else {
          setError(res.message || 'فشل توثيق الحساب من Google');
        }
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء الاتصال بخوادم Google');
      } finally {
        setLoading(false);
      }
    };

    processGoogleCallback();
  }, [searchParams, router, showToast]);

  if (loading) {
    return <Loader text="جاري التوصيل وتأكيد الحساب..." />;
  }

  return (
    <div className="container text-center" style={{ padding: 'var(--space-12) var(--space-4)', maxWidth: '480px', display: 'flex', justifyContent: 'center' }}>
      <Card padding="lg" style={{ width: '100%' }}>
        <AlertTriangle size={44} style={{ color: 'var(--danger)', margin: '0 auto var(--space-3)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          تعذر استكمال الدخول
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {error}
        </p>
        <Button href="/auth/login" variant="primary" style={{ width: '100%' }}>
          العودة لشاشة تسجيل الدخول
        </Button>
      </Card>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<Loader text="جاري التحميل..." />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}


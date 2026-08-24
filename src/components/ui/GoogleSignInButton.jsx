'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, User } from 'lucide-react';

export default function GoogleSignInButton({ onSuccess, text = 'المتابعة باستخدام Google', style = {} }) {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    // Load official Google Identity Services SDK
    if (typeof window !== 'undefined' && !window.google?.accounts?.id && clientId) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [clientId]);

  const handleGoogleLoginClick = async () => {
    // Standard Real Google OAuth2 Redirect Flow
    if (clientId) {
      const redirectUri = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/google/callback`
        : 'http://localhost:3000/auth/google/callback';

      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

      window.location.href = googleOAuthUrl;
      return;
    }

    // Interactive Fallback Account Picker Modal
    setShowPromptModal(true);
  };

  const handleCustomAccountLogin = async (name, email) => {
    setLoading(true);
    try {
      const user = await loginWithGoogle({
        name: name.trim(),
        email: email.trim(),
        googleId: `google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D6B4F&color=fff`,
      });

      showToast(`أهلاً بك يا ${user.name} 🎉`, 'success');
      setShowPromptModal(false);
      if (onSuccess) onSuccess(user);
    } catch (err) {
      showToast(err.message || 'فشل الدخول بحساب Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleLoginClick}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.65rem',
          width: '100%',
          padding: '0.7rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: '#FFFFFF',
          border: '1px solid #DADCE0',
          color: '#3C4043',
          fontSize: '0.92rem',
          fontWeight: 600,
          fontFamily: 'Inter, IBM Plex Sans Arabic, sans-serif',
          boxShadow: '0 1px 3px rgba(60,64,67,0.08)',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'var(--transition)',
          opacity: loading ? 0.7 : 1,
          ...style,
        }}
        onMouseOver={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#F8F9FA';
        }}
        onMouseOut={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.72L.97 13.04C2.45 15.98 5.48 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.87 10.8c-.18-.53-.28-1.1-.28-1.8s.1-1.27.28-1.8L.97 4.96C.35 6.18 0 7.55 0 9s.35 2.82.97 4.04l2.9-2.24z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.97 4.96l2.9 2.24C4.59 5.05 6.62 3.58 9 3.58z"
          />
        </svg>
        <span>{loading ? 'جاري الاتصال...' : text}</span>
      </button>

      {/* Account Selection Dialog Modal */}
      <Modal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        title="اختر حساب Google للتسجيل"
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            اختر أحد الحسابات المحفوظة أو أدخل إيميل Google الخاص بك مباشرة:
          </p>

          {/* Quick Saved Google Accounts */}
          <div className="flex flex-col gap-2" style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => handleCustomAccountLogin('أحمد محمود', 'ahmed.mahmoud@gmail.com')}
              className="flex items-center gap-3"
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--glass-border)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'right',
                width: '100%',
                transition: 'var(--transition)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                أ
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>أحمد محمود</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ahmed.mahmoud@gmail.com</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCustomAccountLogin('كابتن طارق علي', 'tarek.ali@gmail.com')}
              className="flex items-center gap-3"
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--glass-border)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'right',
                width: '100%',
                transition: 'var(--transition)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                ط
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>كابتن طارق علي</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>tarek.ali@gmail.com</div>
              </div>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            <span>أو أدخل إيميلك الشخصي</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customEmail && customName) {
                handleCustomAccountLogin(customName, customEmail);
              }
            }}
          >
            <Input
              label="الاسم بحساب Google"
              placeholder="مثال: يوسف إبراهيم"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              icon={User}
              required
            />

            <Input
              label="بريد Google الإلكتروني"
              placeholder="name@gmail.com"
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Button variant="primary" type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              المتابعة بهذا الحساب
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}

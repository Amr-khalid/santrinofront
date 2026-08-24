'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogIn, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    const cleanPhone = phone.trim().replace(/[\s\-\+]/g, '');

    if (!cleanPhone) {
      const msg = 'يرجى كتابة رقم الهاتف';
      setStatusMsg({ type: 'error', text: msg });
      return;
    }

    if (!password) {
      const msg = 'يرجى كتابة كلمة المرور';
      setStatusMsg({ type: 'error', text: msg });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: 'info', text: 'جاري تسجيل الدخول...' });

    try {
      const user = await login(cleanPhone, password);
      if (user) {
        setStatusMsg({ type: 'success', text: `أهلاً بك يا ${user.name} 👋` });
        showToast(`أهلاً بك يا ${user.name}`, 'success');

        setTimeout(() => {
          if (user.role === 'superadmin') {
            router.push('/dashboard/superadmin');
          } else if (user.role === 'owner' || user.role === 'admin') {
            router.push('/dashboard');
          } else {
            router.push('/');
          }
        }, 500);
      }

    } catch (err) {
      const errMsg = err.message || 'بيانات الدخول غير صحيحة، يرجى التأكد من الرقم وكلمة المرور';
      setStatusMsg({ type: 'error', text: errMsg });
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        padding: 'var(--space-8) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        minHeight: 'calc(100vh - 76px)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            تسجيل الدخول
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            أدخل بيانات حسابك للوصول لحجوزاتك وإدارة مواعيدك
          </p>
        </div>

        <Card padding="lg">
          {/* Status Alert Banner */}
          {statusMsg.text && (
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background:
                  statusMsg.type === 'error'
                    ? 'var(--danger-light)'
                    : statusMsg.type === 'success'
                    ? 'var(--success-light)'
                    : 'var(--primary-light)',
                border:
                  statusMsg.type === 'error'
                    ? '1px solid var(--danger-border)'
                    : statusMsg.type === 'success'
                    ? '1px solid var(--success-border)'
                    : '1px solid var(--primary-border)',
                color:
                  statusMsg.type === 'error'
                    ? 'var(--danger)'
                    : statusMsg.type === 'success'
                    ? 'var(--success)'
                    : 'var(--primary)',
              }}
            >
              {statusMsg.type === 'error' && <AlertCircle size={16} />}
              {statusMsg.type === 'success' && <CheckCircle size={16} />}
              {statusMsg.type === 'info' && <Loader2 size={16} className="animate-spin" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="رقم الهاتف"
              placeholder="01012345678"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              required
            />

            <div className="input-group">
              <label className="input-label" htmlFor="login-password">
                كلمة المرور
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              loading={loading}
              icon={LogIn}
              style={{ width: '100%', marginTop: 'var(--space-3)' }}
            >
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              marginTop: 'var(--space-5)',
              paddingTop: 'var(--space-4)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            ليس لديك حساب؟{' '}
            <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              إنشاء حساب جديد
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}


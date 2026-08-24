'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { LogIn, Lock, UserPlus } from 'lucide-react';

export default function AuthRequiredModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToLogin = () => {
    onClose();
    router.push('/auth/login');
  };

  const handleGoToRegister = () => {
    onClose();
    router.push('/auth/register');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="يلزم تسجيل الدخول">
      <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-3)',
          }}
        >
          <Lock size={22} />
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
          يلزم تسجيل الدخول لإكمال حجز الملعب
        </h3>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: 'var(--space-5)' }}>
          لتأكيد موعدك وحفظ بيانات الحجز وتفاصيل الماتش، يرجى تسجيل الدخول أو إنشاء حساب جديد.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            onClick={handleGoToLogin}
            icon={LogIn}
            style={{ width: '100%' }}
          >
            تسجيل الدخول
          </Button>

          <Button
            variant="outline"
            onClick={handleGoToRegister}
            icon={UserPlus}
            style={{ width: '100%' }}
          >
            إنشاء حساب جديد
          </Button>

          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              padding: 'var(--space-2)',
            }}
          >
            إلغاء والعودة للجدول
          </button>
        </div>
      </div>
    </Modal>
  );
}


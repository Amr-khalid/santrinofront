'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, User } from 'lucide-react';

export default function ImpersonationBanner() {
  const { user, isImpersonating, stopImpersonation } = useAuth();
  const router = useRouter();

  if (!isImpersonating || !user) return null;

  const handleReturn = () => {
    stopImpersonation();
    router.push('/dashboard/superadmin');
  };

  const getRoleArabic = (role) => {
    switch (role) {
      case 'owner':
        return 'صاحب ملعب';
      case 'admin':
        return 'مسؤول نظام';
      case 'player':
        return 'لاعب';
      default:
        return role;
    }
  };

  return (
    <aside
      aria-label="تنبيه وضع الدخول بصفتك مستخدم آخر"
      style={{
        background: 'linear-gradient(90deg, #B45309 0%, #D97706 100%)',
        color: '#FFFFFF',
        padding: 'var(--space-2) var(--space-4)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        fontSize: '0.875rem',
        fontWeight: 600,
      }}
    >
      <div className="flex items-center gap-2">
        <ShieldAlert size={18} />
        <span>
          أنت تتصفح حالياً بصفتك:{' '}
          <strong style={{ textDecoration: 'underline' }}>{user.name}</strong> ({getRoleArabic(user.role)}) — {user.phone}
        </span>
      </div>

      <button
        onClick={handleReturn}
        style={{
          background: '#FFFFFF',
          color: '#B45309',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '4px var(--space-3)',
          fontWeight: 700,
          fontSize: '0.8125rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all var(--transition-fast)',
        }}
      >
        <ArrowLeft size={14} />
        <span>العودة لحساب المدير العام (SuperAdmin)</span>
      </button>
    </aside>
  );
}

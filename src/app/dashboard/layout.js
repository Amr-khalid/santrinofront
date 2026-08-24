'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ShieldAlert, LogIn, Menu, UserCheck } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading, isOwner } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return <Loader text="جاري التحقق من صلاحيات لوحة التحكم..." />;
  }

  if (!user || !isOwner) {
    return (
      <div className="container text-center" style={{ padding: 'var(--space-12) var(--space-4)', maxWidth: '480px', display: 'flex', justifyContent: 'center' }}>
        <Card style={{ textAlign: 'center', width: '100%' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              background: 'var(--warning-light)',
              color: 'var(--warning)',
              border: '1px solid var(--warning-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            منطقة مخصصة لصاحب الملعب
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            يرجى تسجيل الدخول بحساب صاحب الملعب للوصول إلى لوحة الإحصائيات وإدارة الحجوزات والأسعار.
          </p>
          <div className="flex flex-col gap-2">
            <Button href="/auth/login" variant="primary" icon={LogIn} style={{ width: '100%' }}>
              تسجيل الدخول كصاحب ملعب
            </Button>
            <Button href="/" variant="outline" style={{ width: '100%' }}>
              العودة للرئيسية
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar for Desktop & Mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="dashboard-main-wrapper">
        {/* Admin Top Header Bar */}
        <header className="dashboard-topbar">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mobile-menu-toggle"
            aria-label="فتح القائمة"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="admin-status-badge">
              <span className="status-dot"></span>
              <span>الملعب متاح للحجز</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="user-profile-badge">
              <UserCheck size={15} />
              <span>{user.name || 'مالك الملعب'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}



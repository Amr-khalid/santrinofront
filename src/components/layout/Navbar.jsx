'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isOwner, isSuperAdmin } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link href="/" className="brand-logo" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
          <span>سنترينو</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            جدول المواعيد
          </Link>

          {user && !isOwner && (
            <Link href="/my-bookings" className={`nav-link ${pathname === '/my-bookings' ? 'active' : ''}`}>
              حجوزاتي
            </Link>
          )}

          {isOwner && (
            <Link href="/dashboard" className={`nav-link ${pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/superadmin') ? 'active' : ''}`}>
              لوحة التحكم
            </Link>
          )}

          {isSuperAdmin && (
            <Link href="/dashboard/superadmin" className={`nav-link ${pathname.startsWith('/dashboard/superadmin') ? 'active' : ''}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
              إدارة المسؤولين
            </Link>
          )}
        </div>

        {/* Actions / Theme Toggle / Auth */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-outline btn-sm"
            title={theme === 'dark' ? 'التبديل إلى المظهر الفاتح (النهاري)' : 'التبديل إلى المظهر الداكن (الليلي)'}
            aria-label="تبديل مظهر الموقع"
            style={{
              minHeight: '36px',
              padding: '0 var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mounted && theme === 'light' ? (
              <Moon size={17} style={{ color: 'var(--text-primary)' }} />
            ) : (
              <Sun size={17} style={{ color: '#F59E0B' }} />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2"
                style={{
                  background: 'var(--bg-surface-raised)',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name?.split(' ')[0]}
                </span>
                {isSuperAdmin ? (
                  <Badge variant="danger">سوبر أدمن</Badge>
                ) : isOwner ? (
                  <Badge variant="warning">إدارة</Badge>
                ) : null}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                title="تسجيل الخروج"
              >
                خروج
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="btn btn-outline btn-sm">
                دخول
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                حساب جديد
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}




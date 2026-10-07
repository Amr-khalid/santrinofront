'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Sun, Moon, Compass, CalendarCheck, LayoutDashboard, Shield, LogOut, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isOwner, isSuperAdmin } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Navigation Links (RTL Start) */}
        <div className="nav-links">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            الملاعب والأنشطة
          </Link>

          <Link href="/venues" className={`nav-link ${pathname.startsWith('/venues') ? 'active' : ''}`}>
            الأندية والملاعب
          </Link>

          {user && !isOwner && (
            <Link href="/my-bookings" className={`nav-link ${pathname === '/my-bookings' ? 'active' : ''}`}>
              حجوزاتي
            </Link>
          )}

          {isOwner && (
            <Link
              href="/dashboard"
              className={`nav-link ${pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/superadmin') ? 'active' : ''}`}
            >
              لوحة التحكم
            </Link>
          )}

          {isSuperAdmin && (
            <Link
              href="/dashboard/superadmin"
              className={`nav-link ${pathname.startsWith('/dashboard/superadmin') ? 'active' : ''}`}
              style={{ color: 'var(--primary-text, var(--primary))', fontWeight: 700 }}
            >
              إدارة المسؤولين
            </Link>
          )}
        </div>

        {/* Actions / Theme Toggle / Auth */}
        <div className="flex items-center gap-2">
          {/* Owner Registration Link if not logged in */}
          {!user && (
            <Link href="/auth/register?role=owner" className="btn btn-outline btn-sm sketch-btn hidden sm:inline-flex" style={{ fontSize: '0.8125rem' }}>
              سجّل كصاحب ملعب
            </Link>
          )}

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-outline btn-sm theme-toggle-btn"
            title={theme === 'dark' ? 'التبديل إلى المظهر الفاتح (النهاري)' : 'التبديل إلى المظهر الداكن (الليلي)'}
            aria-label="تبديل مظهر الموقع"
          >
            {mounted && theme === 'light' ? (
              <Moon size={17} style={{ color: 'var(--text-primary)' }} />
            ) : (
              <Sun size={17} style={{ color: '#F59E0B' }} />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="user-badge-box flex items-center gap-2">
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name?.split(' ')[0]}
                </span>
                {isSuperAdmin ? (
                  <Badge variant="danger">سوبر أدمن</Badge>
                ) : isOwner ? (
                  <Badge variant="warning">صاحب ملعب</Badge>
                ) : null}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                title="تسجيل الخروج"
                className="sketch-btn"
                style={{ minHeight: '36px' }}
              >
                خروج
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="sketch-btn" style={{ minHeight: '36px' }}>
                  دخول
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm" className="sketch-btn-primary" style={{ minHeight: '36px' }}>
                  سجّل معانا
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

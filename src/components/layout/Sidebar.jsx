'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CalendarDays, DollarSign, Users, Home, LogOut, X, ShieldCheck, Compass } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout, isSuperAdmin } = useAuth();

  const links = [
    { href: '/dashboard', label: 'لوحة التحكم والمنشآت', icon: LayoutDashboard },
    { href: '/dashboard/bookings', label: 'إدارة الحجوزات', icon: CalendarDays },
    { href: '/dashboard/pricing', label: 'قواعد التسعير', icon: DollarSign },
    { href: '/dashboard/users', label: 'العملاء واللاعبين', icon: Users },
    ...(isSuperAdmin ? [{ href: '/dashboard/superadmin', label: 'إدارة المسؤولين', icon: ShieldCheck }] : []),
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        <div>
          {/* Header & Brand */}
          <div className="flex items-center justify-between" style={{ padding: '0 var(--space-2) var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="brand-logo" style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎾</span>
              <span>سنترينو Sports</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="mobile-close-btn"
                aria-label="إغلاق القائمة"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <Link href="/" onClick={onClose} className="sidebar-link" style={{ color: 'var(--text-secondary)' }}>
            <Compass size={16} />
            <span>عرض المنصة الرئيسية</span>
          </Link>
          <button
            onClick={() => {
              if (onClose) onClose();
              logout();
            }}
            className="sidebar-link"
            style={{ color: 'var(--danger)', width: '100%', textAlign: 'right' }}
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}

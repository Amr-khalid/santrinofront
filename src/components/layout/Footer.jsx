'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, ExternalLink, Calendar, Compass, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { ACTIVITIES } from '@/lib/activities';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        border: '2px solid var(--sketch-line)',
        borderRadius: '255px 20px 225px 20px / 20px 225px 20px 255px',
        boxShadow: '4px 4px 0px var(--sketch-shadow)',
        margin: 'var(--space-8) auto var(--space-4)',
        maxWidth: '1220px',
        width: 'calc(100% - 32px)',
        color: 'var(--text-secondary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ padding: 'var(--space-6) var(--space-4) var(--space-4)' }}>
        {/* Main Footer Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-8)',
            paddingBottom: 'var(--space-6)',
            borderBottom: '2px dashed var(--sketch-line)',
          }}
        >
          {/* Section 1: Brand & Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Santrino Sports Platform
                  </h3>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      display: 'block',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      marginTop: '2px',
                    }}
                  >
                    المنصة الأسهل لحجز الملاعب والأنشطة الرياضية في مصر
                  </span>
                </div>
              </Link>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              منصة بتوصلك بأحسن الملاعب والنوادي في مصر — كورة، بادل، تنس، بسينات، وصالات جيم. احجز ميعادك في ثواني بأسعار واضحة وادفع كاش في الملعب لما تروح من غير وجع دماغ.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-1)',
                fontSize: '0.875rem',
              }}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>تقدر تحجز في أي وقت: متاح 24/7 أونلاين على طول</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span dir="ltr" style={{ fontFamily: 'Inter, sans-serif' }}>
                  +20 100 000 0000
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Popular Sports & Activities */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
              أكتر الرياضات المطلوبة
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
              {ACTIVITIES.slice(0, 8).map((act) => (
                <Link
                  key={act.id}
                  href={`/?activity=${act.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)',
                    padding: '4px 0',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <span>{act.icon}</span>
                  <span>{act.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Section 3: Venues & Cities */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
              أشهر المناطق والملاعب
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
              <li>
                <Link href="/venues" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  📍 القاهرة الجديدة والتجمع الخامس
                </Link>
              </li>
              <li>
                <Link href="/venues" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  📍 الشيخ زايد ومدينة 6 أكتوبر
                </Link>
              </li>
              <li>
                <Link href="/venues" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  📍 المعادي ودجلة
                </Link>
              </li>
              <li>
                <Link href="/venues" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  📍 كفر الشيخ
                </Link>
              </li>
              <li style={{ marginTop: 'var(--space-2)' }}>
                <Link
                  href="/auth/register?role=owner"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <Trophy size={16} />
                  <span>سجّل كصاحب ملعب أو نادي وزوّد حجوزاتك</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            paddingTop: 'var(--space-4)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            جميع الحقوق محفوظة © {currentYear} <strong>سنترينو أرينا — Santrino Sports Platform</strong>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <span>حجز وتأكيد في ثواني</span>
            <span>•</span>
            <span>هتدفع كاش في الملعب</span>
            <span>•</span>
            <span>مفيش تضارب في المواعيد</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

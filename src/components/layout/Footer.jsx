'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Calendar,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'var(--space-8)',
        color: 'var(--text-secondary)',
        position: 'relative',
      }}
    >
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-5)' }}>
        {/* Main Footer Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'center',
            paddingBottom: 'var(--space-6)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Section 1: Brand & Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  سنترينو
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
                  نادي سانتوريني الرياضي
                </span>
              </Link>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-1)',
                fontSize: '0.875rem',
              }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>نادي سانتوريني الرياضي</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>المواعيد: يومياً من ٨:٠٠ صباحاً حتى ٢:٠٠ فجراً</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span dir="ltr" style={{ fontFamily: 'Inter, sans-serif' }}>
                  +20 101 234 5678
                </span>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-1)' }}>
              <Link
                href="/"
                className="nav-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 'var(--space-1) 0',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                <Calendar size={15} />
                <span>عرض جدول المواعيد والحجز</span>
              </Link>
            </div>
          </div>

          {/* Section 2: Google Maps Embed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MapPin size={15} style={{ color: 'var(--primary)' }} />
                <span>موقع الملعب على الخريطة</span>
              </span>
              <a
                href="https://maps.google.com/?q=31.11856556688527,30.654737125336734"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
                title="فتح في خرائط جوجل"
              >
                <span>فتح في خرائط Google</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Responsive iFrame Map Container */}
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-raised)',
                height: '180px',
                width: '100%',
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3415.68213630317!2d30.654737125336734!3d31.11856556688527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f65b002132caed%3A0x2515000a470200ac!2z2YbYp9iv2Ykg2LPYp9mG2KrZiNix2YrZhtmJ!5e0!3m2!1sar!2seg!4v1787569969934!5m2!1sar!2seg"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="موقع نادي سانتوريني"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div
          style={{
            paddingTop: 'var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>© {currentYear} سنترينو — نادي سانتوريني الرياضي. جميع الحقوق محفوظة.</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            نظام حجز الملاعب
          </span>
        </div>
      </div>
    </footer>
  );
}

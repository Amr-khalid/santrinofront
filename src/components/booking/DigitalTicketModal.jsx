'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDateArabic, formatSlotRange12h } from '@/lib/utils';
import { getActivityMeta } from '@/lib/activities';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Share2,
  Printer,
  ExternalLink,
  ShieldCheck,
  Ticket,
  Users,
  Phone,
} from 'lucide-react';

export default function DigitalTicketModal({ isOpen, onClose, booking }) {
  if (!booking) return null;

  const activityMeta = getActivityMeta(booking.activityType || booking.facility?.activityType);
  const venueName = booking.venue?.name || booking.facility?.venue?.name || 'سنترينو أرينا';
  const venueAddress = booking.venue?.location?.address || booking.field?.location?.address || 'القاهرة';
  const venueMapUrl = booking.venue?.location?.mapUrl || 'https://maps.google.com';
  const facilityName = booking.facility?.name || booking.field?.name || 'الملعب الرئيسي';
  const bookingCode = booking._id?.toString().slice(-8).toUpperCase() || 'SNTR-8821';
  const participants = booking.participantsCount || 1;
  const isSession = booking.bookingType === 'session';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تذكرة الحجز بتاعتك 🎉" maxWidth="520px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Ticket Outer Wrapper with Sketched Paper Ticket Styling */}
        <div
          id="printable-ticket"
          style={{
            background: 'var(--bg-surface)',
            border: '2px solid var(--sketch-line)',
            borderRadius: '255px 18px 225px 18px / 18px 225px 18px 255px',
            boxShadow: '4px 4px 0px var(--sketch-shadow)',
            padding: 'var(--space-5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px dashed var(--sketch-line)',
              paddingBottom: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.25rem' }}>{activityMeta.icon}</span>
                <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                  {venueName}
                </span>
              </div>
              <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', marginTop: '2px' }}>
                {facilityName}
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <Badge variant="success">
                <CheckCircle2 size={12} style={{ marginLeft: '4px' }} />
                حجزك اتأكد ✅
              </Badge>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                }}
              >
                #{bookingCode}
              </div>
            </div>
          </div>

          {/* Player & Booking Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
            <div style={{ background: 'var(--bg-surface-raised)', padding: 'var(--space-3)', borderRadius: '255px 8px 225px 8px / 8px 225px 8px 255px', border: '1.5px solid var(--sketch-line)', boxShadow: '1.5px 1.5px 0px var(--sketch-shadow)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>اسم اللاعب</span>
              <strong style={{ color: 'var(--text-primary)' }}>{booking.playerName}</strong>
            </div>

            <div style={{ background: 'var(--bg-surface-raised)', padding: 'var(--space-3)', borderRadius: '255px 8px 225px 8px / 8px 225px 8px 255px', border: '1.5px solid var(--sketch-line)', boxShadow: '1.5px 1.5px 0px var(--sketch-shadow)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>رقم الموبايل</span>
              <span dir="ltr" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {booking.playerPhone}
              </span>
            </div>

            <div style={{ background: 'var(--bg-surface-raised)', padding: 'var(--space-3)', borderRadius: '255px 8px 225px 8px / 8px 225px 8px 255px', border: '1.5px solid var(--sketch-line)', boxShadow: '1.5px 1.5px 0px var(--sketch-shadow)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>يوم الحجز</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontWeight: 700 }}>
                <Calendar size={14} style={{ color: 'var(--primary)' }} />
                <span>{booking.dateString ? formatDateArabic(booking.dateString) : 'النهارده'}</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-raised)', padding: 'var(--space-3)', borderRadius: '255px 8px 225px 8px / 8px 225px 8px 255px', border: '1.5px solid var(--sketch-line)', boxShadow: '1.5px 1.5px 0px var(--sketch-shadow)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>الميعاد والتوقيت</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontWeight: 700 }}>
                <Clock size={14} style={{ color: 'var(--primary)' }} />
                <span>{formatSlotRange12h(booking.startTime, booking.endTime)}</span>
              </div>
            </div>
          </div>

          {/* Session Participants if any */}
          {isSession && (
            <div
              style={{
                marginTop: 'var(--space-3)',
                background: 'var(--bg-surface-raised)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: '255px 8px 225px 8px / 8px 225px 8px 255px',
                border: '1.5px solid var(--sketch-line)',
                boxShadow: '1.5px 1.5px 0px var(--sketch-shadow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} style={{ color: 'var(--primary)' }} />
                <span>نوع الحجز: جلسة أفراد</span>
              </div>
              <strong style={{ color: 'var(--primary)' }}>{participants} أفراد</strong>
            </div>
          )}

          {/* Pricing & Cash Payment */}
          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--sketch-active-bg)',
              border: '2px solid var(--sketch-line)',
              borderRadius: '255px 10px 225px 10px / 10px 225px 10px 255px',
              boxShadow: '2.5px 2.5px 0px var(--sketch-shadow)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>طريقة الدفع</span>
              <strong style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>💵 كاش في الملعب لما تروح</strong>
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>المبلغ المطلوب</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>
                {formatCurrency(booking.price)}
              </strong>
            </div>
          </div>

          {/* Location & Address */}
          <div
            style={{
              marginTop: 'var(--space-3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>{venueAddress}</span>
            </div>
            <a
              href={venueMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}
            >
              <span>مكان الملعب ع الخريطة</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Simulated QR & Barcode Section */}
          <div
            style={{
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-3)',
              borderTop: '1px dashed var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                style={{
                  height: '24px',
                  width: '180px',
                  background: 'repeating-linear-gradient(90deg, #111, #111 2px, transparent 2px, transparent 5px, #111 5px, #111 9px, transparent 9px, transparent 11px)',
                  opacity: 0.85,
                }}
              />
              <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                {bookingCode}-SCAN-VALID
              </span>
            </div>

            {/* Simulated QR Code box */}
            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#fff',
                border: '1px solid #ddd',
                padding: '4px',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '2px',
              }}
              title="رمز التحقق الرقمي"
            >
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: (i % 2 === 0 || i % 5 === 0) ? '#111' : '#eee',
                    borderRadius: '1px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={handlePrint} icon={Printer}>
            اطبع التذكرة
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            تمام، اقفل
          </Button>
        </div>
      </div>
    </Modal>
  );
}

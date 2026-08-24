'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { formatCurrency, formatDateArabic, formatSlotRange12h } from '@/lib/utils';
import { CheckCircle, Clock, Copy, ExternalLink, AlertTriangle } from 'lucide-react';

export default function BookingSuccessModal({ isOpen, onClose, booking, field }) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const isPendingConfirmation = booking.status === 'pending_confirmation';
  const confirmationUrl = typeof window !== 'undefined' && booking.confirmationToken
    ? `${window.location.origin}/confirm/${booking.confirmationToken}`
    : `/confirm/${booking.confirmationToken}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(confirmationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPendingConfirmation ? 'تم الحجز مبدئياً — بانتظار التأكيد' : 'تم تأكيد الحجز بنجاح'}
    >
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-full)',
            background: isPendingConfirmation ? 'var(--warning-light)' : 'var(--primary-light)',
            color: isPendingConfirmation ? 'var(--warning)' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-2)',
            border: `1px solid ${isPendingConfirmation ? 'var(--warning-border)' : 'var(--primary-border)'}`,
          }}
        >
          {isPendingConfirmation ? <Clock size={24} /> : <CheckCircle size={24} />}
        </div>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {isPendingConfirmation ? 'تم قفل الموعد مبدئياً' : 'تم تسجيل حجزك بنجاح'}
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '2px' }}>
          {isPendingConfirmation
            ? 'يرجى تأكيد الحضور قبل المهلة المحددة لتثبيت الحجز'
            : booking.totalSlots > 1
            ? `تم تأكيد (${booking.totalSlots}) ساعات في النظام بنجاح`
            : 'تم قفل الموعد وتأكيده في جدول الملعب'}
        </p>
      </div>

      {/* Confirmation Warning Banner if Pending */}
      {isPendingConfirmation && booking.confirmationDeadline && (
        <div
          style={{
            background: 'var(--warning-light)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            fontSize: '0.8125rem',
            color: 'var(--text-primary)',
          }}
        >
          <div className="flex items-center gap-1" style={{ fontWeight: 700, color: 'var(--warning)' }}>
            <AlertTriangle size={15} />
            <span>مهلة تأكيد الحضور:</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            يرجى فتح رابط التأكيد قبل:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {new Date(booking.confirmationDeadline).toLocaleString('ar-EG', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })}
            </strong>
          </p>

          <div className="flex items-center gap-2" style={{ marginTop: 'var(--space-1)' }}>
            <Link
              href={`/confirm/${booking.confirmationToken}`}
              target="_blank"
              className="btn btn-sm btn-primary"
              style={{ flex: 1, fontSize: '0.75rem', gap: '4px' }}
            >
              <span>صفحة تأكيد الحضور</span>
              <ExternalLink size={13} />
            </Link>
            <button
              onClick={handleCopyLink}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.75rem', gap: '4px' }}
            >
              <Copy size={13} />
              <span>{copied ? 'تم النسخ ✓' : 'نسخ الرابط'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Ticket Details Box */}
      <div
        style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          fontSize: '0.875rem',
        }}
      >
        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--text-secondary)' }}>رقم الحجز:</span>
          <span style={{ fontFamily: 'Inter, monospace', fontWeight: 700, color: 'var(--primary)' }}>
            #{booking._id ? String(booking._id).slice(-6).toUpperCase() : 'OK'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--text-secondary)' }}>الاسم:</span>
          <span style={{ fontWeight: 600 }}>{booking.playerName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--text-secondary)' }}>التاريخ:</span>
          <span style={{ fontWeight: 600 }}>{formatDateArabic(booking.dateString)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--text-secondary)' }}>الفترة المحجوزة:</span>
          <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'Inter, IBM Plex Sans Arabic, sans-serif' }}>
            {formatSlotRange12h(booking.startTime, booking.endTime)}
          </span>
        </div>

        {booking.totalSlots > 1 && (
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)' }}>عدد الساعات:</span>
            <span style={{ fontWeight: 600 }}>{booking.totalSlots} ساعات</span>
          </div>
        )}

        <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>المبلغ المطلوب:</span>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Inter, sans-serif' }}>
            {formatCurrency(booking.price || booking.totalPrice)}
          </span>
        </div>

        <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>المكان:</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {field?.location?.address || 'شارع التسعين الشمالي، التجمع الخامس'}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="primary" onClick={onClose} style={{ minWidth: '140px' }}>
          حسناً
        </Button>
      </div>
    </Modal>
  );
}


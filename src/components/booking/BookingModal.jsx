'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { formatCurrency, formatDateArabic, formatSlotRange12h } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Calendar, Clock, MapPin, CheckCircle, Info } from 'lucide-react';

export default function BookingModal({
  isOpen,
  onClose,
  slots = [],
  slot = null,
  dateString,
  field,
  onSuccess,
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const activeSlots = Array.isArray(slots) && slots.length > 0
    ? slots
    : slot
    ? [slot]
    : [];

  useEffect(() => {
    if (isOpen && !user) {
      showToast('يرجى تسجيل الدخول أو إنشاء حساب أولاً لإكمال حجز الملعب', 'warning');
      router.push('/auth/login');
      onClose();
      return;
    }
    if (user) {
      setName((prev) => prev || user.name || '');
      setPhone((prev) => prev || user.phone || '');
    }
  }, [user, isOpen, router, onClose, showToast]);

  if (!isOpen || activeSlots.length === 0) return null;

  const totalPrice = activeSlots.reduce((sum, s) => sum + (s.price || 0), 0);
  const sortedSlots = [...activeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const validateBookingForm = () => {
    const errs = {};
    const trimmedName = name.trim();
    const cleanPhone = phone.trim().replace(/[\s\-\+]/g, '');

    if (!trimmedName) {
      errs.name = 'يرجى كتابة الاسم بالكامل';
    }

    if (!cleanPhone) {
      errs.phone = 'يرجى كتابة رقم الهاتف';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'رقم الهاتف قصير جداً (11 رقم)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!validateBookingForm()) return;

    setLoading(true);
    try {
      const cleanPhone = phone.trim().replace(/[\s\-\+]/g, '');
      const payload = {
        fieldId: field?._id || field?.id,
        dateString,
        slots: sortedSlots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
        })),
        playerName: name.trim(),
        playerPhone: cleanPhone,
        notes: notes.trim(),
      };

      const res = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success || res.data) {
        showToast('تم تأكيد حجزك بنجاح', 'success');
        if (onSuccess) {
          onSuccess(res.data?.booking || res.data?.mainBooking || res.data);
        }
        onClose();
      } else {
        showToast(res.message || 'حدث خطأ أثناء تنفيذ الحجز', 'error');
      }
    } catch (err) {
      showToast(err.message || 'فشل الحجز، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeSlots.length > 1 ? `تأكيد حجز (${activeSlots.length} ساعات)` : 'تأكيد حجز الموعد'}
    >
      {/* Booking Summary Ticket Box */}
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
          <span style={{ color: 'var(--text-secondary)' }}>التاريخ:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDateArabic(dateString)}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '2px' }}>
            الفترات المحجوزة:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sortedSlots.map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-1.5" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Clock size={13} style={{ color: 'var(--primary)' }} />
                  <span>{formatSlotRange12h(s.startTime, s.endTime)}</span>
                </div>
                <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem' }}>
                  {formatCurrency(s.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-3)',
            marginTop: 'var(--space-2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            المبلغ الإجمالي:
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Inter, sans-serif' }}>
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      {/* Direct Booking Form */}
      <form onSubmit={handleBookingSubmit} noValidate>
        <Input
          label="الاسم بالكامل"
          placeholder="مثال: أحمد محمد"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={loading}
          required
        />

        <Input
          label="رقم الهاتف"
          placeholder="مثال: 01012345678"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          disabled={loading}
          required
        />

        <Textarea
          label="ملاحظات إضافية (اختياري)"
          placeholder="أي طلبات أو ملاحظات تفضل إضافتها..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
        />

        <div
          style={{
            background: 'var(--bg-surface-raised)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-4)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>يتم سداد الحساب في الملعب عند الحضور قبل بدء وقت المباراة.</span>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {loading ? 'جاري التأكيد...' : `تأكيد الحجز (${formatCurrency(totalPrice)})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


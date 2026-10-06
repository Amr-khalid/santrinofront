'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { formatCurrency, formatDateArabic, formatSlotRange12h } from '@/lib/utils';
import { getActivityMeta } from '@/lib/activities';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Calendar, Clock, MapPin, CheckCircle, Info, Users, Plus, Minus } from 'lucide-react';

export default function BookingModal({
  isOpen,
  onClose,
  slots = [],
  slot = null,
  dateString,
  facility = null,
  field = null,
  venue = null,
  onSuccess,
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [participantsCount, setParticipantsCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const targetFacility = facility || field;
  const isSession = targetFacility?.bookingType === 'session';
  const maxCapacity = targetFacility?.capacity || 20;

  const activeSlots = Array.isArray(slots) && slots.length > 0
    ? slots
    : slot
    ? [slot]
    : [];

  useEffect(() => {
    if (isOpen && !user) {
      showToast('لازم تسجّل دخولك أو تعمل حساب الأول عشان تكمّل الحجز', 'warning');
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

  const basePrice = activeSlots.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalPrice = isSession ? basePrice * participantsCount : basePrice;
  const sortedSlots = [...activeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const activityMeta = getActivityMeta(targetFacility?.activityType);
  const venueTitle = venue?.name || targetFacility?.venue?.name || targetFacility?.name || 'الملعب';

  const validateBookingForm = () => {
    const errs = {};
    const trimmedName = name.trim();
    const cleanPhone = phone.trim().replace(/[\s\-\+]/g, '');

    if (!trimmedName) {
      errs.name = 'اكتب اسمك بالكامل يا بطل';
    }

    if (!cleanPhone) {
      errs.phone = 'اكتب رقم الموبايل عشان نتواصل معاك';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'رقم الموبايل ناقص (لازم 11 رقم)';
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
        facilityId: targetFacility?._id || targetFacility?.id,
        fieldId: targetFacility?._id || targetFacility?.id,
        dateString,
        slots: sortedSlots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
        })),
        playerName: name.trim(),
        playerPhone: cleanPhone,
        participantsCount: isSession ? participantsCount : 1,
        bookingType: isSession ? 'session' : 'time_slot',
        notes: notes.trim(),
      };

      const res = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast(res.message || 'حجزك اتأكد خلاص! يلا استعد للماتش 🚀', 'success');
        if (onSuccess) {
          onSuccess(res.data?.booking || res.data);
        }
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'حصلت مشكلة في الحجز، جرب تاني', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تأكيد حجز الميعاد" maxWidth="540px">
      <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Reservation Summary Card */}
        <div
          style={{
            background: 'var(--bg-surface-raised)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: '1.25rem' }}>{activityMeta.icon}</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {venueTitle}
              </h4>
              <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
                {targetFacility?.name}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Calendar size={15} style={{ color: 'var(--primary)' }} />
              <span>{formatDateArabic(dateString)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Clock size={15} style={{ color: 'var(--primary)' }} />
              <span>
                {formatSlotRange12h(sortedSlots[0]?.startTime, sortedSlots[sortedSlots.length - 1]?.endTime)}
              </span>
            </div>
          </div>

          {/* If Session Based: Participant Counter */}
          {isSession && (
            <div
              style={{
                marginTop: 'var(--space-3)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                <Users size={16} style={{ color: 'var(--primary)' }} />
                <span>عدد الأفراد اللي جايين معاك:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setParticipantsCount((prev) => Math.max(1, prev - 1))}
                  className="btn btn-outline btn-sm"
                  style={{ width: '32px', height: '32px', padding: 0 }}
                  disabled={participantsCount <= 1}
                >
                  <Minus size={14} />
                </button>
                <strong style={{ minWidth: '24px', textAlign: 'center', fontSize: '1rem' }}>
                  {participantsCount}
                </strong>
                <button
                  type="button"
                  onClick={() => setParticipantsCount((prev) => Math.min(maxCapacity, prev + 1))}
                  className="btn btn-outline btn-sm"
                  style={{ width: '32px', height: '32px', padding: 0 }}
                  disabled={participantsCount >= maxCapacity}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div
            style={{
              marginTop: 'var(--space-3)',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {isSession ? `الإجمالي (${participantsCount} أفراد × ${formatCurrency(basePrice)}):` : `المبلغ المطلوب:`}
            </span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>
              {formatCurrency(totalPrice)}
            </strong>
          </div>
        </div>

        {/* Form Inputs */}
        <Input
          label="اسمك بالكامل *"
          placeholder="اكتب اسمك الثلاثي"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="رقم الموبايل للتأكيد *"
          placeholder="010XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          dir="ltr"
          required
        />

        <Textarea
          label="ملاحظات زيادة (اختياري)"
          placeholder="أي طلب خاص أو استفسار لإدارة الملعب..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {/* Cash payment notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--sketch-active-bg)',
            border: '1.5px solid var(--sketch-line)',
            boxShadow: '1.5px 1.5px 0px var(--sketch-shadow)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: '255px 10px 225px 10px / 10px 225px 10px 255px',
            fontSize: '0.8125rem',
            color: 'var(--primary)',
            fontWeight: 700,
          }}
        >
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>هتدفع كاش في الملعب أول ما توصل، مفيش دفع إلكتروني مسبق.</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            رجوع
          </Button>
          <Button variant="primary" type="submit" loading={loading} icon={CheckCircle}>
            أكّد الحجز دلوقتي
          </Button>
        </div>
      </form>
    </Modal>
  );
}

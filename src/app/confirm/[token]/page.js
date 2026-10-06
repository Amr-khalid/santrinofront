'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { formatCurrency, formatDateArabic, formatSlotRange12h, getStatusInfo } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import { CheckCircle, Clock, AlertTriangle, MapPin, Calendar, User, ShieldCheck } from 'lucide-react';

export default function ConfirmBookingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchBooking = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest(`/bookings/confirm/${token}`);
      if (res.success && res.data) {
        setBookingData(res.data);
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحميل بيانات الحجز');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [token]);

  const handleConfirmAttendance = async () => {
    setConfirming(true);
    setError(null);
    try {
      const res = await apiRequest(`/bookings/confirm/${token}`, {
        method: 'POST',
      });
      if (res.success) {
        setSuccessMessage(res.message || 'تم تأكيد حجزك بنجاح');
        fetchBooking();
      }
    } catch (err) {
      setError(err.message || 'فشل تأكيد الحجز');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return <Loader text="جاري فحص تفاصيل الحجز..." />;
  }

  if (error && !bookingData) {
    return (
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4)', display: 'flex', justifyContent: 'center' }}>
        <Card style={{ maxWidth: '440px', textAlign: 'center', width: '100%' }}>
          <AlertTriangle size={40} style={{ color: 'var(--danger)', margin: '0 auto var(--space-3)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            رابط الحجز غير متاح
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)', fontSize: '0.875rem' }}>
            {error}
          </p>
          <Button href="/" variant="primary" style={{ width: '100%' }}>
            الانتقال للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  const { mainBooking, bookings = [], totalPrice } = bookingData || {};
  const statusInfo = getStatusInfo(mainBooking?.status);
  const isPending = mainBooking?.status === 'pending_confirmation';
  const isConfirmed = mainBooking?.status === 'confirmed';

  const sortedBookings = [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const startTime = sortedBookings[0]?.startTime || mainBooking?.startTime;
  const endTime = sortedBookings[sortedBookings.length - 1]?.endTime || mainBooking?.endTime;

  return (
    <div className="container" style={{ padding: 'var(--space-10) var(--space-4)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Card padding="lg">
          {/* Status Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-full)',
                background: isConfirmed
                  ? 'var(--primary-light)'
                  : isPending
                  ? 'var(--warning-light)'
                  : 'var(--danger-light)',
                color: isConfirmed
                  ? 'var(--primary)'
                  : isPending
                  ? 'var(--warning)'
                  : 'var(--danger)',
                border: `1px solid ${isConfirmed ? 'var(--primary-border)' : isPending ? 'var(--warning-border)' : 'var(--danger-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-3)',
              }}
            >
              {isConfirmed ? (
                <CheckCircle size={24} />
              ) : isPending ? (
                <Clock size={24} />
              ) : (
                <AlertTriangle size={24} />
              )}
            </div>

            <div style={{ marginBottom: 'var(--space-2)' }}>
              <Badge variant={statusInfo.colorClass.replace('badge-', '')}>
                {statusInfo.label}
              </Badge>
            </div>

            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
              {isConfirmed
                ? 'حجزك مؤكد رسمياً'
                : isPending
                ? 'تأكيد حضور المباراة'
                : 'الحجز غير متاح'}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {isConfirmed
                ? 'تم تثبيت حجزك في جدول الملعب. ننتظرك في الموعد المحدد.'
                : isPending
                ? 'يرجى الضغط على زر التأكيد أدناه لتثبيت حجزك وتجنب إلغائه تلقائياً'
                : 'عذراً، انتهت مهلة التأكيد أو تم إلغاء الحجز.'}
            </p>
          </div>

          {/* Success Alert if confirmed just now */}
          {successMessage && (
            <div
              style={{
                background: 'var(--success-light)',
                color: 'var(--success)',
                border: '1px solid var(--success-border)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              ✓ {successMessage}
            </div>
          )}

          {/* Pending Deadline Box */}
          {isPending && mainBooking?.confirmationDeadline && (
            <div
              style={{
                background: 'var(--warning-light)',
                border: '1px solid var(--warning-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                مهلة التأكيد المتاحة:
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--warning)' }}>
                حتى {new Date(mainBooking.confirmationDeadline).toLocaleString('ar-EG', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })}
              </span>
            </div>
          )}

          {/* Ticket Details Box */}
          <div
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              fontSize: '0.875rem',
            }}
          >
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>اسم الحاجز:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{mainBooking?.playerName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>المنشأة والملعب:</span>
              <span style={{ fontWeight: 600 }}>
                {mainBooking?.venue?.name ? `${mainBooking.venue.name} — ` : ''}
                {mainBooking?.facility?.name || mainBooking?.field?.name || 'سنترينو'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>التاريخ:</span>
              <span style={{ fontWeight: 600 }}>{formatDateArabic(mainBooking?.dateString)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>الميعاد:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'Inter, IBM Plex Sans Arabic, sans-serif' }}>
                {formatSlotRange12h(startTime, endTime)} ({bookings.length} {bookings.length === 1 ? 'ساعة' : 'ساعات'})
              </span>
            </div>

            <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>المبلغ الإجمالي:</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Inter, sans-serif' }}>
                {formatCurrency(totalPrice || mainBooking?.price)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {isPending ? (
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirmAttendance}
                loading={confirming}
                style={{ width: '100%' }}
                icon={ShieldCheck}
              >
                أؤكد حضوري للملعب
              </Button>
            </div>
          ) : (
            <div className="flex justify-center" style={{ width: '100%' }}>
              <Button href="/" variant="outline" style={{ width: '100%' }}>
                العودة للرئيسية
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


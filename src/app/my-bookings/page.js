'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { apiRequest } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Loader, { Skeleton } from '@/components/ui/Loader';
import {
  formatCurrency,
  formatDateArabic,
  formatSlotRange12h,
  getStatusInfo,
  getPaymentStatusInfo,
} from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  X,
  RefreshCw,
  Ticket,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Filter,
} from 'lucide-react';

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'upcoming' | 'completed' | 'cancelled'

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchMyBookings = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await apiRequest('/bookings/my');
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showToast(err.message || 'فشل جلب الحجوزات', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchMyBookings]);

  const handleOpenCancelModal = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;

    setCancelling(true);
    try {
      const res = await apiRequest(`/bookings/${selectedBookingForCancel._id}/cancel`, {
        method: 'PATCH',
      });
      if (res.success) {
        showToast('تم إلغاء الحجز بنجاح', 'success');
        setCancelModalOpen(false);
        setSelectedBookingForCancel(null);
        fetchMyBookings(true);
      }
    } catch (err) {
      showToast(err.message || 'فشل إلغاء الحجز', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Filter bookings based on status tab
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'upcoming') {
      return (
        (b.status === 'confirmed' || b.status === 'pending_confirmation') &&
        b.dateString >= todayStr
      );
    }
    if (statusFilter === 'completed') {
      return b.status === 'completed' || (b.status === 'confirmed' && b.dateString < todayStr);
    }
    if (statusFilter === 'cancelled') {
      return b.status === 'cancelled' || b.status === 'no_show';
    }
    return true;
  });

  // Calculate counts for badges
  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === 'confirmed' || b.status === 'pending_confirmation') &&
      b.dateString >= todayStr
  ).length;

  const pendingConfirmationCount = bookings.filter(
    (b) => b.status === 'pending_confirmation' && b.dateString >= todayStr
  ).length;

  if (authLoading || (loading && !refreshing)) {
    return (
      <div className="container" style={{ padding: 'var(--space-10) var(--space-4)', maxWidth: '1000px', flex: 1 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Skeleton width="180px" height="28px" style={{ marginBottom: '8px' }} />
          <Skeleton width="300px" height="16px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="220px" borderRadius="var(--radius-md)" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="container"
        style={{
          padding: 'var(--space-12) var(--space-4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}
      >
        <Card style={{ maxWidth: '440px', textAlign: 'center', width: '100%', padding: 'var(--space-8) var(--space-6)' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
            }}
          >
            <Ticket size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            سجل دخولك لعرض حجوزاتك
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            سجل الدخول برقم هاتفك المسجل للوصول إلى تفاصيل جميع مواعيدك السابقة والقادمة وإدارتها بسهولة.
          </p>
          <Button href="/auth/login" variant="primary" style={{ width: '100%' }}>
            تسجيل الدخول الآن
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-12)', maxWidth: '1100px', flex: 1 }}>
      {/* Top Header & Quick Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              حجوزاتي
            </h1>
            {pendingConfirmationCount > 0 && (
              <Badge variant="warning">
                {pendingConfirmationCount} بانتظار التأكيد
              </Badge>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
            متابعة وتأكيد حجوزاتك المسجلة برقم الهاتف ({user.phone || '—'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMyBookings(true)}
            icon={RefreshCw}
            disabled={refreshing}
            title="تحديث القائمة"
          >
            تحديث
          </Button>
          <Button href="/" variant="primary" size="sm" icon={Calendar}>
            حجز موعد جديد
          </Button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-1)',
          scrollbarWidth: 'none',
        }}
      >
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
        >
          <span>الكل ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('upcoming')}
          className={`btn btn-sm ${statusFilter === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
        >
          <span>القادمة ({upcomingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
        >
          <span>المكتملة</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('cancelled')}
          className={`btn btn-sm ${statusFilter === 'cancelled' ? 'btn-primary' : 'btn-outline'}`}
        >
          <span>الملغاة</span>
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-raised)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-3)',
            }}
          >
            <Calendar size={22} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
            {statusFilter === 'all'
              ? 'لا توجد لديك أي حجوزات حتى الآن'
              : 'لا توجد حجوزات مطابقة لهذا التصنيف'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)', fontSize: '0.875rem' }}>
            اختر اليوم والوقت المناسب لك ولفرقتك واحجز موعدك بسهولة
          </p>
          <Button href="/" variant="primary" icon={Calendar}>
            حجز موعد الآن
          </Button>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {filteredBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            const paymentInfo = getPaymentStatusInfo(booking.paymentStatus);
            const isPending = booking.status === 'pending_confirmation';
            const isConfirmed = booking.status === 'confirmed';
            const isCancelled = booking.status === 'cancelled' || booking.status === 'no_show';
            const isPast = booking.dateString < todayStr;

            return (
              <Card
                key={booking._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  border: isPending ? '1.5px solid var(--warning)' : undefined,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top Row: Ticket ID and Status Badges */}
                <div className="flex justify-between items-center">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'Inter, monospace',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}
                  >
                    #{booking._id.slice(-6).toUpperCase()}
                  </span>
                  <Badge variant={statusInfo.colorClass.replace('badge-', '')}>
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Field & Venue Info */}
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {booking.field?.name || 'ملعب نادي سانتوريني'}
                  </h3>
                  <div
                    className="flex items-center gap-1"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '2px' }}
                  >
                    <MapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span>{booking.field?.location?.address || 'نادي سانتوريني الرياضي'}</span>
                  </div>
                </div>

                {/* Structured Date, Time, and Price Details Box */}
                <div
                  style={{
                    background: 'var(--bg-surface-raised)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    fontSize: '0.875rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Date Row */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Calendar size={14} style={{ color: 'var(--primary)' }} />
                      <span>التاريخ:</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatDateArabic(booking.dateString)}
                    </span>
                  </div>

                  {/* Time Row */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Clock size={14} style={{ color: 'var(--primary)' }} />
                      <span>الميعاد:</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--primary)',
                          fontFamily: 'Inter, IBM Plex Sans Arabic, sans-serif',
                        }}
                      >
                        {formatSlotRange12h(booking.startTime, booking.endTime)}
                      </span>
                      {booking.totalSlots > 1 && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            padding: '1px 5px',
                            borderRadius: 'var(--radius-xs)',
                          }}
                        >
                          {booking.totalSlots === 2 ? 'ساعتان' : `${booking.totalSlots} ساعات`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Price & Payment Status Row */}
                  <div
                    className="flex justify-between items-center"
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: 'var(--space-2)',
                      marginTop: '2px',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        المبلغ الإجمالي:
                      </span>
                      <Badge variant={paymentInfo.colorClass.replace('badge-', '')}>
                        {paymentInfo.label}
                      </Badge>
                    </div>
                    <span
                      style={{
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '1rem',
                      }}
                    >
                      {formatCurrency(booking.price)}
                    </span>
                  </div>
                </div>

                {/* Pending Confirmation Warning Banner */}
                {isPending && booking.confirmationDeadline && (
                  <div
                    style={{
                      background: 'var(--warning-light)',
                      border: '1px solid var(--warning-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      color: 'var(--warning)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span>
                      تأكيد الحضور مطلوب قبل:{' '}
                      <strong>
                        {new Date(booking.confirmationDeadline).toLocaleTimeString('ar-EG', {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })}
                      </strong>
                    </span>
                  </div>
                )}

                {/* Action Buttons Footer */}
                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-1)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {/* Confirm CTA */}
                  {isPending && booking.confirmationToken && (
                    <Button
                      href={`/confirm/${booking.confirmationToken}`}
                      variant="primary"
                      size="sm"
                      icon={CheckCircle2}
                      style={{ width: '100%' }}
                    >
                      تأكيد الحضور الآن
                    </Button>
                  )}

                  {/* View Ticket Link if confirmed */}
                  {isConfirmed && booking.confirmationToken && (
                    <Button
                      href={`/confirm/${booking.confirmationToken}`}
                      variant="outline"
                      size="sm"
                      icon={ExternalLink}
                      style={{ width: '100%' }}
                    >
                      عرض تذكرة الحجز
                    </Button>
                  )}

                  {/* Cancel Button if eligible */}
                  {(isPending || isConfirmed) && !isPast && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenCancelModal(booking)}
                      icon={X}
                      style={{ width: '100%', color: 'var(--danger)' }}
                    >
                      إلغاء هذا الحجز
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="تأكيد إلغاء الحجز"
      >
        {selectedBookingForCancel && (
          <div className="flex flex-col gap-4 text-center">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-full)',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                هل ترغب في إلغاء هذا الحجز؟
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                سيتم تحرير وإلغاء موعد (
                <strong style={{ color: 'var(--text-primary)' }}>
                  {formatDateArabic(selectedBookingForCancel.dateString)} — {formatSlotRange12h(selectedBookingForCancel.startTime, selectedBookingForCancel.endTime)}
                  {selectedBookingForCancel.totalSlots > 1 ? ` (${selectedBookingForCancel.totalSlots === 2 ? 'ساعتان' : `${selectedBookingForCancel.totalSlots} ساعات`})` : ''}
                </strong>
                ) بالكامل وإتاحته للآخرين في جدول الملاعب.
              </p>
            </div>

            <div className="flex gap-2" style={{ marginTop: 'var(--space-2)' }}>
              <Button
                variant="outline"
                onClick={() => setCancelModalOpen(false)}
                style={{ flex: 1 }}
                disabled={cancelling}
              >
                تراجع
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                loading={cancelling}
                style={{ flex: 1 }}
              >
                نعم، قم بالإلغاء
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

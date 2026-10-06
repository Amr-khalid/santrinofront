'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { apiRequest } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import DigitalTicketModal from '@/components/booking/DigitalTicketModal';
import { getActivityMeta } from '@/lib/activities';
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
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('upcoming'); // 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [activityFilter, setActivityFilter] = useState('all');

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Digital Ticket Modal state
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState(null);

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

  const handleOpenTicket = (booking) => {
    setSelectedBookingForTicket(booking);
    setTicketModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <Loader text="بنجيب حجوزاتك وتذاكرك... ثواني" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', textAlign: 'center' }}>
        <Card padding="lg" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <Ticket size={48} style={{ color: 'var(--primary)', margin: '0 auto var(--space-3)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>لازم تسجّل دخولك الأول</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 'var(--space-2) 0 var(--space-4)' }}>
            سجّل دخولك برقم موبايلك عشان تشوف كل ماتشاتك وتذاكرك الرقمية.
          </p>
          <Link href="/auth/login">
            <Button variant="primary">سجّل دخولك دلوقتي</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Filter bookings by status
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    // Activity filter
    if (activityFilter !== 'all' && (b.activityType || b.facility?.activityType) !== activityFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'all') return true;
    if (statusFilter === 'cancelled') {
      return b.status === 'cancelled' || b.status === 'auto_expired';
    }
    if (statusFilter === 'completed') {
      return b.status === 'completed' || (b.dateString < todayStr && b.status === 'confirmed');
    }
    if (statusFilter === 'upcoming') {
      return (
        (b.status === 'confirmed' || b.status === 'pending_confirmation') &&
        b.dateString >= todayStr
      );
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '960px' }}>
      {/* Page Header */}
      <div
        className="flex justify-between items-center"
        style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            حجوزاتي وتذاكري 🎟️
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            تابع مواعيد ماتشاتك، شوف تذاكر الدخول، أو الغِ الحجز لو وراك حاجة.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchMyBookings(true)}
          disabled={refreshing}
          icon={RefreshCw}
        >
          {refreshing ? 'بنحدّث...' : 'تحديث'}
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'upcoming', label: 'المواعيد الجاية' },
          { id: 'completed', label: 'الماتشات اللي فاتت' },
          { id: 'cancelled', label: 'الملغية' },
          { id: 'all', label: 'كل الحجوزات' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '255px 12px 225px 12px / 12px 225px 12px 255px',
              border: statusFilter === tab.id ? '2px solid var(--sketch-line)' : '1px solid transparent',
              background: statusFilter === tab.id ? 'var(--sketch-active-bg)' : 'transparent',
              color: statusFilter === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: statusFilter === tab.id ? 800 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: statusFilter === tab.id ? '2px 2px 0px var(--sketch-shadow)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card padding="lg" style={{ textAlign: 'center' }}>
          <Ticket size={40} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-2)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>معندكش أي حجوزات هنا!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 'var(--space-1) 0 var(--space-4)' }}>
            شوف الملاعب والنوادي اللي حواليك واحجز ماتشك الجاي دلوقتي في ثواني.
          </p>
          <Link href="/venues">
            <Button variant="primary" size="sm">
              شوف الملاعب واحجز ماتش
            </Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            const paymentInfo = getPaymentStatusInfo(booking.paymentStatus);
            const actMeta = getActivityMeta(booking.activityType || booking.facility?.activityType);
            const venueName = booking.venue?.name || booking.facility?.venue?.name || 'سنترينو أرينا';
            const facilityName = booking.facility?.name || booking.field?.name || 'الملعب الرئيسي';
            const isCanCancel =
              (booking.status === 'confirmed' || booking.status === 'pending_confirmation') &&
              booking.dateString >= todayStr;

            return (
              <Card key={booking._id} padding="md">
                <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  {/* Left Column: Activity & Venue info */}
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: '#0D6B4F12',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0,
                      }}
                    >
                      {actMeta.icon}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {actMeta.name}
                        </span>
                        <span>•</span>
                        <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {venueName}
                        </h3>
                      </div>

                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', marginTop: '2px' }}>
                        {facilityName}
                        {booking.bookingType === 'session' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '6px' }}>
                            (جلسة: {booking.participantsCount || 1} أفراد)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-2)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} style={{ color: 'var(--primary)' }} />
                          <span>{formatDateArabic(booking.dateString)}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} style={{ color: 'var(--primary)' }} />
                          <span>{formatSlotRange12h(booking.startTime, booking.endTime)}</span>
                        </div>

                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {formatCurrency(booking.price)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status & Ticket Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Badge variant={statusInfo.colorClass.replace('badge-', '')}>
                        {statusInfo.label}
                      </Badge>
                      <Badge variant={paymentInfo.colorClass.replace('badge-', '')}>
                        {paymentInfo.label}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenTicket(booking)}
                        icon={Ticket}
                      >
                        شوف التذكرة
                      </Button>

                      {isCanCancel && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenCancelModal(booking)}
                        >
                          إلغاء الحجز
                        </Button>
                      )}
                    </div>
                  </div>
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
        title="إلغاء الحجز"
      >
        <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
          <AlertTriangle size={40} style={{ color: 'var(--danger)', margin: '0 auto var(--space-2)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 var(--space-2)' }}>
            متأكد إنك عاوز تلغي الحجز ده؟
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 var(--space-4)' }}>
            الميعاد هيفضى وأي حد يقدر يرجع يحجزه بدالك.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={cancelling}>
              لأ، خليه زي ما هو
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel} loading={cancelling}>
              أيوة، الغي الحجز
            </Button>
          </div>
        </div>
      </Modal>

      {/* Official Digital Ticket Modal */}
      <DigitalTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        booking={selectedBookingForTicket}
      />
    </div>
  );
}

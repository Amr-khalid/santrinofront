'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import BookingTable from '@/components/dashboard/BookingTable';
import ManualBookingModal from '@/components/dashboard/ManualBookingModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlusCircle, RefreshCw, RotateCcw } from 'lucide-react';

export default function DashboardBookingsPage() {
  const { showToast } = useToast();

  const [date, setDate] = useState('');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      if (status && status !== 'all') queryParams.append('status', status);
      if (search) queryParams.append('search', search);

      const res = await apiRequest(`/dashboard/bookings?${queryParams.toString()}`);
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'فشل جلب الحجوزات', 'error');
    } finally {
      setLoading(false);
    }
  }, [date, status, search, showToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (bookingIdOrIds, newStatus, paymentStatus) => {
    try {
      const ids = Array.isArray(bookingIdOrIds) ? bookingIdOrIds : [bookingIdOrIds];
      await Promise.all(
        ids.map((id) =>
          apiRequest(`/dashboard/bookings/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus, paymentStatus }),
          })
        )
      );
      showToast('تم تحديث حالة الحجز بنجاح', 'success');
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'فشل تحديث الحجز', 'error');
    }
  };

  const statusTabs = [
    { id: 'all', label: 'الكل' },
    { id: 'pending_confirmation', label: 'بانتظار التأكيد' },
    { id: 'confirmed', label: 'المؤكدة' },
    { id: 'completed', label: 'المكتملة' },
    { id: 'auto_expired', label: 'منتهية المهلة' },
    { id: 'cancelled', label: 'الملغية' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            إدارة الحجوزات
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            متابعة المواعيد، فلترة الحجوزات، وتأكيد تحصيل المبالغ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => setIsManualModalOpen(true)}
          >
            حجز يدوي
          </Button>
        </div>
      </div>

      {/* Control & Filter Panel */}
      <Card padding="md" style={{ marginBottom: 'var(--space-5)' }}>
        {/* Status Filter Tabs */}
        <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="filter-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`filter-tab ${status === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              التاريخ:
            </span>
            <Button
              variant={date === todayStr ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDate(todayStr)}
            >
              اليوم
            </Button>
            <Button
              variant={date === tomorrowStr ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDate(tomorrowStr)}
            >
              غداً
            </Button>
            {date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDate('')}
              >
                الكل
              </Button>
            )}
          </div>
        </div>

        {/* Search & Custom Date Filters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
            alignItems: 'end',
          }}
        >
          <Input
            label="تحديد تاريخ معين"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label="بحث بالاسم أو الهاتف"
            placeholder="اسم اللاعب أو رقم الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex gap-2" style={{ marginBottom: 'var(--space-4)' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setDate('');
                setStatus('all');
                setSearch('');
              }}
              icon={RotateCcw}
              style={{ width: '100%' }}
            >
              إعادة تعيين
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={fetchBookings}
              icon={RefreshCw}
              disabled={loading}
            >
              تحديث
            </Button>
          </div>
        </div>
      </Card>

      {/* Booking Data Table */}
      <BookingTable
        bookings={bookings}
        onUpdateStatus={handleUpdateStatus}
        loading={loading}
      />

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={fetchBookings}
      />
    </div>
  );
}



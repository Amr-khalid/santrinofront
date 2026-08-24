'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import BookingTable from '@/components/dashboard/BookingTable';
import ManualBookingModal from '@/components/dashboard/ManualBookingModal';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { formatCurrency } from '@/lib/utils';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  PlusCircle,
  RefreshCw,
  ListFilter,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const res = await apiRequest('/dashboard/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      showToast(err.message || 'فشل جلب بيانات لوحة التحكم', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleUpdateBookingStatus = async (bookingId, status, paymentStatus) => {
    try {
      const res = await apiRequest(`/dashboard/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (res.success) {
        showToast('تم تحديث حالة الحجز بنجاح', 'success');
        fetchDashboardStats();
      }
    } catch (err) {
      showToast(err.message || 'فشل تحديث الحجز', 'error');
    }
  };

  if (loading) {
    return <Loader text="جاري تجهيز لوحة الإحصائيات..." />;
  }

  const today = stats?.today || {};
  const total = stats?.total || {};

  return (
    <div>
      {/* Top Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            مرحباً، {stats?.field?.name || 'صاحب الملعب'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            نظرة عامة على إشغال الملعب، الإيرادات وحجوزات اليوم
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              fetchDashboardStats();
            }}
            disabled={refreshing}
            icon={RefreshCw}
          >
            {refreshing ? 'جاري التحديث...' : 'تحديث'}
          </Button>
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

      {/* 4 Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="حجوزات اليوم"
          value={`${today.bookingsCount || 0} فترة`}
          subtitle={`من إجمالي ${today.totalSlots || 12} فترة اليوم`}
          icon={Calendar}
          color="brand"
        />

        <StatsCard
          title="إيراد اليوم المحقق"
          value={formatCurrency(today.revenue || 0)}
          subtitle="بناءً على الأسعار المعتمدة"
          icon={DollarSign}
          color="gold"
        />

        <StatsCard
          title="نسبة إشغال اليوم"
          value={`${today.occupancyRate || 0}%`}
          subtitle={today.occupancyRate > 70 ? 'إشغال مرتفع' : 'فترات إضافية متاحة'}
          icon={Activity}
          color="blue"
        />

        <StatsCard
          title="إجمالي الإيرادات"
          value={formatCurrency(total.revenue || 0)}
          subtitle={`${total.bookingsCount || 0} حجز مسجل`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={stats?.chartData || []} />

      {/* Recent Bookings Section */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-3)' }}>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>أحدث الحجوزات</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              متابعة وتأكيد الحجوزات الواردة أونلاين أو يدوياً
            </p>
          </div>
          <Button href="/dashboard/bookings" variant="outline" size="sm" icon={ListFilter}>
            عرض كل الحجوزات
          </Button>
        </div>

        <BookingTable
          bookings={stats?.recentBookings || []}
          onUpdateStatus={handleUpdateBookingStatus}
          loading={refreshing}
        />
      </div>

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => fetchDashboardStats()}
      />
    </div>
  );
}



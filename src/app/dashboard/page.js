'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import BookingTable from '@/components/dashboard/BookingTable';
import ManualBookingModal from '@/components/dashboard/ManualBookingModal';
import FacilityModal from '@/components/dashboard/FacilityModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import { formatCurrency } from '@/lib/utils';
import { getActivityMeta } from '@/lib/activities';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  PlusCircle,
  RefreshCw,
  ListFilter,
  Trophy,
  Sliders,
  Power,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Clock,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [venue, setVenue] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters for bookings table
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await apiRequest('/dashboard/stats');
      if (res.success && res.data) {
        setStats(res.data);
        setVenue(res.data.venue);
        setFacilities(res.data.facilities || []);
      }

      // Fetch bookings list
      const bookingsRes = await apiRequest('/dashboard/bookings');
      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
    } catch (err) {
      showToast(err.message || 'فشل جلب بيانات لوحة التحكم', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateBookingStatus = async (bookingIdOrIds, status, paymentStatus) => {
    try {
      const ids = Array.isArray(bookingIdOrIds) ? bookingIdOrIds : [bookingIdOrIds];
      await Promise.all(
        ids.map((id) =>
          apiRequest(`/dashboard/bookings/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, paymentStatus }),
          })
        )
      );
      showToast('تم تحديث حالة الحجز بنجاح', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'فشل تحديث الحجز', 'error');
    }
  };

  const handleToggleFacility = async (facId) => {
    try {
      const res = await apiRequest(`/facilities/${facId}/toggle-status`, {
        method: 'PATCH',
      });
      if (res.success) {
        showToast(res.message || 'تم تحديث حالة المنشأة', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'فشل تغيير حالة المنشأة', 'error');
    }
  };

  const handleDeleteFacility = async (facId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المنشأة؟ سيتم إخفاؤها من جدول الحجوزات.')) {
      return;
    }
    try {
      const res = await apiRequest(`/facilities/${facId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast('تم حذف المنشأة بنجاح', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'فشل حذف المنشأة', 'error');
    }
  };

  if (loading) {
    return <Loader text="جاري تجهيز لوحة الإحصائيات وإدارة المنشآت..." />;
  }

  const today = stats?.today || {};
  const total = stats?.total || {};

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    if (selectedFacilityFilter !== 'all' && (b.facility?._id || b.facility) !== selectedFacilityFilter) {
      return false;
    }
    if (selectedStatusFilter !== 'all' && b.status !== selectedStatusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div>
      {/* Top Header */}
      <div
        className="flex justify-between items-center"
        style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🏟️</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {venue?.name || stats?.field?.name || 'لوحة تحكم المنشأة الرياضية'}
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            إدارة الملاعب، حصص السباحة، الأنشطة الرياضية، والإيرادات اليومية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              fetchDashboardData();
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
            حجز يدوي مباشر
          </Button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <StatsCard
          title="دخل اليوم (كاش ومحصل)"
          value={formatCurrency(today.revenue || 0)}
          subtitle={`${today.bookingsCount || 0} حجوزات مسجلة اليوم`}
          icon={DollarSign}
          trend={{ direction: 'up', label: 'تحديث فوري' }}
        />

        <StatsCard
          title="إجمالي الإيرادات"
          value={formatCurrency(total.revenue || 0)}
          subtitle={`${total.bookingsCount || 0} إجمالي الحجوزات`}
          icon={TrendingUp}
        />

        <StatsCard
          title="نسبة إشغال الملاعب اليوم"
          value={`${today.occupancyRate || 0}%`}
          subtitle={`${today.bookingsCount || 0} من أصل ${today.totalSlots || 12} فترة`}
          icon={Activity}
        />

        <StatsCard
          title="المنشآت والملاعب النشطة"
          value={`${facilities.filter((f) => f.isActive !== false).length} من أصل ${facilities.length}`}
          subtitle="بادل • كرة قدم • سباحة • تنس"
          icon={Trophy}
        />
      </div>

      {/* MY FACILITIES MANAGEMENT SECTION */}
      <Card padding="lg" style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 'var(--space-3)',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              الملاعب والمنشآت المدارة (My Facilities)
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              أضف ملاعب وأنشطة جديدة، عدل الأسعار وساعات العمل، أو أوقف أي منشأة مؤقتاً
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => {
              setEditingFacility(null);
              setIsFacilityModalOpen(true);
            }}
          >
            + إضافة منشأة أو ملعب جديد
          </Button>
        </div>

        {facilities.length === 0 ? (
          <div className="empty-state">
            <p style={{ color: 'var(--text-secondary)' }}>لم تقم بإضافة أي ملاعب أو منشآت بعد.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingFacility(null);
                setIsFacilityModalOpen(true);
              }}
              style={{ marginTop: 'var(--space-2)' }}
            >
              + إضافة أول منشأة
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {facilities.map((fac) => {
              const meta = getActivityMeta(fac.activityType);
              const isSession = fac.bookingType === 'session';
              const isActive = fac.isActive !== false;

              return (
                <div
                  key={fac._id || fac.id}
                  style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: isActive ? 1 : 0.65,
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{meta.icon}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {fac.name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {meta.name} {fac.subType ? `• ${fac.subType}` : ''}
                        </span>
                      </div>
                    </div>

                    <Badge variant={isActive ? 'success' : 'neutral'}>
                      {isActive ? 'متاح للحجز' : 'متوقف مؤقتاً'}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 'var(--space-2) 0' }}>
                    <div>
                      {isSession ? `جلسات مشاركة: ${fac.capacity} أفراد` : `حجز ملعب: ${fac.slotDurationMinutes || 60} دقيقة`}
                    </div>
                    <div>
                      المواعيد: {fac.operatingHours?.open || '08:00'} إلى {fac.operatingHours?.close || '02:00'}
                    </div>
                    <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--primary)' }}>
                      السعر: {formatCurrency(fac.defaultHourlyPrice || fac.defaultDayPrice || 200)} {isSession ? '/ فرد' : '/ ساعة'}
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 'var(--space-3)',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      gap: 'var(--space-2)',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleFacility(fac._id || fac.id)}
                      className={`btn btn-sm ${isActive ? 'btn-outline' : 'btn-primary'}`}
                      style={{ fontSize: '0.75rem', padding: '0 var(--space-2)' }}
                      title={isActive ? 'إيقاف مؤقت' : 'تفعيل'}
                    >
                      <Power size={12} /> {isActive ? 'إيقاف' : 'تفعيل'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingFacility(fac);
                        setIsFacilityModalOpen(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0 var(--space-2)' }}
                      title="تعديل"
                    >
                      <Edit2 size={12} /> تعديل
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteFacility(fac._id || fac.id)}
                      className="btn btn-danger btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0 var(--space-2)' }}
                      title="حذف"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Revenue Chart */}
      {stats?.chartData && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <RevenueChart data={stats.chartData} />
        </div>
      )}

      {/* Bookings Management Table */}
      <Card padding="md">
        <div
          className="flex justify-between items-center"
          style={{
            marginBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 'var(--space-3)',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              سجل الحجوزات وإدارة المواعيد
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              متابعة حضور اللاعبين، تأكيد الحجوزات، وتحصيل مبالغ الكاش
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            {/* Facility Filter */}
            {facilities.length > 1 && (
              <select
                value={selectedFacilityFilter}
                onChange={(e) => setSelectedFacilityFilter(e.target.value)}
                className="input-field"
                style={{ minWidth: '150px', height: '36px', fontSize: '0.8125rem' }}
              >
                <option value="all">كل المنشآت</option>
                {facilities.map((f) => (
                  <option key={f._id || f.id} value={f._id || f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="input-field"
              style={{ minWidth: '130px', height: '36px', fontSize: '0.8125rem' }}
            >
              <option value="all">كل الحالات</option>
              <option value="pending_confirmation">في انتظار التأكيد</option>
              <option value="confirmed">مؤكد</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>

        <BookingTable
          bookings={filteredBookings}
          onUpdateStatus={handleUpdateBookingStatus}
          loading={refreshing}
        />
      </Card>

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        facilities={facilities}
        onSuccess={fetchDashboardData}
      />

      {/* Add / Edit Facility Modal */}
      <FacilityModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        facility={editingFacility}
        venueId={venue?._id || venue?.id}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}

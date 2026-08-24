'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import {
  formatCurrency,
  formatDateArabic,
  formatSlotRange12h,
  getStatusInfo,
  getPaymentStatusInfo,
} from '@/lib/utils';
import {
  Users,
  UserCheck,
  DollarSign,
  Award,
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  ChevronLeft,
  CalendarDays,
} from 'lucide-react';

export default function DashboardUsersPage() {
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Customer Details Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterType !== 'all') params.append('filter', filterType);

      const res = await apiRequest(`/dashboard/customers?${params.toString()}`);
      if (res.success && res.data) {
        setStats(res.data.stats);
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      showToast(err.message || 'فشل جلب بيانات العملاء', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filterType, showToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch bookings when a customer is selected
  const handleOpenCustomerDetails = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingBookings(true);
    try {
      const res = await apiRequest(`/dashboard/customers/${customer.id}/bookings`);
      if (res.success) {
        setCustomerBookings(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'فشل جلب حجوزات العميل', 'error');
      setCustomerBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Update booking status from within the modal
  const handleUpdateBookingStatus = async (bookingId, newStatus, newPaymentStatus) => {
    setUpdatingBookingId(bookingId);
    try {
      const res = await apiRequest(`/dashboard/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (res.success) {
        showToast('تم تحديث حالة الحجز بنجاح', 'success');
        // Update state in modal
        setCustomerBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, ...res.data } : b))
        );
        // Refresh customer list stats in background
        fetchCustomers();
      }
    } catch (err) {
      showToast(err.message || 'فشل تحديث الحجز', 'error');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Helper for WhatsApp link
  const getWhatsAppLink = (phone) => {
    if (!phone) return '#';
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '20' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('20') && cleanPhone.length === 10) {
      cleanPhone = '20' + cleanPhone;
    }
    return `https://wa.me/${cleanPhone}`;
  };

  if (loading) {
    return <Loader text="جاري تجهيز بيانات المستخدمين والعملاء..." />;
  }

  return (
    <div>
      {/* Top Header */}
      <div
        className="flex justify-between items-center"
        style={{
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            المستخدمين والعملاء
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            قائمة بجميع اللاعبين والعملاء المسجلين وسجل الحجوزات التفصيلي لكل عميل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
            icon={RefreshCw}
            disabled={refreshing}
          >
            {refreshing ? 'جاري التحديث...' : 'تحديث'}
          </Button>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <Card style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  إجمالي العملاء
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {stats.totalCustomers}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-raised)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <Users size={20} />
              </div>
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  عملاء بحجوزات فعلية
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                  {stats.activeBookers}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--success-light, #10B9811A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--success, #10B981)',
                }}
              >
                <UserCheck size={20} />
              </div>
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  إجمالي الإيرادات
                </span>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--warning, #F59E0B)', marginTop: '2px' }}>
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--warning-light, #F59E0B1A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--warning, #F59E0B)',
                }}
              >
                <DollarSign size={20} />
              </div>
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  العميل الأكثر حجزاً
                </span>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '140px',
                  }}
                  title={stats.topCustomer?.name || 'لا يوجد بعد'}
                >
                  {stats.topCustomer?.name || '—'}
                </div>
                {stats.topCustomer && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {stats.topCustomer.totalBookings} حجز ({formatCurrency(stats.topCustomer.totalSpent)})
                  </span>
                )}
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-light, #3B82F61A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <Award size={20} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)' }}>
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <input
              type="text"
              className="input"
              placeholder="البحث بالاسم أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '36px' }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              الكل ({stats?.totalCustomers || 0})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('frequent')}
              className={`btn btn-sm ${filterType === 'frequent' ? 'btn-primary' : 'btn-outline'}`}
            >
              عملاء متكررون (3+)
            </button>
            <button
              type="button"
              onClick={() => setFilterType('active')}
              className={`btn btn-sm ${filterType === 'active' ? 'btn-primary' : 'btn-outline'}`}
            >
              حجوزات نشطة
            </button>
            <button
              type="button"
              onClick={() => setFilterType('new')}
              className={`btn btn-sm ${filterType === 'new' ? 'btn-primary' : 'btn-outline'}`}
            >
              عملاء جدد
            </button>
          </div>
        </div>
      </Card>

      {/* Customers Table Card */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {customers.length === 0 ? (
          <div style={{ padding: 'var(--space-10) var(--space-4)', textAlign: 'center' }}>
            <Users size={36} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-2)' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
              لا يوجد مستخدمين مطابقين للبحث
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              جرب تغيير خيارات التصفية أو البحث برقم هاتف آخر
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    المستخدم / العميل
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    رقم الهاتف والتواصل
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    نوع الحساب
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
                    عدد الحجوزات
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    إجمالي المدفوعات
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    آخر حجز
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'left' }}>
                    الإجراء
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleOpenCustomerDetails(c)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background var(--transition-fast)',
                        cursor: 'pointer',
                      }}
                      className="hover-row"
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 'var(--radius-full)',
                              background: c.isRegistered ? 'var(--primary-light, #3B82F61A)' : 'var(--bg-surface-raised)',
                              color: c.isRegistered ? 'var(--primary)' : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              border: '1px solid var(--border-subtle)',
                              flexShrink: 0,
                            }}
                          >
                            {c.name ? c.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                              {c.name || 'عميل بدون اسم'}
                            </span>
                            {c.email && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {c.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone & Quick contact */}
                      <td
                        style={{ padding: 'var(--space-3) var(--space-4)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ fontFamily: 'Inter, sans-serif', direction: 'ltr', fontWeight: 500 }}>
                            {c.phone || '—'}
                          </span>
                          {c.phone && (
                            <div className="flex items-center gap-1">
                              <a
                                href={getWhatsAppLink(c.phone)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline btn-sm"
                                title="محادثة واتساب مباشرة"
                                style={{
                                  padding: '4px 6px',
                                  color: '#25D366',
                                  borderColor: 'var(--border-subtle)',
                                }}
                              >
                                <MessageCircle size={14} />
                              </a>
                              <a
                                href={`tel:${c.phone}`}
                                className="btn btn-outline btn-sm"
                                title="اتصال هاتفي"
                                style={{
                                  padding: '4px 6px',
                                  color: 'var(--primary)',
                                  borderColor: 'var(--border-subtle)',
                                }}
                              >
                                <Phone size={14} />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Account Type */}
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        {c.isRegistered ? (
                          <Badge variant="primary">حساب مسجل</Badge>
                        ) : (
                          <Badge variant="neutral">حجز برقم الهاتف</Badge>
                        )}
                      </td>

                      {/* Total Bookings Count */}
                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            background: c.totalBookings > 0 ? 'var(--bg-surface-raised)' : 'transparent',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {c.totalBookings}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(c.totalSpent)}
                      </td>

                      {/* Last Booking Date */}
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {c.lastBookingDate ? formatDateArabic(c.lastBookingDate) : 'لا يوجد حجز'}
                      </td>

                      {/* View Action */}
                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={ChevronLeft}
                          onClick={() => handleOpenCustomerDetails(c)}
                        >
                          عرض الحجوزات
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* =========================================================================
          Customer Details & Full Bookings Modal
          ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title="تفاصيل العميل وسجل الحجوزات"
        size="lg"
      >
        {selectedCustomer && (
          <div className="flex flex-col gap-4">
            {/* Customer Profile Card */}
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}
            >
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 'var(--radius-full)',
                      background: selectedCustomer.isRegistered ? 'var(--primary)' : 'var(--border-strong)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.125rem',
                      flexShrink: 0,
                    }}
                  >
                    {selectedCustomer.name ? selectedCustomer.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {selectedCustomer.name}
                      </h3>
                      {selectedCustomer.isRegistered ? (
                        <Badge variant="primary">حساب مسجل</Badge>
                      ) : (
                        <Badge variant="neutral">حجز ضيف</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', direction: 'ltr' }}>
                        {selectedCustomer.phone || 'بدون رقم'}
                      </span>
                      {selectedCustomer.email && <span>• {selectedCustomer.email}</span>}
                    </div>
                  </div>
                </div>

                {/* Contact Quick Buttons */}
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={getWhatsAppLink(selectedCustomer.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ color: '#25D366', borderColor: 'var(--border-subtle)' }}
                    >
                      <MessageCircle size={15} />
                      <span>واتساب</span>
                    </a>
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--primary)', borderColor: 'var(--border-subtle)' }}
                    >
                      <Phone size={15} />
                      <span>اتصال</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Stats Chips Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ textAlign: 'center', padding: 'var(--space-2)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>إجمالي الحجوزات</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{selectedCustomer.totalBookings}</strong>
                </div>

                <div style={{ textAlign: 'center', padding: 'var(--space-2)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>حجوزات مؤكدة</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--success)' }}>{selectedCustomer.confirmedBookings}</strong>
                </div>

                <div style={{ textAlign: 'center', padding: 'var(--space-2)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>حجوزات مكتملة</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--info)' }}>{selectedCustomer.completedBookings}</strong>
                </div>

                <div style={{ textAlign: 'center', padding: 'var(--space-2)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>حجوزات ملغية</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--danger)' }}>{selectedCustomer.cancelledBookings}</strong>
                </div>

                <div style={{ textAlign: 'center', padding: 'var(--space-2)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>إجمالي المدفوعات</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--warning, #F59E0B)' }}>{formatCurrency(selectedCustomer.totalSpent)}</strong>
                </div>
              </div>
            </div>

            {/* Bookings History Section */}
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-3)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  سجل الحجوزات ({customerBookings.length})
                </h4>
              </div>

              {loadingBookings ? (
                <div style={{ padding: 'var(--space-8) 0', textAlign: 'center' }}>
                  <Loader text="جاري جلب تفاصيل الحجوزات..." />
                </div>
              ) : customerBookings.length === 0 ? (
                <div
                  style={{
                    padding: 'var(--space-8) var(--space-4)',
                    textAlign: 'center',
                    background: 'var(--bg-surface-raised)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <CalendarDays size={32} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-2)' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>لا توجد حجوزات مسجلة لهذا العميل حتى الآن</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
                  {customerBookings.map((b) => {
                    const statusObj = getStatusInfo(b.status);
                    const paymentObj = getPaymentStatusInfo(b.paymentStatus);
                    const isUpdating = updatingBookingId === b._id;

                    return (
                      <div
                        key={b._id}
                        style={{
                          background: 'var(--bg-surface-raised)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-3) var(--space-4)',
                        }}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          {/* Date & Time */}
                          <div>
                            <div className="flex items-center gap-2">
                              <Calendar size={15} style={{ color: 'var(--primary)' }} />
                              <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                                {formatDateArabic(b.dateString)}
                              </strong>
                              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                                ({b.dateString})
                              </span>
                            </div>

                            <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
                              <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {formatSlotRange12h(b.startTime, b.endTime)}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                • {b.bookingSource === 'dashboard_manual' ? 'حجز يدوي / هاتف' : 'حجز أونلاين'}
                              </span>
                            </div>
                          </div>

                          {/* Price & Badges */}
                          <div className="flex flex-col items-end gap-1.5">
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                              {formatCurrency(b.price)}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`badge ${statusObj.colorClass}`}>
                                {statusObj.label}
                              </span>
                              <span className={`badge ${paymentObj.colorClass}`}>
                                {paymentObj.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Notes if present */}
                        {b.notes && (
                          <div
                            style={{
                              marginTop: 'var(--space-2)',
                              padding: 'var(--space-2)',
                              background: 'var(--bg-surface)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>ملاحظات:</span> {b.notes}
                          </div>
                        )}

                        {/* Management Controls */}
                        <div
                          className="flex items-center justify-between flex-wrap gap-2"
                          style={{
                            marginTop: 'var(--space-3)',
                            paddingTop: 'var(--space-2)',
                            borderTop: '1px solid var(--border-subtle)',
                            fontSize: '0.75rem',
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)' }}>
                            تاريخ التسجيل: {new Date(b.createdAt).toLocaleDateString('ar-EG')}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {b.status !== 'completed' && b.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b._id, 'completed', 'paid_cash')}
                                disabled={isUpdating}
                                className="btn btn-sm btn-outline"
                                style={{ fontSize: '0.75rem', padding: '3px 8px', color: 'var(--success)' }}
                              >
                                تحديد كمكتمل ومسدد
                              </button>
                            )}

                            {b.paymentStatus !== 'paid_cash' && b.paymentStatus !== 'paid_online' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b._id, b.status, 'paid_cash')}
                                disabled={isUpdating}
                                className="btn btn-sm btn-outline"
                                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                              >
                                تحصيل المبلغ (كاش)
                              </button>
                            )}

                            {b.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b._id, 'cancelled', b.paymentStatus)}
                                disabled={isUpdating}
                                className="btn btn-sm btn-outline"
                                style={{ fontSize: '0.75rem', padding: '3px 8px', color: 'var(--danger)' }}
                              >
                                إلغاء الحجز
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Close Footer */}
            <div style={{ marginTop: 'var(--space-2)', textAlign: 'left' }}>
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                إغلاق النافذة
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

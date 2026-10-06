'use client';

import React from 'react';
import { formatCurrency, getStatusInfo, getPaymentStatusInfo, formatSlotRange12h } from '@/lib/utils';
import { getActivityMeta } from '@/lib/activities';
import Badge from '@/components/ui/Badge';
import { Check, X, User, Globe, PenTool, Layers, Users } from 'lucide-react';

/**
 * Group consecutive booking slots by the same player on the same date & facility
 */
function groupConsecutiveBookings(rawBookings) {
  if (!rawBookings || rawBookings.length === 0) return [];

  const sorted = [...rawBookings].sort((a, b) => {
    if (a.dateString !== b.dateString) return b.dateString.localeCompare(a.dateString);
    if (a.playerPhone !== b.playerPhone) return a.playerPhone.localeCompare(b.playerPhone);
    return a.startTime.localeCompare(b.startTime);
  });

  const grouped = [];

  sorted.forEach((item) => {
    if (grouped.length === 0) {
      grouped.push({
        ...item,
        ids: [item._id],
        totalPrice: item.price,
        slotsCount: 1,
      });
      return;
    }

    const last = grouped[grouped.length - 1];

    const isSamePlayer = last.playerPhone === item.playerPhone;
    const isSameDate = last.dateString === item.dateString;
    const isSameFacility = (last.facility?._id || last.facility) === (item.facility?._id || item.facility);
    const isSameStatus = last.status === item.status;
    const isSamePaymentStatus = last.paymentStatus === item.paymentStatus;
    const isConsecutiveTime = last.endTime === item.startTime;

    if (isSamePlayer && isSameDate && isSameFacility && isSameStatus && isSamePaymentStatus && isConsecutiveTime) {
      last.endTime = item.endTime;
      last.totalPrice += item.price;
      last.slotsCount += 1;
      last.ids.push(item._id);
    } else {
      grouped.push({
        ...item,
        ids: [item._id],
        totalPrice: item.price,
        slotsCount: 1,
      });
    }
  });

  return grouped;
}

export default function BookingTable({ bookings = [], onUpdateStatus, loading }) {
  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        جاري تحميل جدول الحجوزات...
      </div>
    );
  }

  const groupedBookings = groupConsecutiveBookings(bookings);

  if (groupedBookings.length === 0) {
    return (
      <div className="empty-state" style={{ margin: 'var(--space-4) 0' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          لا توجد أي حجوزات مطابقة للبحث أو التاريخ المحدد.
        </p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>اللاعب / الهاتف</th>
            <th>النشاط والمنشأة</th>
            <th>التاريخ والمدة</th>
            <th>السعر الإجمالي</th>
            <th>حالة الحجز</th>
            <th>حالة الدفع</th>
            <th>المصدر</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {groupedBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            const paymentInfo = getPaymentStatusInfo(booking.paymentStatus);
            const isManual = booking.bookingSource === 'dashboard_manual';
            const actionIds = booking.ids || [booking._id];
            const actMeta = getActivityMeta(booking.activityType || booking.facility?.activityType);
            const facName = booking.facility?.name || booking.field?.name || 'الملعب الرئيسي';
            const isSession = booking.bookingType === 'session';

            return (
              <tr key={booking.ids ? booking.ids.join('-') : booking._id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-surface-raised)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      <User size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{booking.playerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>
                        {booking.playerPhone}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Activity & Facility */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{actMeta.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {facName}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {actMeta.name} {isSession && booking.participantsCount ? `(${booking.participantsCount} أفراد)` : ''}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{booking.dateString}</div>
                  <div className="flex items-center gap-1" style={{ marginTop: '2px' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, fontFamily: 'Inter, IBM Plex Sans Arabic, sans-serif' }}>
                      {formatSlotRange12h(booking.startTime, booking.endTime)}
                    </span>
                    {booking.slotsCount > 1 && (
                      <Badge variant="warning">
                        <Layers size={10} /> {booking.slotsCount} ساعات
                      </Badge>
                    )}
                  </div>
                </td>

                <td style={{ fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                  {formatCurrency(booking.totalPrice || booking.price)}
                </td>

                <td>
                  <Badge variant={statusInfo.colorClass.replace('badge-', '')}>
                    {statusInfo.label}
                  </Badge>
                </td>

                <td>
                  <Badge variant={paymentInfo.colorClass.replace('badge-', '')}>
                    {paymentInfo.label}
                  </Badge>
                </td>

                <td>
                  <span
                    className="flex items-center gap-1"
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}
                  >
                    {isManual ? <PenTool size={12} /> : <Globe size={12} />}
                    {isManual ? 'يدوي' : 'أونلاين'}
                  </span>
                </td>

                <td>
                  <div className="flex items-center gap-1">
                    {booking.status === 'pending_confirmation' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(actionIds, 'confirmed', booking.paymentStatus)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0 var(--space-2)', fontSize: '0.75rem' }}
                          title="تأكيد الحجز"
                        >
                          <Check size={13} /> تأكيد
                        </button>
                        <button
                          onClick={() => onUpdateStatus(actionIds, 'cancelled')}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0 var(--space-2)', fontSize: '0.75rem' }}
                          title="إلغاء الحجز"
                        >
                          <X size={13} /> إلغاء
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(actionIds, 'completed', 'paid_cash')}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0 var(--space-2)', fontSize: '0.75rem' }}
                          title="تأكيد الحضور واستلام الكاش"
                        >
                          <Check size={13} /> اكتمل
                        </button>
                        <button
                          onClick={() => onUpdateStatus(actionIds, 'cancelled')}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0 var(--space-2)', fontSize: '0.75rem' }}
                          title="إلغاء الحجز"
                        >
                          <X size={13} /> إلغاء
                        </button>
                      </>
                    )}

                    {(booking.status === 'cancelled' || booking.status === 'auto_expired') && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                        {booking.status === 'auto_expired' ? 'منتهية المهلة' : 'ملغي'}
                      </span>
                    )}

                    {booking.status === 'completed' && (
                      <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                        <Check size={13} /> اكتمل
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

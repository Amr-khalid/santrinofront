'use client';

import React, { useState } from 'react';
import { formatCurrency, formatSlotRange12h, getTimePeriod } from '@/lib/utils';
import { Check, Clock, AlertCircle, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/Loader';

export default function TimeSlotGrid({
  slots = [],
  selectedSlots = [],
  selectedSlot = null,
  facility = null,
  onSelectSlot,
  onSelectRange,
  onClearSelection,
  loading,
}) {
  const [preferredDuration, setPreferredDuration] = useState(1); // 1 | 2 | 3 hours
  const isSession = facility?.bookingType === 'session';

  // Normalize selected list
  const activeSelectedList = Array.isArray(selectedSlots) && selectedSlots.length > 0
    ? selectedSlots
    : selectedSlot
    ? [selectedSlot]
    : [];

  const selectedStartTimes = new Set(activeSelectedList.map((s) => s.startTime));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-2) 0' }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ background: 'var(--bg-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <Skeleton width="140px" height="18px" style={{ marginBottom: 'var(--space-3)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-2)' }}>
              {[1, 2, 3, 4].map((s) => (
                <Skeleton key={s} height="52px" borderRadius="var(--radius-sm)" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Clock size={24} />
        </div>
        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          لا توجد فترات تشغيل متاحة لهذا اليوم
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          يرجى اختيار تاريخ آخر من الشريط أعلاه
        </p>
      </div>
    );
  }

  const availableCount = slots.filter((s) => s.isAvailable).length;

  // Handler when clicking a slot
  const handleSlotClick = (clickedSlot) => {
    if (!clickedSlot.isAvailable) return;

    if (!isSession && preferredDuration > 1 && onSelectRange) {
      const clickedIdx = slots.findIndex((s) => s.startTime === clickedSlot.startTime);
      if (clickedIdx !== -1) {
        const rangeSlots = [];
        for (let i = 0; i < preferredDuration; i++) {
          const targetSlot = slots[clickedIdx + i];
          if (targetSlot && targetSlot.isAvailable) {
            rangeSlots.push(targetSlot);
          } else {
            break;
          }
        }
        if (rangeSlots.length > 0) {
          onSelectRange(rangeSlots);
          return;
        }
      }
    }

    // Default toggle single slot
    onSelectSlot(clickedSlot);
  };

  // Group slots by natural time periods
  const groupedPeriods = slots.reduce((acc, slot) => {
    const period = getTimePeriod(slot.startTime);
    if (!acc[period.id]) {
      acc[period.id] = {
        info: period,
        slots: [],
      };
    }
    acc[period.id].slots.push(slot);
    return acc;
  }, {});

  const periodOrder = ['afternoon', 'evening', 'night', 'morning'];
  const sortedPeriodKeys = periodOrder.filter((k) => groupedPeriods[k]);

  return (
    <div className="timeslot-section">
      {/* Selection Control Bar */}
      <div
        className="flex justify-between items-center"
        style={{
          marginBottom: 'var(--space-3)',
          paddingBottom: 'var(--space-2)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isSession ? 'جلسات اليوم المتاحة' : 'ساعات اليوم المتاحة'}
          </span>
          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
            {availableCount} {isSession ? 'جلسة متاحة' : 'ساعة متاحة'}
          </span>
        </div>

        {/* Duration selector for exclusive courts */}
        {!isSession && (
          <div className="flex items-center gap-1">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'var(--space-1)', fontWeight: 700 }}>
              مدة الحجز:
            </span>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--bg-surface-raised)',
                padding: '2px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                gap: '2px',
              }}
            >
              {[1, 2, 3].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setPreferredDuration(dur)}
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-xs)',
                    background: preferredDuration === dur ? 'var(--bg-surface)' : 'transparent',
                    color: preferredDuration === dur ? 'var(--primary)' : 'var(--text-secondary)',
                    border: preferredDuration === dur ? '1px solid var(--border-subtle)' : 'none',
                    boxShadow: preferredDuration === dur ? 'var(--shadow-xs)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {dur === 1 ? 'ساعة' : dur === 2 ? 'ساعتان' : `${dur} ساعات`}
                </button>
              ))}
            </div>

            {activeSelectedList.length > 0 && onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                style={{
                  color: 'var(--danger)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  marginRight: 'var(--space-2)',
                  background: 'none',
                  border: 'none',
                }}
              >
                إلغاء
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clean Period Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {sortedPeriodKeys.map((periodKey) => {
          const group = groupedPeriods[periodKey];
          const { info, slots: periodSlots } = group;
          const periodAvailableCount = periodSlots.filter((s) => s.isAvailable).length;

          return (
            <div key={periodKey} className="period-container">
              {/* Period Header */}
              <div className="period-header">
                <div className="period-title-group">
                  <span className="period-title">{info.label}</span>
                  {info.timeSpan && <span className="period-timespan-badge">{info.timeSpan}</span>}
                </div>

                <span className={`badge ${periodAvailableCount > 0 ? 'badge-neutral' : 'badge-danger'}`}>
                  {periodAvailableCount > 0
                    ? `${periodAvailableCount} ${isSession ? 'جلسة' : periodAvailableCount === 1 ? 'ساعة' : 'ساعات'} متاحة`
                    : 'مكتمل الحجز'}
                </span>
              </div>

              {/* Slots Grid */}
              <div className="slots-grid">
                {periodSlots.map((slot) => {
                  const isBooked = !slot.isAvailable;
                  const isSelected = selectedStartTimes.has(slot.startTime);
                  const timeRange12h = formatSlotRange12h(slot.startTime, slot.endTime);
                  const bookerName = slot.bookingInfo?.playerName;
                  const slotIsSession = isSession || slot.bookingType === 'session';

                  return (
                    <div
                      key={slot.startTime}
                      onClick={() => handleSlotClick(slot)}
                      className={`slot-card ${isSelected ? 'slot-selected' : ''} ${isBooked ? 'slot-booked' : ''}`}
                    >
                      {/* Top Row: Time Range */}
                      <div className="slot-card-header">
                        <span className="slot-time">
                          <Clock
                            size={13}
                            style={{
                              color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                              flexShrink: 0,
                            }}
                          />
                          {timeRange12h}
                        </span>
                      </div>

                      {/* Capacity Status for Sessions */}
                      {slotIsSession && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: isBooked ? 'var(--danger)' : 'var(--text-secondary)',
                            marginTop: '2px',
                          }}
                        >
                          <Users size={12} />
                          <span>
                            {isBooked ? 'اكتمل العدد' : `متبقي ${slot.remainingSlots || 0} مقعد`}
                          </span>
                        </div>
                      )}

                      {/* Bottom Row: Price and Status Tag */}
                      <div className="slot-card-footer">
                        <span className="slot-price">
                          {isBooked && !slotIsSession ? '—' : formatCurrency(slot.price)}
                        </span>

                        {isSelected ? (
                          <span className="slot-status-tag" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={11} />
                            محدد
                          </span>
                        ) : isBooked ? (
                          <span className="slot-status-tag" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                            {bookerName ? `محجوز (${bookerName.split(' ')[0]})` : 'مكتمل'}
                          </span>
                        ) : (
                          <span className="slot-status-tag">متاح</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { getNextDays, formatDateArabic } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, LayoutGrid, StretchHorizontal } from 'lucide-react';

export default function DatePicker({ selectedDate, onSelectDate }) {
  // Default is 'calendar' as requested
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'strip'

  // Date initialization
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const days = getNextDays(14);

  // Month navigation for Calendar view
  const selectedDateObj = new Date(selectedDate || todayStr);
  const [currentYear, setCurrentYear] = useState(selectedDateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(selectedDateObj.getMonth());

  // Generate Month Matrix
  const getMonthData = (year, month) => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat
    const startingDay = (firstDayIndex + 1) % 7; // Align to Saturday start in Egypt/Arab world
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthName = new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));

    const daysArray = [];
    for (let i = 0; i < startingDay; i++) {
      daysArray.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;

      daysArray.push({
        dayNumber: d,
        dateString: dateStr,
        isPast,
        isToday,
        isSelected,
      });
    }

    return { monthName, daysArray };
  };

  const { monthName, daysArray } = getMonthData(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const weekDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      {/* Calendar Header with Mode Switcher & Month Navigation */}
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
          <div className="step-icon-wrapper" style={{ width: '32px', height: '32px' }}>
            <CalendarIcon size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {viewMode === 'calendar' ? monthName : 'المواعيد القادمة'}
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              المحدد: {formatDateArabic(selectedDate)}
            </span>
          </div>
        </div>

        {/* View Switcher & Month Controls */}
        <div className="flex items-center gap-2">
          {/* Month Navigation Arrows (Only in Calendar View) */}
          {viewMode === 'calendar' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="btn btn-outline btn-sm"
                aria-label="الشهر السابق"
                style={{ minHeight: '32px', padding: '0 var(--space-2)' }}
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="btn btn-outline btn-sm"
                aria-label="الشهر التالي"
                style={{ minHeight: '32px', padding: '0 var(--space-2)' }}
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

          {/* Toggle: Calendar / Strip */}
          <div
            style={{
              background: 'var(--bg-surface-raised)',
              padding: '2px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-xs)',
                background: viewMode === 'calendar' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'calendar' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              التقويم
            </button>
            <button
              type="button"
              onClick={() => setViewMode('strip')}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-xs)',
                background: viewMode === 'strip' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'strip' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              الشريط
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: FULL MONTH CALENDAR GRID (Default) */}
      {viewMode === 'calendar' && (
        <div
          style={{
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            animation: 'fadeIn var(--transition-fast) ease-out',
          }}
        >
          {/* Weekday Names Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 'var(--space-1)',
              textAlign: 'center',
              marginBottom: 'var(--space-2)',
              paddingBottom: 'var(--space-1)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {weekDays.map((wDay, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  padding: 'var(--space-1) 0',
                }}
              >
                {wDay}
              </div>
            ))}
          </div>

          {/* Month Days Matrix */}
          <div className="calendar-matrix">
            {daysArray.map((dItem, idx) => {
              if (!dItem) {
                return <div key={`empty-${idx}`} className="calendar-day-btn" style={{ background: 'transparent', border: 'none', cursor: 'default' }} />;
              }

              return (
                <button
                  key={dItem.dateString}
                  type="button"
                  onClick={() => {
                    if (!dItem.isPast) {
                      onSelectDate(dItem.dateString);
                    }
                  }}
                  disabled={dItem.isPast}
                  className="calendar-day-btn"
                  style={{
                    background: dItem.isSelected
                      ? 'var(--primary)'
                      : dItem.isToday
                      ? 'var(--primary-light)'
                      : 'var(--bg-surface)',
                    border: dItem.isSelected
                      ? '1.5px solid var(--primary)'
                      : dItem.isToday
                      ? '1px solid var(--primary-border)'
                      : '1px solid var(--border-subtle)',
                    color: dItem.isSelected
                      ? '#FFFFFF'
                      : dItem.isPast
                      ? 'var(--text-disabled)'
                      : 'var(--text-primary)',
                    fontWeight: dItem.isSelected || dItem.isToday ? 700 : 500,
                    cursor: dItem.isPast ? 'not-allowed' : 'pointer',
                    opacity: dItem.isPast ? 0.45 : 1,
                    boxShadow: dItem.isSelected
                      ? '0 0 14px rgba(16, 185, 129, 0.4)'
                      : 'none',
                  }}
                >
                  <span>{dItem.dayNumber}</span>
                  {dItem.isToday && !dItem.isSelected && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        color: 'var(--primary)',
                        lineHeight: 1,
                        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      اليوم
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: QUICK HORIZONTAL STRIP */}
      {viewMode === 'strip' && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            overflowX: 'auto',
            padding: 'var(--space-1) 0 var(--space-2)',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            animation: 'fadeIn var(--transition-fast) ease-out',
          }}
        >
          {days.map((day) => {
            const isSelected = selectedDate === day.dateString;
            return (
              <button
                key={day.dateString}
                type="button"
                onClick={() => onSelectDate(day.dateString)}
                style={{
                  scrollSnapAlign: 'start',
                  minWidth: '82px',
                  padding: 'var(--space-3) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-default)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 0 14px rgba(16, 185, 129, 0.4)' : 'var(--shadow-xs)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-secondary)',
                  }}
                >
                  {day.dayName}
                </span>

                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    fontFamily: 'Inter, sans-serif',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  }}
                >
                  {day.dayNumber}
                </span>

                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: isSelected ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-secondary)',
                  }}
                >
                  {day.monthName}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}




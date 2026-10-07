'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { DAYS_OF_WEEK, formatTime12h } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { apiRequest } from '@/lib/api';
import { Clock, Calendar, Sparkles, Wand2 } from 'lucide-react';

const PERIOD_PRESETS = [
  { label: 'فترة الصباح', startTime: '08:00', endTime: '12:00', desc: '8:00 ص – 12:00 م' },
  { label: 'فترة الظهيرة', startTime: '12:00', endTime: '15:00', desc: '12:00 م – 3:00 م' },
  { label: 'فترة العصر', startTime: '15:00', endTime: '18:00', desc: '3:00 م – 6:00 م' },
  { label: 'فترة المساء', startTime: '18:00', endTime: '21:00', desc: '6:00 م – 9:00 م' },
  { label: 'فترة الليل', startTime: '21:00', endTime: '23:59', desc: '9:00 م – 12:00 ص' },
  { label: 'ساعات بعد منتصف الليل', startTime: '00:00', endTime: '05:00', desc: '12:00 ص – 5:00 ص' },
  { label: 'فترة الفجر', startTime: '05:00', endTime: '08:00', desc: '5:00 ص – 8:00 ص' },
];

export function getAutoPeriodName(start) {
  if (!start) return 'فترة مخصصة';
  const hour = parseInt(start.split(':')[0], 10);
  if (hour >= 5 && hour < 8) return 'فترة الفجر';
  if (hour >= 8 && hour < 12) return 'فترة الصباح';
  if (hour >= 12 && hour < 15) return 'فترة الظهيرة';
  if (hour >= 15 && hour < 18) return 'فترة العصر';
  if (hour >= 18 && hour < 21) return 'فترة المساء';
  if (hour >= 21 && hour <= 23) return 'فترة الليل';
  return 'ساعات بعد منتصف الليل';
}

export default function PricingModal({ isOpen, onClose, rule, onSuccess }) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');
  const [price, setPrice] = useState(250);
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [loading, setLoading] = useState(false);
  const [isAutoName, setIsAutoName] = useState(true);

  useEffect(() => {
    if (rule) {
      setName(rule.name || '');
      setStartTime(rule.startTime || '18:00');
      setEndTime(rule.endTime || '21:00');
      setPrice(rule.price || 250);
      setSelectedDays(rule.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
      setIsAutoName(false);
    } else {
      const initialStart = '18:00';
      const initialEnd = '21:00';
      setStartTime(initialStart);
      setEndTime(initialEnd);
      setName(getAutoPeriodName(initialStart));
      setPrice(250);
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setIsAutoName(true);
    }
  }, [rule, isOpen]);

  const handleStartTimeChange = (newStart) => {
    setStartTime(newStart);
    if (isAutoName || !name.trim()) {
      setName(getAutoPeriodName(newStart));
    }
  };

  const toggleDay = (dayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const selectAllDays = () => setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  const selectWeekendOnly = () => setSelectedDays([4, 5, 6]); // Thu, Fri, Sat
  const selectWeekdaysOnly = () => setSelectedDays([0, 1, 2, 3]); // Sun - Wed

  const handleApplyPreset = (preset) => {
    setName(preset.label);
    setStartTime(preset.startTime);
    setEndTime(preset.endTime);
    setIsAutoName(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = name.trim() || getAutoPeriodName(startTime);

    if (selectedDays.length === 0) {
      showToast('يرجى اختيار يوم واحد على الأقل', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: finalName,
        startTime,
        endTime,
        price: Number(price),
        priority: 1,
        daysOfWeek: selectedDays,
      };

      let res;
      if (rule?._id) {
        res = await apiRequest(`/dashboard/pricing/${rule._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest('/dashboard/pricing', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        showToast(rule?._id ? 'تم تعديل فترة التسعير بنجاح' : 'تم إضافة فترة التسعير بنجاح', 'success');
        onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'حدث خطأ أثناء حفظ فترة التسعير', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={rule?._id ? 'تعديل فترة التسعير' : 'إضافة فترة تسعير مخصصة'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Quick Period Presets */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            <span>اختر فترة المواعيد (تعبئة تلقائية):</span>
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
            {PERIOD_PRESETS.map((preset) => {
              const isSelected = name === preset.label && startTime === preset.startTime && endTime === preset.endTime;
              return (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handleApplyPreset(preset)}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                  }}
                  title={preset.desc}
                >
                  {preset.label} ({preset.desc})
                </button>
              );
            })}
          </div>
        </div>

        {/* Time range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label className="form-label required">من الساعة</label>
            <input
              type="time"
              className="input"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label required">إلى الساعة</label>
            <input
              type="time"
              className="input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Rule Name - Auto-filled based on selected time */}
        <div>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-1)' }}>
            <label className="form-label required" style={{ margin: 0 }}>اسم الفترة</label>
            <button
              type="button"
              onClick={() => {
                setName(getAutoPeriodName(startTime));
                setIsAutoName(true);
              }}
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <Wand2 size={12} /> تحديث تلقائي حسب الوقت
            </button>
          </div>
          <input
            type="text"
            className="input"
            placeholder="مثال: فترة المساء، سهرة نهاية الأسبوع"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsAutoName(false);
            }}
            required
          />
        </div>

        {/* Days selection */}
        <div>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
            <label className="form-label required" style={{ margin: 0 }}>الأيام المطبقة</label>
            <div className="flex gap-2" style={{ fontSize: '0.75rem' }}>
              <button type="button" onClick={selectAllDays} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                كل الأيام
              </button>
              <button type="button" onClick={selectWeekendOnly} style={{ color: 'var(--warning-text, var(--warning))', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                الويك إند
              </button>
              <button type="button" onClick={selectWeekdaysOnly} style={{ color: 'var(--text-secondary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                وسط الأسبوع
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day.id);
              return (
                <button
                  type="button"
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-default)'}`,
                    transition: 'var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                >
                  {day.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="form-label required">سعر الساعة في هذه الفترة (ج.م)</label>
          <input
            type="number"
            className="input"
            min={50}
            step={25}
            placeholder="مثال: 250"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2" style={{ marginTop: 'var(--space-3)' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {rule?._id ? 'حفظ التعديلات' : 'إنشاء الفترة'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

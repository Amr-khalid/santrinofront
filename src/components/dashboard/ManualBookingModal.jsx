'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { apiRequest } from '@/lib/api';
import { getActivityMeta } from '@/lib/activities';

export default function ManualBookingModal({ isOpen, onClose, facilities = [], onSuccess }) {
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedFacilityId, setSelectedFacilityId] = useState(
    facilities[0]?._id || facilities[0]?.id || ''
  );
  const [dateString, setDateString] = useState(todayStr);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [participantsCount, setParticipantsCount] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState('paid_cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedFacility = facilities.find(
    (f) => (f._id || f.id) === selectedFacilityId
  ) || facilities[0];
  const isSession = selectedFacility?.bookingType === 'session';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerName.trim() || !playerPhone.trim()) {
      showToast('يرجى إدخال اسم ورقم هاتف اللاعب', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/dashboard/bookings/manual', {
        method: 'POST',
        body: JSON.stringify({
          facilityId: selectedFacilityId || (facilities[0]?._id || facilities[0]?.id),
          dateString,
          startTime,
          endTime,
          playerName: playerName.trim(),
          playerPhone: playerPhone.trim(),
          participantsCount: isSession ? participantsCount : 1,
          paymentStatus,
          notes: notes.trim(),
        }),
      });

      if (res.success) {
        showToast('تم تسجيل الحجز اليدوي وقفل الموعد بنجاح', 'success');
        if (onSuccess) onSuccess();
        onClose();
        setPlayerName('');
        setPlayerPhone('');
        setNotes('');
      }
    } catch (err) {
      showToast(err.message || 'حدث خطأ في تسجيل الحجز', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل حجز يدوي مباشر">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Facility Selector */}
        {facilities.length > 0 && (
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              المنشأة أو الملعب المراد حجزه *
            </label>
            <select
              value={selectedFacilityId || (facilities[0]?._id || facilities[0]?.id)}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="input-field"
              required
            >
              {facilities.map((f) => {
                const meta = getActivityMeta(f.activityType);
                return (
                  <option key={f._id || f.id} value={f._id || f.id}>
                    {meta.icon} {f.name} ({meta.name})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <Input
          label="تاريخ الحجز *"
          type="date"
          value={dateString}
          onChange={(e) => setDateString(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <Input
            label="من الساعة *"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="إلى الساعة *"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {/* If session, show participants count */}
        {isSession && (
          <Input
            label="عدد الأفراد في الجلسة *"
            type="number"
            min="1"
            value={participantsCount}
            onChange={(e) => setParticipantsCount(Number(e.target.value))}
            required
          />
        )}

        <Input
          label="اسم اللاعب أو الفريق *"
          placeholder="مثال: كابتن أحمد طارق"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />

        <Input
          label="رقم الهاتف للتواصل *"
          placeholder="01012345678"
          value={playerPhone}
          onChange={(e) => setPlayerPhone(e.target.value)}
          dir="ltr"
          required
        />

        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
            حالة الدفع
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="input-field"
          >
            <option value="paid_cash">تم الدفع نقداً (كاش)</option>
            <option value="pending">في انتظار الدفع عند الحضور</option>
          </select>
        </div>

        <Textarea
          label="ملاحظات الحجز"
          placeholder="أي تفاصيل خاصة بالحجز أو المتصل..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            تثبيت الحجز وقفل الموعد
          </Button>
        </div>
      </form>
    </Modal>
  );
}

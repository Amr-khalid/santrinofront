'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { apiRequest } from '@/lib/api';

export default function ManualBookingModal({ isOpen, onClose, onSuccess }) {
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const [dateString, setDateString] = useState(todayStr);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid_cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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
          dateString,
          startTime,
          endTime,
          playerName: playerName.trim(),
          playerPhone: playerPhone.trim(),
          paymentStatus,
          notes: notes.trim(),
        }),
      });

      if (res.success) {
        showToast('تم تسجيل الحجز اليدوي بنجاح', 'success');
        onSuccess();
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
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل حجز يدوي">
      <form onSubmit={handleSubmit}>
        <Input
          label="تاريخ الحجز"
          type="date"
          value={dateString}
          onChange={(e) => setDateString(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <Input
            label="من الساعة"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="إلى الساعة"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <Input
          label="اسم اللاعب أو الفريق"
          placeholder="مثال: كابتن أحمد"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />

        <Input
          label="رقم الهاتف"
          placeholder="01012345678"
          value={playerPhone}
          onChange={(e) => setPlayerPhone(e.target.value)}
          required
        />

        <Select
          label="حالة تحصيل الدفع"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          options={[
            { value: 'paid_cash', label: 'تم الاستلام كاش الآن' },
            { value: 'pending', label: 'الدفع آجل عند الحضور للملعب' },
          ]}
        />

        <Textarea
          label="ملاحظات الحجز"
          placeholder="أي تفاصيل خاصة بالحجز..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-2" style={{ marginTop: 'var(--space-4)' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            حفظ وتأكيد الحجز
          </Button>
        </div>
      </form>
    </Modal>
  );
}

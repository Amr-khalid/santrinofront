'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { apiRequest } from '@/lib/api';
import { ACTIVITIES } from '@/lib/activities';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export default function FacilityModal({ isOpen, onClose, facility = null, venueId = null, onSuccess }) {
  const { showToast } = useToast();
  const isEditing = Boolean(facility);

  const [name, setName] = useState('');
  const [activityType, setActivityType] = useState('padel');
  const [subType, setSubType] = useState('');
  const [bookingType, setBookingType] = useState('time_slot');
  const [capacity, setCapacity] = useState(1);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [defaultHourlyPrice, setDefaultHourlyPrice] = useState(250);
  const [defaultNightPrice, setDefaultNightPrice] = useState(300);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('02:00');
  const [amenitiesStr, setAmenitiesStr] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (facility) {
      setName(facility.name || '');
      setActivityType(facility.activityType || 'padel');
      setSubType(facility.subType || '');
      setBookingType(facility.bookingType || 'time_slot');
      setCapacity(facility.capacity || (facility.bookingType === 'session' ? 20 : 1));
      setSlotDurationMinutes(facility.slotDurationMinutes || 60);
      setDefaultHourlyPrice(facility.defaultHourlyPrice || facility.defaultDayPrice || 250);
      setDefaultNightPrice(facility.defaultNightPrice || 300);
      setOpenTime(facility.operatingHours?.open || '08:00');
      setCloseTime(facility.operatingHours?.close || '02:00');
      setAmenitiesStr((facility.amenities || []).join('، '));
      setDescription(facility.description || '');
    } else {
      setName('');
      setActivityType('padel');
      setSubType('');
      setBookingType('time_slot');
      setCapacity(1);
      setSlotDurationMinutes(90);
      setDefaultHourlyPrice(300);
      setDefaultNightPrice(350);
      setOpenTime('08:00');
      setCloseTime('02:00');
      setAmenitiesStr('');
      setDescription('');
    }
  }, [facility, isOpen]);

  // Adjust defaults when activity changes
  const handleActivityChange = (act) => {
    setActivityType(act);
    if (act === 'swimming' || act === 'fitness' || act === 'yoga' || act === 'martial_arts') {
      setBookingType('session');
      setCapacity(20);
      setSlotDurationMinutes(60);
      setDefaultHourlyPrice(120);
      setDefaultNightPrice(150);
    } else if (act === 'padel') {
      setBookingType('time_slot');
      setCapacity(1);
      setSlotDurationMinutes(90);
      setDefaultHourlyPrice(300);
      setDefaultNightPrice(380);
    } else {
      setBookingType('time_slot');
      setCapacity(1);
      setSlotDurationMinutes(60);
      setDefaultHourlyPrice(200);
      setDefaultNightPrice(250);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('يرجى كتابة اسم المنشأة أو الملعب', 'error');
      return;
    }

    setLoading(true);
    try {
      const amenities = amenitiesStr
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        venueId,
        activityType,
        subType: subType.trim(),
        bookingType,
        capacity: bookingType === 'session' ? (parseInt(capacity, 10) || 20) : 1,
        slotDurationMinutes: parseInt(slotDurationMinutes, 10) || 60,
        defaultHourlyPrice: parseFloat(defaultHourlyPrice) || 200,
        defaultDayPrice: parseFloat(defaultHourlyPrice) || 200,
        defaultNightPrice: parseFloat(defaultNightPrice) || parseFloat(defaultHourlyPrice) || 250,
        operatingHours: { open: openTime, close: closeTime },
        amenities,
        description: description.trim(),
      };

      const url = isEditing
        ? `/facilities/${facility._id || facility.id}`
        : `/facilities`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast(isEditing ? 'تم تحديث المنشأة بنجاح' : 'تم إضافة المنشأة الجديدة بنجاح', 'success');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'حدث خطأ في حفظ بيانات المنشأة', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل بيانات المنشأة / الملعب' : 'إضافة منشأة أو ملعب جديد'}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Input
          label="اسم المنشأة أو الملعب *"
          placeholder="مثال: ملعب بادل رقم 1 (بانورامي) أو مسبح سنترينو"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              نوع الرياضة / النشاط *
            </label>
            <select
              value={activityType}
              onChange={(e) => handleActivityChange(e.target.value)}
              className="input-field"
              required
            >
              {ACTIVITIES.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.icon} {act.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="النوع الفرعي (اختياري)"
            placeholder="مثال: خماسي 5v5، بانورامي، أولمبي، صلب"
            value={subType}
            onChange={(e) => setSubType(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              نظام وطريقة الحجز *
            </label>
            <select
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value)}
              className="input-field"
            >
              <option value="time_slot">حجز ملعب كامل (بالساعة)</option>
              <option value="session">نظام جلسات بعدد أفراد (سباحة / لياقة)</option>
            </select>
          </div>

          {bookingType === 'session' ? (
            <Input
              label="السعة القصوى للجلسة (عدد الأفراد)"
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          ) : (
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                مدة الفترة (بالدقائق)
              </label>
              <select
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                className="input-field"
              >
                <option value={60}>60 دقيقة (ساعة كاملة)</option>
                <option value={90}>90 دقيقة (ساعة ونصف - بادل)</option>
                <option value={120}>120 دقيقة (ساعتان)</option>
              </select>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <Input
            label={bookingType === 'session' ? 'سعر الجلسة للفرد (نهاري) *' : 'سعر الساعة الافتراضي (نهاري) *'}
            type="number"
            min="0"
            value={defaultHourlyPrice}
            onChange={(e) => setDefaultHourlyPrice(e.target.value)}
            required
          />

          <Input
            label={bookingType === 'session' ? 'سعر الجلسة للفرد (مسائي)' : 'سعر الساعة المسائي (ساعات الذروة)'}
            type="number"
            min="0"
            value={defaultNightPrice}
            onChange={(e) => setDefaultNightPrice(e.target.value)}
          />
        </div>

        {/* Operating hours */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <Input
            label="وقت الفتح اليومي"
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            required
          />

          <Input
            label="وقت الإغلاق"
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            required
          />
        </div>

        <Input
          label="المرافق والمميزات (افصل بينها بفاصلة)"
          placeholder="مثال: إضاءة LED، كرات مجانية، غرف تبديل، مياه ساخنة"
          value={amenitiesStr}
          onChange={(e) => setAmenitiesStr(e.target.value)}
        />

        <Textarea
          label="وصف المنشأة"
          placeholder="اكتب نبذة عن الملعب، نوع الأرضية، أو تجهيزات الأنشطة..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button variant="primary" type="submit" loading={loading} icon={CheckCircle2}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة المنشأة الآن'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

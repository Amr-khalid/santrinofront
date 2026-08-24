'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from '@/components/booking/DatePicker';
import TimeSlotGrid from '@/components/booking/TimeSlotGrid';
import BookingModal from '@/components/booking/BookingModal';
import BookingSuccessModal from '@/components/booking/BookingSuccessModal';
import AuthRequiredModal from '@/components/booking/AuthRequiredModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDateArabic, formatSlotRange12h, generateDefaultSlots } from '@/lib/utils';
import { CheckCircle2, Calendar, MousePointerClick, RefreshCw, ChevronDown, HelpCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [field, setField] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isStepsOpen, setIsStepsOpen] = useState(false);

  // How to book 3-step guide
  const bookingSteps = [
    {
      id: 1,
      title: '1. اختر التاريخ والوقت',
      desc: 'تصفح جدول المواعيد المتاحة أدناه واضغط على الساعات المناسبة لك.',
      icon: Calendar,
    },
    {
      id: 2,
      title: '2. أدخل بياناتك أو سجل الدخول',
      desc: 'سجل برقم هاتفك واسمك لتثبيت الموعد واستلام تفاصيل الحجز.',
      icon: MousePointerClick,
    },
    {
      id: 3,
      title: '3. تأكيد فوري ودفع كاش',
      desc: 'احصل على رمز الحجز فوراً وادفع المبلغ نقداً عند حضورك للملعب.',
      icon: CheckCircle2,
    },
  ];

  // Multi-slot selection state
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthRequiredOpen, setIsAuthRequiredOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Load Primary Field details
  useEffect(() => {
    const fetchField = async () => {
      try {
        const res = await apiRequest('/fields/primary');
        if (res.success && res.data) {
          setField(res.data);
        }
      } catch (err) {
        console.error('Failed to load primary field:', err);
      }
    };
    fetchField();
  }, []);

  // Fetch Slots for Selected Date
  const fetchSlots = useCallback(async (date) => {
    setSlotsLoading(true);
    try {
      const res = await apiRequest(`/bookings/available?date=${date}`);
      if (res.success && res.data && res.data.slots && res.data.slots.length > 0) {
        setSlots(res.data.slots);
        if (res.data.field) {
          setField((prev) => ({ ...prev, ...res.data.field }));
        }
      } else {
        setSlots(generateDefaultSlots(date));
      }
    } catch (err) {
      console.error('Failed to load slots, using fallback:', err);
      setSlots(generateDefaultSlots(date));
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(selectedDate);
    setSelectedSlots([]);
  }, [selectedDate, fetchSlots]);

  // Toggle slot selection
  const handleToggleSlot = (slot) => {
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.startTime === slot.startTime);
      if (exists) {
        return prev.filter((s) => s.startTime !== slot.startTime);
      } else {
        const updated = [...prev, slot];
        return updated.sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
    });
  };

  const handleSelectRange = (rangeSlots) => {
    setSelectedSlots(rangeSlots);
  };

  const handleClearSelection = () => {
    setSelectedSlots([]);
  };

  const handleBookingSuccess = (newBooking) => {
    setConfirmedBooking(newBooking);
    setIsSuccessOpen(true);
    setSelectedSlots([]);
    fetchSlots(selectedDate);
  };

  const handleConfirmBookingClick = () => {
    if (!user) {
      setIsAuthRequiredOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const totalSelectedPrice = selectedSlots.reduce((sum, s) => sum + (s.price || 0), 0);
  const sortedSelected = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="homepage-wrapper">
      <div className="container" style={{ maxWidth: '980px' }}>
        {/* Collapsible 3 Step Guide Card */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Card padding="md" style={{ transition: 'var(--transition-normal)' }}>
            <button
              type="button"
              onClick={() => setIsStepsOpen((prev) => !prev)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: isStepsOpen ? 'var(--space-3)' : 0,
                marginBottom: isStepsOpen ? 'var(--space-3)' : 0,
                borderBottom: isStepsOpen ? '1px solid var(--border-subtle)' : 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'inherit',
                color: 'inherit',
              }}
              aria-expanded={isStepsOpen}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  كيف تحجز ملعبك؟
                </span>
              </div>

              <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isStepsOpen ? 'إخفاء' : 'عرض التفاصيل'}
                </span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isStepsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform var(--transition-normal)',
                    color: 'var(--text-secondary)',
                  }}
                />
              </div>
            </button>

            {isStepsOpen && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  paddingTop: 'var(--space-2)',
                  animation: 'slideDown 0.2s ease-out',
                }}
              >
                {bookingSteps.map((step) => {
                  const IconComp = step.icon;
                  return (
                    <div key={step.id} className="step-item">
                      <div className="step-icon-wrapper">
                        <IconComp size={16} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {step.title}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>



        {/* Main Schedule Hub */}
        <section id="booking-schedule">
          <Card padding="lg">
            <div
              className="flex justify-between items-center"
              style={{
                marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-3)',
                borderBottom: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  جدول المواعيد المتاحة
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '2px' }}>
                  {formatDateArabic(selectedDate)} — حدد الساعات المطلوبة للحجز
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSlots(selectedDate)}
                disabled={slotsLoading}
                icon={RefreshCw}
              >
                {slotsLoading ? 'جاري التحديث...' : 'تحديث'}
              </Button>
            </div>

            {/* Date Picker Component */}
            <DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />

            {/* Time Slots Grid Component */}
            <TimeSlotGrid
              slots={slots}
              selectedSlots={selectedSlots}
              onSelectSlot={handleToggleSlot}
              onSelectRange={handleSelectRange}
              onClearSelection={handleClearSelection}
              loading={slotsLoading}
            />
          </Card>
        </section>
      </div>


      {/* Sticky Mobile Floating Action Bar */}
      {selectedSlots.length > 0 && (
        <div className="floating-action-bar">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
              تم تحديد ({selectedSlots.length}) {selectedSlots.length === 1 ? 'ساعة' : selectedSlots.length === 2 ? 'ساعتان' : 'ساعات'}
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedSlots.length === 1
                ? formatSlotRange12h(sortedSelected[0].startTime, sortedSelected[0].endTime)
                : `${formatSlotRange12h(sortedSelected[0].startTime, sortedSelected[sortedSelected.length - 1].endTime)}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearSelection}
              className="btn btn-outline btn-sm"
            >
              إلغاء
            </button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmBookingClick}
            >
              تأكيد الحجز ({formatCurrency(totalSelectedPrice)})
            </Button>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal */}
      <AuthRequiredModal
        isOpen={isAuthRequiredOpen}
        onClose={() => setIsAuthRequiredOpen(false)}
      />

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slots={selectedSlots}
        dateString={selectedDate}
        field={field}
        onSuccess={handleBookingSuccess}
      />

      {/* Booking Success Modal */}
      <BookingSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        booking={confirmedBooking}
        field={field}
      />
    </div>
  );
}



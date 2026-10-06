'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { ACTIVITIES, getActivityMeta } from '@/lib/activities';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import DatePicker from '@/components/booking/DatePicker';
import TimeSlotGrid from '@/components/booking/TimeSlotGrid';
import BookingModal from '@/components/booking/BookingModal';
import DigitalTicketModal from '@/components/booking/DigitalTicketModal';
import AuthRequiredModal from '@/components/booking/AuthRequiredModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDateArabic, formatSlotRange12h } from '@/lib/utils';
import {
  MapPin,
  Phone,
  Star,
  ExternalLink,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params?.id;
  const { user } = useAuth();
  const { showToast } = useToast();

  const [venue, setVenue] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  // Date and slot booking state
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // 1. Fetch Venue and its facilities
  useEffect(() => {
    const fetchVenue = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/venues/${venueId}`);
        if (res.success && res.data) {
          setVenue(res.data);
          const facList = res.data.facilities || [];
          setFacilities(facList);
          if (facList.length > 0) {
            setSelectedFacility(facList[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load venue:', err);
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      fetchVenue();
    }
  }, [venueId]);

  // 2. Fetch Availability Slots for the selected facility & date
  const fetchFacilitySlots = useCallback(async (facilityId, date) => {
    if (!facilityId) return;
    setSlotsLoading(true);
    try {
      const res = await apiRequest(`/facilities/${facilityId}/availability?date=${date}`);
      if (res.success && res.data && res.data.slots) {
        setSlots(res.data.slots);
      } else {
        // Fallback / legacy bookings endpoint
        const legacyRes = await apiRequest(`/bookings/available?date=${date}&facilityId=${facilityId}`);
        if (legacyRes.success && legacyRes.data?.slots) {
          setSlots(legacyRes.data.slots);
        }
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      fetchFacilitySlots(selectedFacility._id || selectedFacility.id, selectedDate);
      setSelectedSlots([]);
    }
  }, [selectedFacility, selectedDate, fetchFacilitySlots]);

  // Handle slot selection
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

  const handleBookingClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (bookingData) => {
    setConfirmedBooking(bookingData);
    setIsTicketModalOpen(true);
    setSelectedSlots([]);
    if (selectedFacility) {
      fetchFacilitySlots(selectedFacility._id || selectedFacility.id, selectedDate);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <Loader text="بنجهّز بيانات الملعب والمواعيد... ثواني" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', textAlign: 'center' }}>
        <h2>الملعب ده مش موجود أو اتمسح</h2>
        <Link href="/venues" style={{ marginTop: 'var(--space-4)', display: 'inline-block' }}>
          <Button variant="primary">ارجع لدليل الملاعب</Button>
        </Link>
      </div>
    );
  }

  // Filter facilities by activity
  const filteredFacilities =
    selectedActivity === 'all'
      ? facilities
      : facilities.filter((f) => f.activityType === selectedActivity);

  const availableActivityTypes = Array.from(new Set(facilities.map((f) => f.activityType)));
  const totalSelectedPrice = selectedSlots.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <div className="container" style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '1080px' }}>
      {/* Back Link */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link
          href="/venues"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          <ArrowRight size={16} />
          <span>ارجع لكل الملاعب</span>
        </Link>
      </div>

      {/* Venue Header Card */}
      <Card padding="none" style={{ overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
        {/* Photos Banner */}
        <div style={{ position: 'relative', height: '260px', background: '#1a1a1a' }}>
          <img
            src={(venue.images && venue.images[0]) || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80'}
            alt={venue.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(0,0,0,0.75)',
              color: '#F59E0B',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Star size={16} fill="#F59E0B" />
            <span>{venue.rating || 4.9}</span>
            <span style={{ color: '#ccc', fontSize: '0.8125rem' }}>({venue.reviewCount || 45} تقييم)</span>
          </div>
        </div>

        {/* Venue Info Body */}
        <div style={{ padding: 'var(--space-6)' }}>
          <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {venue.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 'var(--space-2) 0', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                {venue.description || venue.shortDescription}
              </p>
            </div>

            {venue.phone && (
              <a
                href={`tel:${venue.phone}`}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Phone size={14} style={{ color: 'var(--primary)' }} />
                <span dir="ltr">{venue.phone}</span>
              </a>
            )}
          </div>

          {/* Location & Map */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>
            <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>{venue.location?.address} — {venue.location?.city}</span>
            {venue.location?.mapUrl && (
              <a
                href={venue.location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '2px', marginRight: '6px' }}
              >
                <span>اللوكيشن ع الخريطة</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Amenities Pills */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'var(--space-4)' }}>
              {venue.amenities.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1.5px solid var(--sketch-line)',
                    boxShadow: '1.5px 1.5px 0px var(--sketch-shadow)',
                    padding: '4px 10px',
                    borderRadius: '255px 10px 225px 10px / 10px 225px 10px 255px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Facilities Selection Section */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            اختار الصالة أو الملعب
          </h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            ({facilities.length} ملاعب وصالات متاحة)
          </span>
        </div>

        {/* Activity Filter Tabs */}
        {availableActivityTypes.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: 'var(--space-4)', paddingBottom: '4px' }}>
            <button
              type="button"
              onClick={() => setSelectedActivity('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: selectedActivity === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: selectedActivity === 'all' ? 'var(--primary)' : 'var(--bg-surface)',
                color: selectedActivity === 'all' ? '#fff' : 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              الكل ({facilities.length})
            </button>

            {availableActivityTypes.map((actId) => {
              const meta = getActivityMeta(actId);
              const count = facilities.filter((f) => f.activityType === actId).length;
              const isSelected = selectedActivity === actId;
              return (
                <button
                  key={actId}
                  type="button"
                  onClick={() => setSelectedActivity(actId)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.name} ({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Facilities Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
          {filteredFacilities.map((fac) => {
            const isSelected = selectedFacility?._id === fac._id || selectedFacility?.id === fac.id;
            const meta = getActivityMeta(fac.activityType);
            const isSession = fac.bookingType === 'session';

            return (
              <div
                key={fac._id || fac.id}
                onClick={() => setSelectedFacility(fac)}
                style={{
                  background: isSelected ? 'var(--sketch-active-bg)' : 'var(--bg-surface)',
                  border: isSelected ? '2px solid var(--sketch-line)' : '1.5px solid var(--sketch-line)',
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  boxShadow: isSelected ? '3px 3px 0px var(--primary)' : '2px 2px 0px var(--sketch-shadow)',
                  padding: 'var(--space-4)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{meta.icon}</span>
                  <Badge variant={isSelected ? 'primary' : 'neutral'}>
                    {isSession ? 'حجز أفراد' : 'حجز الملعب بالكامل'}
                  </Badge>
                </div>

                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {fac.name}
                </h4>

                <p style={{ margin: '0 0 var(--space-3)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {fac.subType ? `النوع: ${fac.subType} • ` : ''}
                  {isSession ? `سعة الجلسة: ${fac.capacity} أفراد` : `مدة الحجز: ${fac.slotDurationMinutes || 60} دقيقة`}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isSession ? 'سعر الفرد:' : 'سعر الساعة:'}
                  </span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.9375rem' }}>
                    {formatCurrency(fac.defaultDayPrice || fac.defaultHourlyPrice || 200)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Availability & Booking Section for Selected Facility */}
      {selectedFacility && (
        <Card padding="lg" style={{ marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>{getActivityMeta(selectedFacility.activityType).icon}</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  مواعيد: {selectedFacility.name}
                </h3>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {selectedFacility.bookingType === 'session'
                  ? 'اختار ميعاد الجلسة اللي يناسبك وحدد عدد الأفراد اللي جايين معاك'
                  : 'دوس على الساعات اللي تناسبك عشان تحجزها في ثواني'}
              </p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                {selectedFacility.bookingType === 'session' ? 'سعر الجلسة للفرد' : 'سعر الساعة'}
              </span>
              <strong style={{ fontSize: '1.125rem', color: 'var(--primary)', fontWeight: 800 }}>
                {formatCurrency(selectedFacility.defaultDayPrice || selectedFacility.defaultHourlyPrice)}
              </strong>
            </div>
          </div>

          {/* Date Picker */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>

          {/* Time Slot Grid */}
          <TimeSlotGrid
            slots={slots}
            selectedSlots={selectedSlots}
            facility={selectedFacility}
            onSelectSlot={handleToggleSlot}
            onSelectRange={handleSelectRange}
            onClearSelection={handleClearSelection}
            loading={slotsLoading}
          />

          {/* Selected Booking Sticky Bar */}
          {selectedSlots.length > 0 && (
            <div
              style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-4)',
                background: 'var(--bg-surface-raised)',
                border: '2px solid var(--sketch-line)',
                borderRadius: '255px 14px 225px 14px / 14px 225px 14px 255px',
                boxShadow: '3px 3px 0px var(--sketch-shadow)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  المواعيد اللي اخترتها ({selectedSlots.length} فترات):
                </span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                  {formatSlotRange12h(selectedSlots[0]?.startTime, selectedSlots[selectedSlots.length - 1]?.endTime)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>الإجمالي</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>
                    {formatCurrency(totalSelectedPrice)}
                  </strong>
                </div>

                <Button variant="primary" size="md" onClick={handleBookingClick} icon={CheckCircle2}>
                  كمّل الحجز دلوقتي
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        slots={selectedSlots}
        dateString={selectedDate}
        facility={selectedFacility}
        venue={venue}
        onSuccess={handleBookingSuccess}
      />

      {/* Digital Ticket Modal */}
      <DigitalTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={confirmedBooking}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

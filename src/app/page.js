'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { ACTIVITIES, CITIES, getActivityMeta } from '@/lib/activities';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Compass,
  ArrowLeft,
  ChevronLeft,
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  PhoneCall,
  SlidersHorizontal,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch Venues
  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedSport && selectedSport !== 'all') {
          queryParams.append('activity', selectedSport);
        }
        if (selectedCity && selectedCity !== 'all' && selectedCity !== 'كل المدن والمناطق') {
          queryParams.append('city', selectedCity);
        }
        if (searchQuery.trim()) {
          queryParams.append('search', searchQuery.trim());
        }

        const res = await apiRequest(`/venues?${queryParams.toString()}`);
        if (res.success && res.data) {
          setVenues(res.data);
        }
      } catch (err) {
        console.error('Failed to load venues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [selectedSport, selectedCity, searchQuery]);

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedSport !== 'all') query.append('activity', selectedSport);
    if (selectedCity !== 'all') query.append('city', selectedCity);
    if (searchQuery) query.append('search', searchQuery);
    router.push(`/venues?${query.toString()}`);
  };

  // Collect all available facilities from venues for the "Activities Near You" section
  const allFacilities = venues.flatMap((v) =>
    (v.facilities || []).map((f) => ({
      ...f,
      venueName: v.name,
      venueCity: v.location?.city,
      venueAddress: v.location?.address,
      venueId: v._id || v.id || v.slug,
      venueRating: v.rating || 4.8,
    }))
  );

  return (
    <div className="homepage-wrapper">
      {/* 1. HERO SECTION: Find Your Activity */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(13, 107, 79, 0.12) 0%, var(--bg-surface) 75%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: 'var(--space-10) var(--space-4) var(--space-8)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              margin: '0 0 var(--space-3)',
              letterSpacing: '-0.02em',
            }}
          >
            احجز ملعبك ولعبتك المفضلة في ثواني
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto var(--space-6)',
              lineHeight: 1.6,
            }}
          >
            بادل، كورة، تنس، سباحة، وجيم. شوف الملاعب اللي حواليك، اعرف الأسعار، واحجز ميعادك في ثانية.. والدفع كاش في الملعب من غير وجع دماغ!
          </p>

          {/* Universal Search Bar */}
          <form
            onSubmit={handleHeroSearchSubmit}
            style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--sketch-line)',
              borderRadius: '255px 18px 225px 18px / 18px 225px 18px 255px',
              padding: 'var(--space-2)',
              boxShadow: '4px 4px 0px var(--sketch-shadow)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-2)',
              alignItems: 'center',
            }}
          >
            {/* Activity Selector */}
            <div style={{ padding: '0 var(--space-2)', textAlign: 'right' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                بتلعب إيه؟
              </label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all">🏆 كل الرياضات</option>
                {ACTIVITIES.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.icon} {act.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Selector */}
            <div style={{ padding: '0 var(--space-2)', borderRight: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                فين مكانك؟
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {CITIES.map((city) => (
                  <option key={city} value={city === 'كل المدن والمناطق' ? 'all' : city}>
                    📍 {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div style={{ padding: '0 var(--space-2)', borderRight: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                عايز تحجز إمتى؟
              </label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBookingDate(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            {/* Search Submit Button */}
            <div>
              <Button
                variant="primary"
                type="submit"
                style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 700 }}
                icon={Search}
              >
                يلا بينا ندور
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. ACTIVITY CATEGORIES STRIP */}
      <section style={{ padding: 'var(--space-6) 0', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              اختار الرياضة اللي على مزاجك
            </h2>
            {selectedSport !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedSport('all')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                كل الرياضات ✕
              </button>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
              gap: 'var(--space-2)',
            }}
          >
            {ACTIVITIES.map((act) => {
              const isSelected = selectedSport === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setSelectedSport(isSelected ? 'all' : act.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-3) var(--space-2)',
                    background: isSelected ? 'var(--sketch-active-bg)' : 'var(--bg-surface)',
                    border: isSelected ? '2px solid var(--primary)' : '2px solid var(--sketch-line)',
                    borderRadius: '255px 14px 225px 14px / 14px 225px 14px 255px',
                    boxShadow: isSelected ? '3.5px 3.5px 0px var(--primary)' : '2.5px 2.5px 0px var(--sketch-shadow)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    textAlign: 'center',
                    transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{act.icon}</span>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 800 : 700,
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      lineHeight: 1.2,
                    }}
                  >
                    {act.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. POPULAR VENUES SECTION */}
      <section style={{ padding: 'var(--space-8) 0' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={18} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  أجمد الملاعب والأندية اللي حواليك
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
                ملاعب معتمدة ومضمونة 100% وبأعلى تقييمات من اللعيبة
              </p>
            </div>

            <Link href="/venues" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" icon={ChevronLeft}>
                شوف كل الملاعب ({venues.length})
              </Button>
            </Link>
          </div>

          {loading ? (
            <Loader text="بنجهزلك الملاعب..." />
          ) : venues.length === 0 ? (
            <div className="empty-state">
              <Compass size={36} style={{ color: 'var(--text-muted)' }} />
              <h3>ملقناش ملاعب مطابقة</h3>
              <p style={{ color: 'var(--text-secondary)' }}>جرّب تختار رياضة تانية أو منطقة تانية</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--space-6)',
              }}
            >
              {venues.slice(0, 6).map((venue) => {
                const cover =
                  (venue.images && venue.images[0]) ||
                  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80';
                const acts = venue.availableActivities || venue.activities || [];

                return (
                  <Card
                    key={venue._id || venue.id}
                    padding="none"
                    style={{
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                    }}
                  >
                    {/* Cover photo */}
                    <div style={{ position: 'relative', height: '180px', background: '#222' }}>
                      <img
                        src={cover}
                        alt={venue.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: 'rgba(0,0,0,0.75)',
                          color: '#F59E0B',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <Star size={13} fill="#F59E0B" />
                        <span>{venue.rating || 4.9}</span>
                        <span style={{ color: '#ccc', fontSize: '0.75rem' }}>({venue.reviewCount || 36})</span>
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {venue.facilitiesCount || venue.facilities?.length || 1} ملاعب ومنشآت
                      </div>
                    </div>

                    {/* Venue Body */}
                    <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.4 }}>
                        {venue.name}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: 'var(--space-3)' }}>
                        <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {venue.location?.address || venue.location?.city}
                        </span>
                      </div>

                      {/* Activities badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--space-4)' }}>
                        {acts.map((actId) => {
                          const meta = getActivityMeta(actId);
                          return (
                            <span
                              key={actId}
                              style={{
                                background: 'var(--bg-surface-raised)',
                                border: '1px solid var(--border-subtle)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-xs)',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: 'var(--text-primary)',
                              }}
                            >
                              <span>{meta.icon}</span>
                              <span>{meta.name}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Price & Booking Button */}
                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: 'var(--space-3)',
                          borderTop: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                            من أول
                          </span>
                          <strong style={{ fontSize: '1.0625rem', color: 'var(--primary)', fontWeight: 800 }}>
                            {formatCurrency(venue.startingPrice || 150)}
                          </strong>
                        </div>

                        <Link href={`/venues/${venue._id || venue.id || venue.slug}`}>
                          <Button variant="primary" size="sm" icon={ArrowLeft}>
                            احجز دلوقتي
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. ACTIVITIES & FACILITIES NEAR YOU */}
      {allFacilities.length > 0 && (
        <section style={{ padding: 'var(--space-8) 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container" style={{ maxWidth: '1100px' }}>
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={18} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  ملاعب وفترات فاضية دلوقتي
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
                نقي ملعبك أو حصتك واحجز في ثواني
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {allFacilities.slice(0, 8).map((fac) => {
                const meta = getActivityMeta(fac.activityType);
                const isSession = fac.bookingType === 'session';

                return (
                  <Card key={fac._id || fac.id} padding="md" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontSize: '1.5rem' }}>{meta.icon}</span>
                      <Badge variant="neutral">
                        {isSession ? 'جلسة أفراد' : 'ملعب بالساعة'}
                      </Badge>
                    </div>

                    <h4 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {fac.name}
                    </h4>

                    <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                      {fac.venueName}
                    </span>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 var(--space-3)' }}>
                      📍 {fac.venueCity || fac.venueAddress}
                    </p>

                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: 'var(--space-3)',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          {isSession ? 'سعر الجلسة' : 'سعر الساعة'}
                        </span>
                        <strong style={{ color: 'var(--primary)', fontSize: '0.9375rem', fontWeight: 800 }}>
                          {formatCurrency(fac.defaultDayPrice || fac.defaultHourlyPrice || 200)}
                        </strong>
                      </div>

                      <Link href={`/venues/${fac.venueId}`}>
                        <Button variant="outline" size="sm">
                          حجز الموعد
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. HOW IT WORKS (3 STEPS) */}
      <section style={{ padding: 'var(--space-10) 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '960px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            إزاي تحجز في 3 خطوات بس؟
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 'var(--space-8)' }}>
            من غير رغي مكالمات ومن غير ما تدفع مليم مقدماً.. الحجز فوري والدفع كاش في الملعب!
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-6)',
              textAlign: 'right',
            }}
          >
            {/* Step 1 */}
            <Card padding="lg">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#0D6B4F15',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  marginBottom: 'var(--space-3)',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 var(--space-2)', color: 'var(--text-primary)' }}>
                1. اختار لعبتك وملعبك
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                شوف ملاعب البادل، الكورة، التنس، أو حصص السباحة الأقرب ليك، اتفرج على الصور والأسعار ومواصفات الملعب بكل وضوح.
              </p>
            </Card>

            {/* Step 2 */}
            <Card padding="lg">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#0D6B4F15',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  marginBottom: 'var(--space-3)',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 var(--space-2)', color: 'var(--text-primary)' }}>
                2. نقي الميعاد اللي يريحك
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                بص في جدول المواعيد الفاضية، اختار ساعتك، وميعادك هيتقفل ويتسجل ليك فوراً من غير أي دفع مسبق.
              </p>
            </Card>

            {/* Step 3 */}
            <Card padding="lg">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#0D6B4F15',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  marginBottom: 'var(--space-3)',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 var(--space-2)', color: 'var(--text-primary)' }}>
                3. خد تذكرتك وادفع كاش هناك
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                هتاخد تذكرتك الرقمية بالـ QR Code وموقع الملعب على طول، تروح في ميعادك وتدفع كاش لصاحب الملعب!
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. OWNER CALL TO ACTION BANNER */}
      <section style={{ padding: '0 0 var(--space-10)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0D6B4F 0%, #074734 100%)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8) var(--space-6)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ maxWidth: '580px' }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'inline-block',
                  marginBottom: 'var(--space-2)',
                }}
              >
                لأصحاب الملاعب والأندية الرياضية
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 var(--space-2)', color: '#fff' }}>
                عندك ملعب أو نادي؟ سجّل معانا وزوّد حجوزاتك!
              </h2>
              <p style={{ margin: 0, fontSize: '0.9375rem', opacity: 0.9, lineHeight: 1.5 }}>
                نظّم كل ملاعبك (بادل، كورة، تنس، سباحة) من لوحة تحكم واحدة، حدد مواعيدك وأسعارك وريّح دماغك من لخبطة المواعيد والمكالمات.
              </p>
            </div>

            <div>
              <Link href="/auth/register?role=owner">
                <Button
                  style={{
                    background: '#FFFFFF',
                    color: '#0D6B4F',
                    fontWeight: 800,
                    fontSize: '1rem',
                    padding: 'var(--space-3) var(--space-5)',
                  }}
                  icon={ArrowLeft}
                >
                  سجّل ناديك دلوقتي ببلاش
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

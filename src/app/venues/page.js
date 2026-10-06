'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Star,
  Compass,
  Filter,
  ArrowLeft,
  Calendar,
  Sparkles,
  Phone,
} from 'lucide-react';

function VenuesContent() {
  const searchParams = useSearchParams();
  const initialActivity = searchParams.get('activity') || 'all';
  const initialCity = searchParams.get('city') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(initialActivity);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedActivity && selectedActivity !== 'all') {
          queryParams.append('activity', selectedActivity);
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
        console.error('Failed to fetch venues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [selectedActivity, selectedCity, searchQuery]);

  return (
    <div className="container" style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '1140px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: 'var(--space-8) var(--space-6)',
          borderRadius: '255px 18px 225px 18px / 18px 225px 18px 255px',
          border: '2px solid var(--sketch-line)',
          boxShadow: '4px 4px 0px var(--sketch-shadow)',
          marginBottom: 'var(--space-6)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--sketch-active-bg)',
            color: 'var(--primary)',
            padding: '4px 14px',
            borderRadius: '255px 8px 225px 8px / 8px 225px 8px 255px',
            border: '1.5px solid var(--sketch-line)',
            boxShadow: '1.5px 1.5px 0px var(--sketch-shadow)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: 'var(--space-2)',
          }}
        >
          <Compass size={14} />
          دليل الملاعب والصالات الرياضية
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 'var(--space-2) 0' }}>
          اكتشف أحسن الملاعب والنوادي حواليك
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem' }}>
          شوف ملاعب الكورة، البادل، التنس، والصالات القريبة منك في منطقتك. احجز ميعادك في ثواني وادفع كاش في الملعب لما تروح.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: 'var(--space-4)',
          borderRadius: '255px 16px 225px 16px / 16px 225px 16px 255px',
          border: '2px solid var(--sketch-line)',
          boxShadow: '4px 4px 0px var(--sketch-shadow)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="اكتب اسم الملعب أو منطقتك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingRight: '36px' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
          </div>

          {/* City Selector */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-field"
            >
              {CITIES.map((c) => (
                <option key={c} value={c === 'كل المدن والمناطق' ? 'all' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity Chips Scroll */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedActivity('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '255px 25px 225px 25px / 25px 225px 25px 255px',
              border: '2px solid var(--sketch-line)',
              boxShadow: selectedActivity === 'all' ? '3px 3px 0px var(--primary)' : '2px 2px 0px var(--sketch-shadow)',
              background: selectedActivity === 'all' ? 'var(--primary)' : 'var(--bg-surface-raised)',
              color: selectedActivity === 'all' ? '#fff' : 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transform: selectedActivity === 'all' ? 'translate(-1px, -1px)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🏆 كل الرياضات
          </button>

          {ACTIVITIES.map((act) => {
            const isSelected = selectedActivity === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedActivity(act.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '255px 25px 225px 25px / 25px 225px 25px 255px',
                  border: '2px solid var(--sketch-line)',
                  boxShadow: isSelected ? '3px 3px 0px var(--primary)' : '2px 2px 0px var(--sketch-shadow)',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-surface-raised)',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{act.icon}</span>
                <span>{act.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <Loader text="بنحمّل الملاعب... ثواني" />
      ) : venues.length === 0 ? (
        <div className="empty-state">
          <Compass size={36} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-2)' }} />
          <h3>ملقناش أي ملعب بالاسم ده!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            جرب تختار رياضة تانية أو تشيل الفلاتر عشان تشوف كل الملاعب
          </p>
          <Button
            variant="outline"
            size="sm"
            style={{ marginTop: 'var(--space-3)' }}
            onClick={() => {
              setSelectedActivity('all');
              setSelectedCity('all');
              setSearchQuery('');
            }}
          >
            امسح كل الفلاتر
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {venues.map((venue) => {
            const coverImage =
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
                {/* Image Cover */}
                <div style={{ position: 'relative', height: '190px', background: '#222' }}>
                  <img
                    src={coverImage}
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
                    <span>{venue.rating || 4.8}</span>
                    <span style={{ color: '#ccc', fontSize: '0.75rem' }}>({venue.reviewCount || 24})</span>
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
                    {venue.facilitiesCount || venue.facilities?.length || 1} ملاعب وصالات
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: '0 0 var(--space-1)',
                      lineHeight: 1.4,
                    }}
                  >
                    {venue.name}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {venue.location?.address || venue.location?.city}
                    </span>
                  </div>

                  {/* Activities Chips */}
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

                  {/* Price & Action Button */}
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
                        الأسعار بتبدأ من
                      </span>
                      <strong style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 800 }}>
                        {formatCurrency(venue.startingPrice || 150)}
                      </strong>
                    </div>

                    <Link href={`/venues/${venue._id || venue.id || venue.slug}`}>
                      <Button variant="primary" size="sm" icon={ArrowLeft}>
                        احجز ميعادك دلوقتي
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
  );
}

export default function VenuesExplorePage() {
  return (
    <Suspense fallback={<Loader text="بنجهّز دليل الملاعب... ثواني" />}>
      <VenuesContent />
    </Suspense>
  );
}


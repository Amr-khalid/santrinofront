import { MOCK_VENUES, generateMockSlotsForFacility } from './mockData';
import { ACTIVITIES } from './activities';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Universal Fetch wrapper with auth header and intelligent fallback
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('santrino_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If 404 on newer endpoints, route to mock handler
      if (response.status === 404 && shouldFallback(endpoint)) {
        return getFallbackData(endpoint, options);
      }

      const errorMessage = data.message || `خطأ في الاتصال: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If network error / failed to fetch, check if we have fallback data
    if (shouldFallback(endpoint)) {
      console.warn(`[API Fallback] Network request failed for ${endpoint}, using resilient local data:`, err.message);
      return getFallbackData(endpoint, options);
    }
    throw err;
  }
}

/**
 * Check if endpoint has fallback mock handling
 */
function shouldFallback(endpoint) {
  return (
    endpoint.includes('/venues') ||
    endpoint.includes('/facilities') ||
    endpoint.includes('/activities') ||
    endpoint.includes('/fields/primary') ||
    endpoint.includes('/bookings/available') ||
    endpoint.includes('/dashboard/stats') ||
    endpoint.includes('/dashboard/bookings')
  );
}

/**
 * Return simulated fallback responses for offline or local preview
 */
function getFallbackData(endpoint, options = {}) {
  // GET /venues
  if (endpoint.startsWith('/venues') && (!options.method || options.method === 'GET')) {
    // If specific ID: /venues/:id
    const parts = endpoint.split('?')[0].split('/');
    if (parts.length >= 3 && parts[2]) {
      const idOrSlug = parts[2];
      const found =
        MOCK_VENUES.find((v) => v._id === idOrSlug || v.id === idOrSlug || v.slug === idOrSlug) ||
        MOCK_VENUES[0];
      return { success: true, data: found };
    }

    return {
      success: true,
      data: MOCK_VENUES,
      count: MOCK_VENUES.length,
    };
  }

  // GET /facilities/:id/availability
  if (endpoint.includes('/facilities/') && endpoint.includes('/availability')) {
    const parts = endpoint.split('?')[0].split('/');
    const facId = parts[2];
    const allFacs = MOCK_VENUES.flatMap((v) => v.facilities);
    const fac = allFacs.find((f) => f._id === facId || f.id === facId) || allFacs[0];
    const todayStr = new Date().toISOString().split('T')[0];

    return {
      success: true,
      data: {
        facility: fac,
        dateString: todayStr,
        slots: generateMockSlotsForFacility(fac, todayStr),
      },
    };
  }

  // GET /activities
  if (endpoint.startsWith('/activities')) {
    return {
      success: true,
      data: ACTIVITIES,
    };
  }

  // GET /fields/primary
  if (endpoint.includes('/fields/primary')) {
    const primaryVenue = MOCK_VENUES[0];
    const primaryFacility = primaryVenue.facilities[0];
    return {
      success: true,
      data: {
        _id: primaryFacility._id,
        id: primaryFacility._id,
        name: `${primaryVenue.name} — ${primaryFacility.name}`,
        location: primaryVenue.location,
        defaultHourlyPrice: primaryFacility.defaultHourlyPrice,
        operatingHours: primaryFacility.operatingHours,
        amenities: primaryVenue.amenities,
        images: primaryVenue.images,
        venue: primaryVenue,
        facility: primaryFacility,
      },
    };
  }

  // GET /bookings/available
  if (endpoint.startsWith('/bookings/available')) {
    const primaryVenue = MOCK_VENUES[0];
    const primaryFacility = primaryVenue.facilities[0];
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      success: true,
      data: {
        field: primaryFacility,
        facility: primaryFacility,
        venue: primaryVenue,
        dateString: todayStr,
        slots: generateMockSlotsForFacility(primaryFacility, todayStr),
      },
    };
  }

  // POST /bookings
  if (endpoint === '/bookings' && options.method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const bookingId = 'BK_' + Math.floor(100000 + Math.random() * 900000);
    const token = 'token_' + Math.random().toString(36).substring(2, 10);

    const booking = {
      _id: bookingId,
      batchId: 'batch_' + Date.now(),
      status: 'confirmed',
      paymentStatus: 'pending',
      playerName: body.playerName || 'زائر',
      playerPhone: body.playerPhone || '01000000000',
      dateString: body.dateString || new Date().toISOString().split('T')[0],
      startTime: body.startTime || (body.slots && body.slots[0]?.startTime) || '19:00',
      endTime: body.endTime || (body.slots && body.slots[body.slots.length - 1]?.endTime) || '20:00',
      price: body.price || 300,
      confirmationToken: token,
      notes: body.notes || '',
    };

    return {
      success: true,
      message: 'تم تأكيد حجزك بنجاح!',
      data: { booking },
    };
  }

  // GET /dashboard/stats
  if (endpoint.startsWith('/dashboard/stats')) {
    return {
      success: true,
      data: {
        venue: MOCK_VENUES[0],
        facilities: MOCK_VENUES[0].facilities,
        field: MOCK_VENUES[0].facilities[0],
        today: {
          bookingsCount: 8,
          revenue: 2400,
          occupancyRate: 75,
          totalSlots: 12,
        },
        total: {
          bookingsCount: 142,
          revenue: 48600,
        },
        chartData: [
          { dayName: 'السبت', bookingsCount: 10, revenue: 3200 },
          { dayName: 'الأحد', bookingsCount: 8, revenue: 2500 },
          { dayName: 'الإثنين', bookingsCount: 7, revenue: 2100 },
          { dayName: 'الثلاثاء', bookingsCount: 9, revenue: 2700 },
          { dayName: 'الأربعاء', bookingsCount: 11, revenue: 3500 },
          { dayName: 'الخميس', bookingsCount: 14, revenue: 4600 },
          { dayName: 'الجمعة', bookingsCount: 16, revenue: 5200 },
        ],
      },
    };
  }

  return { success: true, data: null };
}

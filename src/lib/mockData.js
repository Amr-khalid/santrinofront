/**
 * Resilient mock data for Santrino Multi-Sport Discovery Platform
 * Used as fallback if remote API is offline or during testing
 */

export const MOCK_VENUES = [
  {
    _id: 'venue_santrino_01',
    id: 'venue_santrino_01',
    slug: 'santrino-sports-club',
    name: 'نادي سنترينو الرياضي المتكامل — Santrino Sports Club',
    description:
      'مجمع رياضي عالمي يضم أحدث ملاعب البادل والتنس وكرة القدم الخماسية والسباعية مع مسبح نصف أولمبي وصالة لياقة بدنية.',
    shortDescription: 'بادل • كرة قدم • تنس • سباحة • لياقة',
    location: {
      address: 'شارع التسعين الشمالي، بجوار مجمع البنوك، التجمع الخامس',
      city: 'القاهرة الجديدة',
      area: 'التجمع الخامس',
      mapUrl: 'https://maps.google.com/?q=New+Cairo+Egypt',
    },
    phone: '01000000000',
    amenities: [
      'غرف تبديل ملابس فندقية ومياه ساخنة',
      'كافيتريا ومشروبات بروتين وعصائر طازجة',
      'موقف سيارات خاص مؤمن مجاني',
      'إضاءة ليد HD للمباريات الليلية',
      'واي فاي فائق السرعة',
      'خزائن أمانات إلكترونية',
      'مدرجات واستراحات مكيفة',
    ],
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9,
    reviewCount: 68,
    activities: ['padel', 'football', 'tennis', 'swimming', 'fitness'],
    availableActivities: ['padel', 'football', 'tennis', 'swimming'],
    startingPrice: 120,
    facilitiesCount: 5,
    featured: true,
    facilities: [
      {
        _id: 'fac_padel_01',
        id: 'fac_padel_01',
        name: 'ملعب بادل 01 (بانورامي)',
        activityType: 'padel',
        subType: 'panoramic',
        description: 'ملعب بادل زجاجي بانورامي فائق الرؤية مع زجاج سيكوريت عالي السماكة وعشب موندو WPT.',
        images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80'],
        amenities: ['زجاج بانورامي', 'إضاءة HD', 'مضارب وكرات متاحة'],
        bookingType: 'time_slot',
        capacity: 1,
        slotDurationMinutes: 90,
        operatingHours: { open: '08:00', close: '02:00' },
        defaultHourlyPrice: 350,
        defaultDayPrice: 300,
        defaultNightPrice: 400,
        isActive: true,
      },
      {
        _id: 'fac_padel_02',
        id: 'fac_padel_02',
        name: 'ملعب بادل 02 (Indoor مغطى ومكيف)',
        activityType: 'padel',
        subType: 'indoor',
        description: 'ملعب بادل مغطى ومكيف بالكامل للعب في أجواء مثالية صيفاً وشتاءً.',
        images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'],
        amenities: ['مغطى بالكامل', 'تكييف مركزي', 'عزل صوتي وضوئي'],
        bookingType: 'time_slot',
        capacity: 1,
        slotDurationMinutes: 90,
        operatingHours: { open: '09:00', close: '01:00' },
        defaultHourlyPrice: 380,
        defaultDayPrice: 340,
        defaultNightPrice: 420,
        isActive: true,
      },
      {
        _id: 'fac_football_01',
        id: 'fac_football_01',
        name: 'ملعب كرة قدم خماسي 01',
        activityType: 'football',
        subType: '5v5',
        description: 'نجيل صناعي تركي جيل خامس مع إضاءة ليد احترافية وشباك علوية وجانبية.',
        images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80'],
        amenities: ['نجيل تركي ممتاز', 'كرات مجانية', 'أقماع وتدريب'],
        bookingType: 'time_slot',
        capacity: 1,
        slotDurationMinutes: 60,
        operatingHours: { open: '08:00', close: '02:00' },
        defaultHourlyPrice: 250,
        defaultDayPrice: 220,
        defaultNightPrice: 300,
        isActive: true,
      },
      {
        _id: 'fac_tennis_01',
        id: 'fac_tennis_01',
        name: 'ملعب تنس أرضي 01 (صلب)',
        activityType: 'tennis',
        subType: 'hard',
        description: 'ملعب تنس بمواصفات الاتحاد الدولي ITF أرضية أكريليك سريعة ومريحة للمفاصل.',
        images: ['https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80'],
        amenities: ['أرضية أكريليك دولية', 'إضاءة مسائية', 'مدرجات جانبية'],
        bookingType: 'time_slot',
        capacity: 1,
        slotDurationMinutes: 60,
        operatingHours: { open: '07:00', close: '23:00' },
        defaultHourlyPrice: 200,
        defaultDayPrice: 180,
        defaultNightPrice: 240,
        isActive: true,
      },
      {
        _id: 'fac_pool_01',
        id: 'fac_pool_01',
        name: 'مسبح سنترينو نصف أولمبي (جلسات حرة وتدريب)',
        activityType: 'swimming',
        subType: 'olympic',
        description: 'مسبح 25 متر مع 6 حارات سباحة، معقم بأحدث أنظمة الأوزون ومراقب بواسطة منقذين معتمدين.',
        images: ['https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=800&q=80'],
        amenities: ['مياه مدفأة', 'منقذون معتمدون', 'شاورات مياه ساخنة', 'خزائن أمانات'],
        bookingType: 'session',
        capacity: 20,
        slotDurationMinutes: 60,
        operatingHours: { open: '08:00', close: '22:00' },
        defaultHourlyPrice: 120,
        defaultDayPrice: 100,
        defaultNightPrice: 130,
        isActive: true,
      },
    ],
  },
  {
    _id: 'venue_the_hub_02',
    id: 'venue_the_hub_02',
    slug: 'the-hub-padel-arena',
    name: 'ذا هَب بادل أند كورتس — The Hub Padel Arena',
    description: 'نادي البادل المتخصص الأكبر في غرب القاهرة، 4 ملاعب بانورامية ومطعم واستراحة راقية وبطولات أسبوعية.',
    shortDescription: 'بادل احترافي • ملاعب بانورامية • استراحة فاخرة',
    location: {
      address: 'وصلة دهشور، مدخل زايد 4، الشيخ زايد',
      city: 'الشيخ زايد',
      area: 'الشيخ زايد',
      mapUrl: 'https://maps.google.com/?q=Sheikh+Zayed+City',
    },
    phone: '01022334455',
    amenities: [
      'أرضيات موندو إسبانية رسمية WPT',
      'كافيه ومطعم راقي',
      'إيجار وتجربة أحدث المضارب',
      'مدربين معتمدين دولياً',
      'مواقف سيارات واسعة',
    ],
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8,
    reviewCount: 42,
    activities: ['padel', 'table_tennis'],
    availableActivities: ['padel', 'table_tennis'],
    startingPrice: 100,
    facilitiesCount: 3,
    featured: true,
    facilities: [
      {
        _id: 'fac_hub_padel_01',
        id: 'fac_hub_padel_01',
        name: 'ملعب بادل سنتر كورت (بانورامي)',
        activityType: 'padel',
        subType: 'panoramic',
        description: 'الملعب الرئيسي للبطولات زجاج بالكامل وكاميرات تسجيل للمباريات.',
        images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'],
        amenities: ['تسجيل مباريات', 'زجاج بانورامي', 'مدرج جماهير'],
        bookingType: 'time_slot',
        capacity: 1,
        slotDurationMinutes: 90,
        operatingHours: { open: '08:00', close: '02:00' },
        defaultHourlyPrice: 400,
        defaultDayPrice: 350,
        defaultNightPrice: 450,
        isActive: true,
      },
      {
        _id: 'fac_hub_tennis_table_01',
        id: 'fac_hub_tennis_table_01',
        name: 'صالة تنس طاولة احترافية',
        activityType: 'table_tennis',
        subType: 'indoor',
        description: 'طاولات دونيك ألمانية معتمدة مع مضارب وكرات محترفين.',
        images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'],
        amenities: ['طاولات ألمانية', 'مكيفة بالكامل'],
        bookingType: 'time_slot',
        capacity: 1,
        slotDurationMinutes: 60,
        operatingHours: { open: '10:00', close: '24:00' },
        defaultHourlyPrice: 100,
        defaultDayPrice: 80,
        defaultNightPrice: 120,
        isActive: true,
      },
    ],
  },
  {
    _id: 'venue_olympic_03',
    id: 'venue_olympic_03',
    slug: 'olympic-arena-maadi',
    name: 'أولمبيك أرينا — Olympic Arena المعادي',
    description: 'منشأة رياضية متكاملة تقدم ملاعب كرة سلة، طائرة، ريشة، ومسبح أولمبي معتمد لأكاديميات السباحة.',
    shortDescription: 'سباحة • كرة سلة • طائرة • ريشة طائرة',
    location: {
      address: 'دجلة، شارع 206، المعادي',
      city: 'المعادي',
      area: 'دجلة المعادي',
      mapUrl: 'https://maps.google.com/?q=Maadi+Cairo',
    },
    phone: '01099887766',
    amenities: [
      'مسبح أولمبي مدفأ شتاءً',
      'صالة باركيه مغطاة للسلة والطائرة',
      'حكام ومسعفين متواجدين دائماً',
      'غرف ساونا وجاكوزي',
    ],
    images: [
      'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7,
    reviewCount: 31,
    activities: ['swimming', 'basketball', 'volleyball', 'badminton'],
    availableActivities: ['swimming', 'basketball', 'badminton'],
    startingPrice: 130,
    facilitiesCount: 3,
    featured: true,
    facilities: [
      {
        _id: 'fac_olympic_pool',
        id: 'fac_olympic_pool',
        name: 'المسبح الأولمبي المغطى (حارات وجلسات)',
        activityType: 'swimming',
        subType: 'olympic',
        description: 'مسبح أولمبي 50 متر مجهز بأعلى معايير النظافة والتعقيم.',
        images: ['https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=800&q=80'],
        amenities: ['مسبح 50م', 'مدفأ بالكامل', 'منقذين'],
        bookingType: 'session',
        capacity: 25,
        slotDurationMinutes: 60,
        operatingHours: { open: '07:00', close: '22:00' },
        defaultHourlyPrice: 140,
        defaultDayPrice: 120,
        defaultNightPrice: 150,
        isActive: true,
      },
      {
        _id: 'fac_basketball_court',
        id: 'fac_basketball_court',
        name: 'صالة كرة السلة المغطاة (باركيه كندي)',
        activityType: 'basketball',
        subType: 'indoor',
        description: 'صالة باركيه خشبية مع أطواق هيدروليكية ولوحة نتائج رقمية.',
        images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80'],
        amenities: ['باركيه كندي', 'أطواق معتمدة', 'لوحة إلكترونية'],
        bookingType: 'time_slot',
        capacity: 1,
        slotDurationMinutes: 60,
        operatingHours: { open: '09:00', close: '23:00' },
        defaultHourlyPrice: 220,
        defaultDayPrice: 200,
        defaultNightPrice: 260,
        isActive: true,
      },
    ],
  },
];

/**
 * Generate slots for a facility on a specific date
 */
export function generateMockSlotsForFacility(facility, dateString) {
  const isSession = facility?.bookingType === 'session';
  const capacity = facility?.capacity || (isSession ? 20 : 1);
  const openHour = parseInt(facility?.operatingHours?.open?.split(':')[0] || '8', 10);
  const closeHour = parseInt(facility?.operatingHours?.close?.split(':')[0] || '24', 10);
  const duration = facility?.slotDurationMinutes || 60;

  const slots = [];
  const hoursToGenerate = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1];

  hoursToGenerate.forEach((h, idx) => {
    const startStr = `${String(h).padStart(2, '0')}:00`;
    const nextH = (h + Math.floor(duration / 60)) % 24;
    const endStr = `${String(nextH).padStart(2, '0')}:00`;

    // Simulated pseudo-random booked slots
    const isBookedCourt = !isSession && (h === 19 || h === 21);
    const bookedCount = isSession ? (h === 18 ? 14 : h === 19 ? 8 : 4) : isBookedCourt ? 1 : 0;
    const remainingSlots = Math.max(0, capacity - bookedCount);
    const isAvailable = isSession ? remainingSlots > 0 : !isBookedCourt;

    const basePrice = facility?.defaultHourlyPrice || 250;
    const isPeak = h >= 18 || h < 2;
    const slotPrice = isPeak ? (facility?.defaultNightPrice || basePrice + 50) : (facility?.defaultDayPrice || basePrice);

    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const period = h >= 12 ? 'م' : 'ص';
    const displayTime = `${String(hour12).padStart(2, '0')}:00 ${period}`;

    slots.push({
      startTime: startStr,
      endTime: endStr,
      displayTime,
      price: slotPrice,
      isAvailable,
      bookingType: facility?.bookingType || 'time_slot',
      capacity,
      bookedCount,
      remainingSlots,
      bookingInfo: !isAvailable && !isSession ? { status: 'confirmed', playerName: 'حجز مؤكد' } : null,
    });
  });

  return slots;
}

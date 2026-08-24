/**
 * Format currency in Egyptian Pounds (EGP)
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '0 ج.م';
  return `${amount} ج.م`;
}

/**
 * Format date to Arabic readable string (e.g. "الجمعة، 15 مارس")
 */
export function formatDateArabic(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format 24h time string (e.g. "14:00") to Arabic 12h time (e.g. "2:00 م")
 */
export function formatTime12h(time24) {
  if (!time24) return '';
  const [hoursStr, minsStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const period = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minsStr} ${period}`;
}

/**
 * Format slot time range (e.g. "14:00", "15:00") to "2:00 م — 3:00 م"
 */
export function formatSlotRange12h(startTime, endTime) {
  return `${formatTime12h(startTime)} — ${formatTime12h(endTime)}`;
}

/**
 * Clean pricing rule name by stripping unnecessary words like "(خصم خاص)", "عرض خاص", "عرض", "خصم"
 */
export function cleanRuleName(name) {
  if (!name) return '';
  return name
    .replace(/\(خصم خاص\)/gi, '')
    .replace(/عرض خاص/gi, '')
    .replace(/\bعرض\b/gi, '')
    .replace(/\bخصم\b/gi, '')
    .replace(/\(الجمعة والسبت\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Map time string (e.g. "14:00") to natural day periods covering all 24 hours
 */
export function getTimePeriod(startTime) {
  if (!startTime) {
    return {
      id: 'evening',
      order: 5,
      label: 'فترة المساء',
      timeSpan: '6:00 م – 9:00 م',
    };
  }

  const hour = parseInt(startTime.split(':')[0], 10);

  // 1. Dawn & Early Morning: 05:00 - 07:59
  if (hour >= 5 && hour < 8) {
    return {
      id: 'dawn',
      order: 1,
      label: 'فترة الفجر والصباح الباكر',
      timeSpan: '5:00 ص – 8:00 ص',
    };
  }

  // 2. Morning: 08:00 - 11:59
  if (hour >= 8 && hour < 12) {
    return {
      id: 'morning',
      order: 2,
      label: 'فترة الصباح',
      timeSpan: '8:00 ص – 12:00 م',
    };
  }

  // 3. Noon: 12:00 - 14:59
  if (hour >= 12 && hour < 15) {
    return {
      id: 'noon',
      order: 3,
      label: 'فترة الظهيرة',
      timeSpan: '12:00 م – 3:00 م',
    };
  }

  // 4. Afternoon / Asr: 15:00 - 17:59
  if (hour >= 15 && hour < 18) {
    return {
      id: 'afternoon',
      order: 4,
      label: 'فترة العصر',
      timeSpan: '3:00 م – 6:00 م',
    };
  }

  // 5. Evening: 18:00 - 20:59
  if (hour >= 18 && hour < 21) {
    return {
      id: 'evening',
      order: 5,
      label: 'فترة المساء',
      timeSpan: '6:00 م – 9:00 م',
    };
  }

  // 6. Night: 21:00 - 23:59
  if (hour >= 21 && hour <= 23) {
    return {
      id: 'night',
      order: 6,
      label: 'فترة الليل',
      timeSpan: '9:00 م – 12:00 ص',
    };
  }

  // 7. Late Night / Midnight: 00:00 - 04:59
  return {
    id: 'late_night',
    order: 7,
    label: 'ساعات بعد منتصف الليل',
    timeSpan: '12:00 ص – 5:00 ص',
  };
}

/**
 * Fallback default slots for instant UI rendering during database startup
 * Day: 150 EGP, Night: 200 EGP
 */
export function generateDefaultSlots(dateString) {
  const times = [
    // Dawn / Morning (Day: 150 EGP)
    { start: '05:00', end: '06:00', price: 150, rule: { name: 'فترة الفجر' } },
    { start: '06:00', end: '07:00', price: 150, rule: { name: 'فترة الصباح' } },
    { start: '07:00', end: '08:00', price: 150, rule: { name: 'فترة الصباح' } },
    { start: '08:00', end: '09:00', price: 150, rule: { name: 'فترة الصباح' } },
    { start: '09:00', end: '10:00', price: 150, rule: { name: 'فترة الصباح' } },
    { start: '10:00', end: '11:00', price: 150, rule: { name: 'فترة الصباح' } },
    { start: '11:00', end: '12:00', price: 150, rule: { name: 'فترة الصباح' } },

    // Noon (Day: 150 EGP)
    { start: '12:00', end: '13:00', price: 150, rule: { name: 'فترة الظهيرة' } },
    { start: '13:00', end: '14:00', price: 150, rule: { name: 'فترة الظهيرة' } },
    { start: '14:00', end: '15:00', price: 150, rule: { name: 'فترة الظهيرة' } },

    // Afternoon (Day: 150 EGP)
    { start: '15:00', end: '16:00', price: 150, rule: { name: 'فترة العصر' } },
    { start: '16:00', end: '17:00', price: 150, rule: { name: 'فترة العصر' } },
    { start: '17:00', end: '18:00', price: 150, rule: { name: 'فترة العصر' } },

    // Evening / Night (Night: 200 EGP)
    { start: '18:00', end: '19:00', price: 200, rule: { name: 'فترة المساء' } },
    { start: '19:00', end: '20:00', price: 200, rule: { name: 'فترة المساء' } },
    { start: '20:00', end: '21:00', price: 200, rule: { name: 'فترة المساء' } },
    { start: '21:00', end: '22:00', price: 200, rule: { name: 'فترة الليل' } },
    { start: '22:00', end: '23:00', price: 200, rule: { name: 'فترة الليل' } },
    { start: '23:00', end: '00:00', price: 200, rule: { name: 'فترة الليل' } },

    // Late Night (Night: 200 EGP)
    { start: '00:00', end: '01:00', price: 200, rule: { name: 'ساعات بعد منتصف الليل' } },
    { start: '01:00', end: '02:00', price: 200, rule: { name: 'ساعات بعد منتصف الليل' } },
    { start: '02:00', end: '03:00', price: 200, rule: { name: 'ساعات بعد منتصف الليل' } },
    { start: '03:00', end: '04:00', price: 200, rule: { name: 'ساعات بعد منتصف الليل' } },
    { start: '04:00', end: '05:00', price: 200, rule: { name: 'ساعات بعد منتصف الليل' } },
  ];

  return times.map((t, idx) => ({
    startTime: t.start,
    endTime: t.end,
    displayTime: `${t.start} - ${t.end}`,
    price: t.price,
    appliedRule: t.rule,
    isAvailable: idx !== 10 && idx !== 13,
  }));
}


/**
 * Generate next N days for date picker
 */
export function getNextDays(daysCount = 14) {
  const days = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const dateString = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const isTomorrow = i === 1;

    let dayName = new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(d);
    if (isToday) dayName = 'اليوم';
    else if (isTomorrow) dayName = 'غداً';

    const dayNumber = d.getDate();
    const monthName = new Intl.DateTimeFormat('ar-EG', { month: 'short' }).format(d);

    days.push({
      dateString,
      dayName,
      dayNumber,
      monthName,
      isToday,
      isWeekend: d.getDay() === 5 || d.getDay() === 6, // Fri or Sat
    });
  }

  return days;
}

/**
 * Translate booking status to Arabic & color
 */
export function getStatusInfo(status) {
  switch (status) {
    case 'confirmed':
      return { label: 'مؤكد', colorClass: 'badge-success' };
    case 'pending_confirmation':
      return { label: 'بانتظار التأكيد', colorClass: 'badge-warning' };
    case 'auto_expired':
      return { label: 'انتهت المهلة', colorClass: 'badge-danger' };
    case 'completed':
      return { label: 'مكتمل', colorClass: 'badge-neutral' };
    case 'cancelled':
      return { label: 'ملغي', colorClass: 'badge-danger' };
    default:
      return { label: status, colorClass: 'badge-neutral' };
  }
}

/**
 * Translate payment status dynamically
 */
export function getPaymentStatusInfo(status) {
  switch (status) {
    case 'paid_cash':
      return { label: 'مدفوع كاش', colorClass: 'badge-success', isPaid: true };
    case 'paid_online':
      return { label: 'مدفوع إلكتروني', colorClass: 'badge-success', isPaid: true };
    case 'paid':
      return { label: 'مدفوع', colorClass: 'badge-success', isPaid: true };
    case 'refunded':
      return { label: 'مسترد', colorClass: 'badge-danger', isPaid: false };
    case 'pending':
    default:
      return { label: 'دفع عند الحضور', colorClass: 'badge-warning', isPaid: false };
  }
}

/**
 * Days of week list
 */
export const DAYS_OF_WEEK = [
  { id: 0, name: 'الأحد' },
  { id: 1, name: 'الإثنين' },
  { id: 2, name: 'الثلاثاء' },
  { id: 3, name: 'الأربعاء' },
  { id: 4, name: 'الخميس' },
  { id: 5, name: 'الجمعة' },
  { id: 6, name: 'السبت' },
];

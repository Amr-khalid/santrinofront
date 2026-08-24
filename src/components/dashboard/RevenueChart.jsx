'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

export default function RevenueChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue || 0), 500);

  return (
    <div className="chart-container">
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>إيرادات آخر 7 أيام</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>محدث لحظياً</span>
      </div>

      <div className="chart-bars">
        {data.map((item, idx) => {
          const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 8);

          return (
            <div key={idx} className="chart-bar-group">
              <span className="chart-bar-value">{formatCurrency(item.revenue)}</span>
              <div
                className="chart-bar"
                style={{ height: `${heightPercent}%` }}
                title={`${item.dayName} (${item.dateString}): ${item.bookingsCount} حجوزات - ${formatCurrency(item.revenue)}`}
              />
              <span className="chart-bar-label">{item.dayName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


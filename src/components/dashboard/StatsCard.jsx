import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'brand' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}


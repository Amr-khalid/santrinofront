import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'جاري التحميل...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-10) var(--space-4)', gap: 'var(--space-3)' }}>
      <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
      {text && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{text}</span>}
    </div>
  );
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style = {}, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}


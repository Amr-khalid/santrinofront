import React from 'react';

export default function Badge({ children, variant = 'neutral', className = '' }) {
  // variant: brand | success | warning | danger | neutral
  const variantClass = variant === 'brand' || variant === 'primary' 
    ? 'badge-brand' 
    : `badge-${variant}`;

  return <span className={`badge ${variantClass} ${className}`}>{children}</span>;
}


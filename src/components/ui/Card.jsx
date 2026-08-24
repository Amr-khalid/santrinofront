import React from 'react';

export default function Card({
  children,
  interactive = false,
  variant = 'default', // default | muted
  padding = 'md', // sm | md | lg | none
  className = '',
  ...props
}) {
  const paddingStyle =
    padding === 'none'
      ? { padding: 0 }
      : padding === 'sm'
      ? { padding: 'var(--space-3)' }
      : padding === 'lg'
      ? { padding: 'var(--space-6)' }
      : {};

  return (
    <div
      className={`card ${variant === 'muted' ? 'card-muted' : ''} ${interactive ? 'card-interactive' : ''} ${className}`}
      style={paddingStyle}
      {...props}
    >
      {children}
    </div>
  );
}


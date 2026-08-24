import React from 'react';

export default function Card({
  children,
  interactive = false,
  variant = 'default', // default | muted
  padding = 'md', // sm | md | lg | none
  className = '',
  style = {},
  ...props
}) {
  const paddingClass =
    padding === 'none'
      ? 'card-padding-none'
      : padding === 'sm'
      ? 'card-padding-sm'
      : padding === 'lg'
      ? 'card-padding-lg'
      : 'card-padding-md';

  return (
    <div
      className={`card ${paddingClass} ${variant === 'muted' ? 'card-muted' : ''} ${interactive ? 'card-interactive' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}


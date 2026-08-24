'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'start',
  className = '',
  type = 'button',
  href,
  ...props
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md';
  const variantClass = `btn-${variant}`;
  const combinedClass = `btn ${variantClass} ${sizeClass} ${className}`;

  const content = (
    <>
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'start' && <Icon size={size === 'sm' ? 14 : 18} />}
          {children}
          {Icon && iconPosition === 'end' && <Icon size={size === 'sm' ? 14 : 18} />}
        </>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClass} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClass}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}


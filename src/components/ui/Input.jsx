import React from 'react';
import { AlertCircle } from 'lucide-react';

export function Input({ label, error, helperText, className = '', id, required, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span style={{ color: 'var(--danger)', marginRight: '2px' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'border-danger' : ''} ${className}`}
        style={error ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.15)' } : {}}
        required={required}
        {...props}
      />
      {error && (
        <div className="input-error-msg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && <div className="input-helper-msg">{helperText}</div>}
    </div>
  );
}

export function Select({ label, options = [], error, helperText, className = '', id, required, ...props }) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
          {required && <span style={{ color: 'var(--danger)', marginRight: '2px' }}>*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`input-field ${error ? 'border-danger' : ''} ${className}`}
        style={error ? { borderColor: 'var(--danger)' } : {}}
        required={required}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="input-error-msg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && <div className="input-helper-msg">{helperText}</div>}
    </div>
  );
}

export function Textarea({ label, error, helperText, className = '', id, required, ...props }) {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={areaId} className="input-label">
          {label}
          {required && <span style={{ color: 'var(--danger)', marginRight: '2px' }}>*</span>}
        </label>
      )}
      <textarea
        id={areaId}
        className={`input-field ${error ? 'border-danger' : ''} ${className}`}
        style={{ minHeight: '80px', padding: 'var(--space-2) var(--space-3)', resize: 'vertical', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
        rows={3}
        required={required}
        {...props}
      />
      {error && (
        <div className="input-error-msg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && <div className="input-helper-msg">{helperText}</div>}
    </div>
  );
}


'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import {
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader2,
  Check,
  Eye,
  EyeOff,
  User,
  Phone,
  Lock,
  ShieldCheck,
  Building2,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'player';

  const { register } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Egyptian phone validation regex: 010, 011, 012, 015 followed by 8 digits
  const EGY_PHONE_REGEX = /^01[0125][0-9]{8}$/;

  // Validate single field
  const validateField = (name, value, allValues = form) => {
    let error = '';

    switch (name) {
      case 'name': {
        const trimmed = value.trim();
        if (!trimmed) {
          error = 'الاسم بالكامل مطلوب';
        } else if (trimmed.length < 3) {
          error = 'الاسم يجب أن يحتوي على 3 أحرف على الأقل';
        } else if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(trimmed)) {
          error = 'الاسم يجب أن يحتوي على حروف فقط';
        }
        break;
      }

      case 'phone': {
        const clean = value.trim().replace(/[\s\-\+]/g, '');
        if (!clean) {
          error = 'رقم الهاتف مطلوب';
        } else if (!/^[0-9]+$/.test(clean)) {
          error = 'رقم الهاتف يجب أن يحتوي على أرقام فقط';
        } else if (!EGY_PHONE_REGEX.test(clean)) {
          error = 'رقم غير صحيح، يجب أن يتكون من 11 رقم ويبدأ بـ (010, 011, 012, 015)';
        }
        break;
      }

      case 'password': {
        if (!value) {
          error = 'كلمة المرور مطلوبة';
        } else if (value.length < 6) {
          error = 'كلمة المرور يجب أن لا تقل عن 6 أحرف';
        }
        break;
      }

      case 'confirmPassword': {
        if (!value) {
          error = 'يرجى تأكيد كلمة المرور';
        } else if (value !== allValues.password) {
          error = 'كلمتا المرور غير متطابقتين';
        }
        break;
      }

      default:
        break;
    }

    return error;
  };

  // Handle input change
  const handleChange = (field, value) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);

    if (touched[field]) {
      const fieldError = validateField(field, value, nextForm);
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }

    // If password changed, re-validate confirmPassword if touched
    if (field === 'password' && touched.confirmPassword) {
      const confirmErr = validateField('confirmPassword', nextForm.confirmPassword, nextForm);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  // Handle blur
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldError = validateField(field, form[field], form);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  // Validate entire form before submit
  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const err = validateField(field, form[field], form);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!form.password) return 0;
    let score = 0;
    if (form.password.length >= 6) score += 1;
    if (form.password.length >= 8) score += 1;
    if (/[A-Z]/.test(form.password) || /[a-z]/.test(form.password)) score += 1;
    if (/[0-9]/.test(form.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength();
  const getStrengthLabel = () => {
    if (strengthScore <= 1) return { label: 'ضعيفة', color: 'var(--danger)', percent: 25 };
    if (strengthScore <= 3) return { label: 'متوسطة', color: 'var(--warning)', percent: 65 };
    return { label: 'قوية وممتازة', color: 'var(--success)', percent: 100 };
  };

  const strengthInfo = getStrengthLabel();

  // Form Submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!validateForm()) {
      showToast('يرجى تصحيح الأخطاء الموضحة في النموذج', 'warning');
      return;
    }

    const trimmedName = form.name.trim();
    const cleanPhone = form.phone.trim().replace(/[\s\-\+]/g, '');

    setLoading(true);
    setStatusMsg({ type: 'info', text: 'جاري إنشاء الحساب...' });

    try {
      const user = await register(trimmedName, cleanPhone, form.password, form.role);
      if (user) {
        setStatusMsg({ type: 'success', text: 'تم إنشاء الحساب بنجاح! جاري التوجيه...' });
        showToast('تم إنشاء الحساب بنجاح', 'success');

        setTimeout(() => {
          if (user.role === 'owner' || user.role === 'admin' || user.role === 'superadmin') {
            router.push('/dashboard');
          } else {
            router.push('/');
          }
        }, 500);
      }
    } catch (err) {
      const errMsg = err.message || 'فشل إنشاء الحساب، يرجى التأكد من البيانات والمحاولة مرة أخرى';
      setStatusMsg({ type: 'error', text: errMsg });
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        padding: 'var(--space-8) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        minHeight: 'calc(100vh - 76px)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            إنشاء حساب جديد
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            انضم إلى منصة سنترينو لحجز وإدارة الملاعب بسهولة فورية
          </p>
        </div>

        <Card padding="lg">
          {/* Status Alert Banner */}
          {statusMsg.text && (
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background:
                  statusMsg.type === 'error'
                    ? 'var(--danger-light)'
                    : statusMsg.type === 'success'
                    ? 'var(--success-light)'
                    : 'var(--primary-light)',
                border:
                  statusMsg.type === 'error'
                    ? '1px solid var(--danger-border)'
                    : statusMsg.type === 'success'
                    ? '1px solid var(--success-border)'
                    : '1px solid var(--primary-border)',
                color:
                  statusMsg.type === 'error'
                    ? 'var(--danger)'
                    : statusMsg.type === 'success'
                    ? 'var(--success)'
                    : 'var(--primary)',
              }}
            >
              {statusMsg.type === 'error' && <AlertCircle size={16} />}
              {statusMsg.type === 'success' && <CheckCircle size={16} />}
              {statusMsg.type === 'info' && <Loader2 size={16} className="animate-spin" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            {/* Account Role Selector */}
            <div>
              <label className="form-label" style={{ marginBottom: '6px' }}>نوع الحساب</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: 'var(--bg-surface-raised)',
                  padding: '4px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleChange('role', 'player')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: form.role === 'player' ? 'var(--primary)' : 'transparent',
                    color: form.role === 'player' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  ⚽ لاعب / مستخدم
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('role', 'owner')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: form.role === 'owner' ? 'var(--primary)' : 'transparent',
                    color: form.role === 'owner' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  🏟️ صاحب منشأة / نادي
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="form-label required">الاسم بالكامل</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className={`input ${touched.name && errors.name ? 'input-error' : ''}`}
                  placeholder="مثال: كريم يوسف"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  disabled={loading}
                  style={{
                    borderColor: touched.name && errors.name ? 'var(--danger)' : undefined,
                  }}
                />
              </div>
              {touched.name && errors.name && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.name}
                </span>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="form-label required">رقم الهاتف (11 رقم)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className={`input ${touched.phone && errors.phone ? 'input-error' : ''}`}
                  placeholder="01012345678"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  disabled={loading}
                  dir="ltr"
                  maxLength={11}
                  style={{
                    borderColor: touched.phone && errors.phone ? 'var(--danger)' : undefined,
                  }}
                />
              </div>
              {touched.phone && errors.phone ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.phone}
                </span>
              ) : (
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  يبدأ بـ 010 أو 011 أو 012 أو 015
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="form-label required">كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input ${touched.password && errors.password ? 'input-error' : ''}`}
                  placeholder="•••••••• (6 أحرف على الأقل)"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  disabled={loading}
                  style={{
                    paddingLeft: '38px',
                    borderColor: touched.password && errors.password ? 'var(--danger)' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${strengthInfo.percent}%`,
                        background: strengthInfo.color,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: strengthInfo.color, fontWeight: 600, display: 'block', marginTop: '2px' }}>
                    قوة كلمة المرور: {strengthInfo.label}
                  </span>
                </div>
              )}

              {touched.password && errors.password && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label required">تأكيد كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="أعد كتابة كلمة المرور"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  disabled={loading}
                  style={{
                    paddingLeft: '38px',
                    borderColor:
                      touched.confirmPassword && errors.confirmPassword
                        ? 'var(--danger)'
                        : touched.confirmPassword && form.confirmPassword && form.confirmPassword === form.password
                        ? 'var(--success)'
                        : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {touched.confirmPassword && errors.confirmPassword ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.confirmPassword}
                </span>
              ) : touched.confirmPassword && form.confirmPassword && form.confirmPassword === form.password ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> كلمتا المرور متطابقتان
                </span>
              ) : null}
            </div>


            <Button
              variant="primary"
              type="submit"
              loading={loading}
              icon={UserPlus}
              style={{ width: '100%', marginTop: 'var(--space-3)' }}
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </Button>
          </form>

          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-3)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            لديك حساب بالفعل؟{' '}
            <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              تسجيل الدخول
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Loader text="جاري تجهيز صفحة إنشاء الحساب..." />}>
      <RegisterForm />
    </Suspense>
  );
}


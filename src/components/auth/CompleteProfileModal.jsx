'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Phone, User } from 'lucide-react';

export default function CompleteProfileModal({ isOpen, onClose, onSuccess }) {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف للتأكيد');
      return;
    }

    if (!/^01[0125][0-9]{8}$/.test(phone.trim())) {
      setError('يرجى إدخال رقم هاتف مصري صحيح (11 رقم)');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile({ name: name.trim(), phone: phone.trim() });
      showToast('تم استكمال بيانات الحساب بنجاح', 'success');
      if (onSuccess) onSuccess(updatedUser);
      onClose();
    } catch (err) {
      setError(err.message || 'فشل حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="استكمال بيانات الحساب">
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          أهلاً بك يا {user?.name?.split(' ')[0] || 'لاعب'} 👋
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          يرجى إضافة رقم موبايلك لتستخدمه لتأكيد الحجوزات وتسهيل التواصل معك
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          label="الاسم بالكامل"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: أحمد محمود"
          disabled={loading}
          icon={User}
        />

        <Input
          label="رقم الهاتف"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01012345678"
          type="tel"
          disabled={loading}
          error={error}
          icon={Phone}
        />

        <div style={{ background: 'var(--bg-surface-raised)', padding: '0.7rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          سيتم حفظ رقم الهاتف لاستخدامه تلقائياً في جميع حجوزاتك القادمة.
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="primary" type="submit" loading={loading} style={{ width: '100%' }}>
            حفظ البيانات ومتابعة الحجز
          </Button>
        </div>
      </form>
    </Modal>
  );
}

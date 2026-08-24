'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import PricingModal from '@/components/dashboard/PricingModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import { formatCurrency, DAYS_OF_WEEK, formatSlotRange12h } from '@/lib/utils';
import {
  DollarSign,
  PlusCircle,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  Sliders,
  Sun,
  Moon,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPricingPage() {
  const { showToast } = useToast();

  const [rules, setRules] = useState([]);
  const [defaultDayPrice, setDefaultDayPrice] = useState(150);
  const [defaultNightPrice, setDefaultNightPrice] = useState(200);
  const [loading, setLoading] = useState(true);
  const [savingDefaults, setSavingDefaults] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/dashboard/pricing');
      if (res.success && res.data) {
        setRules(res.data.rules || []);
        if (res.data.defaultDayPrice !== undefined) {
          setDefaultDayPrice(res.data.defaultDayPrice);
        }
        if (res.data.defaultNightPrice !== undefined) {
          setDefaultNightPrice(res.data.defaultNightPrice);
        }
      }
    } catch (err) {
      showToast(err.message || 'فشل جلب قواعد التسعير', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // Quick save default Day and Night prices
  const handleSaveDefaults = async (e) => {
    e.preventDefault();
    setSavingDefaults(true);
    try {
      const res = await apiRequest('/dashboard/pricing/defaults', {
        method: 'PUT',
        body: JSON.stringify({
          defaultDayPrice: Number(defaultDayPrice),
          defaultNightPrice: Number(defaultNightPrice),
        }),
      });

      if (res.success) {
        showToast('تم حفظ الأسعار الافتراضية بنجاح', 'success');
        if (res.data) {
          setDefaultDayPrice(res.data.defaultDayPrice);
          setDefaultNightPrice(res.data.defaultNightPrice);
        }
      }
    } catch (err) {
      showToast(err.message || 'فشل حفظ الأسعار الافتراضية', 'error');
    } finally {
      setSavingDefaults(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف فترة التسعير هذه؟')) return;

    try {
      const res = await apiRequest(`/dashboard/pricing/${ruleId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast('تم حذف فترة التسعير بنجاح', 'success');
        fetchPricing();
      }
    } catch (err) {
      showToast(err.message || 'فشل حذف فترة التسعير', 'error');
    }
  };

  if (loading) {
    return <Loader text="جاري جلب بيانات التسعير..." />;
  }

  return (
    <div>
      {/* Header */}
      <div
        className="flex justify-between items-center"
        style={{
          marginBottom: 'var(--space-6)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            التسعير الديناميكي للملعب
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            التحكم السريع في الأسعار الافتراضية لساعات النهار والليل وتحديد فترات مخصصة
          </p>
        </div>

        <Button variant="primary" size="sm" icon={PlusCircle} onClick={handleOpenCreate}>
          إضافة فترة مخصصة
        </Button>
      </div>

      {/* Quick Default Prices Editor Card */}
      <Card
        style={{
          marginBottom: 'var(--space-6)',
          border: '1px solid var(--primary-border)',
          background: 'var(--bg-surface)',
          padding: 'var(--space-5)',
        }}
      >
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            الأسعار الافتراضية السريعة (تطبيق فوري)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '2px' }}>
            تطبق هذه الأسعار تلقائياً على كافة الساعات التي لم يتم تخصيص فترة استثنائية لها
          </p>
        </div>

        <form onSubmit={handleSaveDefaults}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {/* Day Price Box */}
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sun size={18} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'block' }}>
                    سعر ساعات النهار
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    من 6:00 ص إلى 6:00 م
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2)' }}>
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>السعر الافتراضي (ج.م / ساعة)</label>
                <input
                  type="number"
                  className="input"
                  min={50}
                  step={25}
                  value={defaultDayPrice}
                  onChange={(e) => setDefaultDayPrice(e.target.value)}
                  style={{ fontWeight: 700, fontSize: '1.0625rem' }}
                  required
                />
              </div>
            </div>

            {/* Night Price Box */}
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: '#EDE9FE',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Moon size={18} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'block' }}>
                    سعر ساعات الليل والسهرة
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    من 6:00 م إلى 6:00 ص
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-2)' }}>
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>السعر الافتراضي (ج.م / ساعة)</label>
                <input
                  type="number"
                  className="input"
                  min={50}
                  step={25}
                  value={defaultNightPrice}
                  onChange={(e) => setDefaultNightPrice(e.target.value)}
                  style={{ fontWeight: 700, fontSize: '1.0625rem' }}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={savingDefaults}
              icon={Save}
            >
              {savingDefaults ? 'جاري الحفظ...' : 'حفظ الأسعار الافتراضية'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Rules Section Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          الفترات والقواعد المخصصة ({rules.length})
        </h2>
      </div>

      {rules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Sliders size={24} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
            لا توجد فترات تسعير استثنائية
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: 'var(--space-4)' }}>
            يتم تطبيق سعر النهار ({formatCurrency(defaultDayPrice)}) وسعر الليل ({formatCurrency(defaultNightPrice)}) تلقائياً على كل المواعيد
          </p>
          <Button variant="primary" size="sm" icon={PlusCircle} onClick={handleOpenCreate}>
            إضافة أول فترة مخصصة
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 'var(--space-4)' }}>
          {rules.map((rule) => {
            const dayNames = (rule.daysOfWeek || [])
              .map((d) => DAYS_OF_WEEK.find((day) => day.id === d)?.name)
              .filter(Boolean);

            const isAllWeek = dayNames.length === 7;
            const isWeekend = dayNames.length === 3 && rule.daysOfWeek.includes(5) && rule.daysOfWeek.includes(6);

            return (
              <Card
                key={rule._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--border-default)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div className="flex justify-between items-center">
                  <span
                    className="badge badge-brand"
                    style={{ fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    {rule.name}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(rule)}
                      style={{
                        padding: 'var(--space-1)',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                      title="تعديل الفترة"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule._id)}
                      style={{
                        padding: 'var(--space-1)',
                        color: 'var(--danger)',
                        background: 'var(--bg-surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                      title="حذف الفترة"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Inter, sans-serif' }}>
                    {formatCurrency(rule.price)} <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>/ ساعة</span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-surface-raised)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    fontSize: '0.8125rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', direction: 'ltr', textAlign: 'right' }}>
                      {formatSlotRange12h(rule.startTime, rule.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {isAllWeek
                        ? 'طوال أيام الأسبوع'
                        : isWeekend
                        ? 'عطلة نهاية الأسبوع (الخميس والجمعة والسبت)'
                        : dayNames.join('، ')}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rule={editingRule}
        onSuccess={fetchPricing}
      />
    </div>
  );
}

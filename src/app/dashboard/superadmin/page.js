'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Key,
  Trash2,
  UserCog,
  Users,
  Shield,
  Briefcase,
  CalendarCheck,
  RefreshCw,
  AlertTriangle,
  LogIn,
} from 'lucide-react';

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, isSuperAdmin, impersonateUser } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected user for action
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'admin',
  });
  const [newRole, setNewRole] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, usersRes] = await Promise.all([
        apiRequest('/superadmin/stats'),
        apiRequest(`/superadmin/users?role=${roleFilter}&search=${encodeURIComponent(searchQuery)}`),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      if (usersRes.success) {
        setUsers(usersRes.users || []);
      }
    } catch (err) {
      showToast(err.message || 'فشل جلب بيانات الإدارة العليا', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [roleFilter, isSuperAdmin]);

  // Debounced search trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Impersonate / Login as target user
  const handleImpersonate = async (targetUser) => {
    try {
      setSubmitting(true);
      await impersonateUser(targetUser._id);
      showToast(`تم الدخول بنجاح بحساب (${targetUser.name})`, 'success');

      if (targetUser.role === 'owner' || targetUser.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      showToast(err.message || 'فشل التبديل للحساب المطلوب', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Create new admin/user
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.phone || !createForm.password) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'warning');
      return;
    }
    if (createForm.password.length < 6) {
      showToast('كلمة المرور يجب أن لا تقل عن 6 أحرف', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiRequest('/superadmin/users', {
        method: 'POST',
        body: JSON.stringify(createForm),
      });

      if (res.success) {
        showToast(res.message || 'تم إنشاء الحساب بنجاح', 'success');
        setIsCreateModalOpen(false);
        setCreateForm({ name: '', phone: '', email: '', password: '', role: 'admin' });
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'فشل إنشاء الحساب', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Role
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const res = await apiRequest(`/superadmin/users/${selectedUser._id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });

      if (res.success) {
        showToast(res.message || 'تم تعديل الدور بنجاح', 'success');
        setIsRoleModalOpen(false);
        setSelectedUser(null);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'فشل تعديل الدور', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset Password
  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      showToast('يرجى إدخال كلمة المرور الجديدة', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiRequest(`/superadmin/users/${selectedUser._id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword }),
      });

      if (res.success) {
        showToast(res.message || 'تمت إعادة تعيين كلمة المرور بنجاح', 'success');
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setSelectedUser(null);
      }
    } catch (err) {
      showToast(err.message || 'فشل تعيين كلمة المرور', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const res = await apiRequest(`/superadmin/users/${selectedUser._id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        showToast(res.message || 'تم حذف المستخدم بنجاح', 'success');
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'فشل حذف المستخدم', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="جاري تحميل لوحة الإدارة العليا..." />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4)', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <Card>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
            }}
          >
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            صلاحيات غير كافية
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
            هذه الصفحة مخصصة لمدير النظام العام (SuperAdmin) فقط لإدارة المسؤولين وتعيين الصلاحيات.
          </p>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return <Badge variant="danger">مدير عام (SuperAdmin)</Badge>;
      case 'admin':
        return <Badge variant="info">مسؤول (Admin)</Badge>;
      case 'owner':
        return <Badge variant="warning">مالك ملعب (Owner)</Badge>;
      default:
        return <Badge variant="neutral">لاعب (Player)</Badge>;
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-6) var(--space-4)' }}>
      {/* Top Header */}
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
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              إدارة المسؤولين والصلاحيات
            </h1>
            <Badge variant="danger">SuperAdmin</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
            التحكم الكامل في حسابات الإدارة والمشرفين وملاك الملاعب والتنقل بين الحسابات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            icon={RefreshCw}
            disabled={refreshing}
          >
            تحديث
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            icon={UserPlus}
          >
            إضافة مسؤول جديد
          </Button>
        </div>
      </div>

      {/* Global Stats Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <Card style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  المسؤولين والمشرفين
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--info)', marginTop: '2px' }}>
                  {stats.adminsCount + stats.superAdminsCount}
                </div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                <ShieldCheck size={20} />
              </div>
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  ملاك الملاعب
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)', marginTop: '2px' }}>
                  {stats.ownersCount}
                </div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                <Briefcase size={20} />
              </div>
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  اللاعبين المسجلين
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                  {stats.playersCount}
                </div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Users size={20} />
              </div>
            </div>
          </Card>

          <Card style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  إجمالي الحجوزات
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {stats.bookingsCount}
                </div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <CalendarCheck size={20} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)' }}>
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2" style={{ flex: '1 1 280px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="input"
                placeholder="البحث بالاسم أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingRight: '36px' }}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              بحث
            </Button>
          </form>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setRoleFilter('')}
              className={`btn btn-sm ${roleFilter === '' ? 'btn-primary' : 'btn-outline'}`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`btn btn-sm ${roleFilter === 'admin' ? 'btn-primary' : 'btn-outline'}`}
            >
              المسؤولين
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('owner')}
              className={`btn btn-sm ${roleFilter === 'owner' ? 'btn-primary' : 'btn-outline'}`}
            >
              الملاك
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('player')}
              className={`btn btn-sm ${roleFilter === 'player' ? 'btn-primary' : 'btn-outline'}`}
            >
              اللاعبين
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('superadmin')}
              className={`btn btn-sm ${roleFilter === 'superadmin' ? 'btn-primary' : 'btn-outline'}`}
            >
              المدير العام
            </button>
          </div>
        </div>
      </Card>

      {/* Users & Admins Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {users.length === 0 ? (
          <div style={{ padding: 'var(--space-10) var(--space-4)', textAlign: 'center' }}>
            <Users size={32} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-2)' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>لا يوجد مستخدمين مطابقين للبحث</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>جرب تغيير خيارات التصفية أعلاه</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}>المستخدم</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}>رقم الهاتف</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}>الدور والصلاحية</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}>تاريخ الإنشاء</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'left' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = u._id === user?._id;
                  const createdDate = new Date(u.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr
                      key={u._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 'var(--radius-full)',
                              background: u.role === 'superadmin' ? 'var(--danger-light)' : u.role === 'admin' ? 'var(--info-light)' : 'var(--bg-surface-raised)',
                              color: u.role === 'superadmin' ? 'var(--danger)' : u.role === 'admin' ? 'var(--info)' : 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                              {u.name} {isCurrent && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>(أنت)</span>}
                            </span>
                            {u.email && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {u.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', direction: 'ltr', textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>
                        {u.phone || '—'}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        {getRoleBadge(u.role)}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {createdDate}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left' }}>
                        <div className="flex items-center gap-1 justify-end">
                          {/* Impersonate / Login as user button */}
                          {!isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              title={`الدخول وتصفح النظام بحساب (${u.name})`}
                              onClick={() => handleImpersonate(u)}
                              icon={LogIn}
                              style={{ minWidth: 32, padding: '0 8px', color: 'var(--primary)' }}
                            />
                          )}

                          {/* Change Role Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="تغيير الدور والصلاحية"
                            onClick={() => {
                              setSelectedUser(u);
                              setNewRole(u.role);
                              setIsRoleModalOpen(true);
                            }}
                            icon={UserCog}
                            style={{ minWidth: 32, padding: '0 8px' }}
                          />

                          {/* Reset Password Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="إعادة تعيين كلمة المرور"
                            onClick={() => {
                              setSelectedUser(u);
                              setNewPassword('');
                              setIsPasswordModalOpen(true);
                            }}
                            icon={Key}
                            style={{ minWidth: 32, padding: '0 8px' }}
                          />

                          {/* Delete Button */}
                          {!isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              title="حذف المستخدم"
                              onClick={() => {
                                setSelectedUser(u);
                                setIsDeleteModalOpen(true);
                              }}
                              icon={Trash2}
                              style={{ minWidth: 32, padding: '0 8px', color: 'var(--danger)' }}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* =========================================================================
          Modal 1: Create Admin / User
          ========================================================================= */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="إضافة مسؤول أو عضو جديد"
      >
        <form onSubmit={handleCreateAdmin} className="flex flex-col gap-3">
          <div>
            <label className="form-label required">الاسم الكامل</label>
            <input
              type="text"
              className="input"
              placeholder="مثال: كابتن عمر علي"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="form-label required">رقم الهاتف</label>
            <input
              type="tel"
              className="input"
              placeholder="مثال: 01012345678"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="form-label">البريد الإلكتروني (اختياري)</label>
            <input
              type="email"
              className="input"
              placeholder="admin@santrino.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              dir="ltr"
            />
          </div>

          <div>
            <label className="form-label required">الدور والصلاحية</label>
            <select
              className="input"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
            >
              <option value="admin">مسؤول نظام (Admin) — إدارة الحجوزات والملاعب</option>
              <option value="owner">صاحب ملعب (Owner) — إدارة ملعبه وأسعاره</option>
              <option value="superadmin">مدير عام (SuperAdmin) — تحكم كامل بالنظام</option>
              <option value="player">لاعب عادي (Player)</option>
            </select>
          </div>

          <div>
            <label className="form-label required">كلمة المرور الأولية</label>
            <input
              type="password"
              className="input"
              placeholder="لا تقل عن 6 أحرف"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2" style={{ marginTop: 'var(--space-3)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              style={{ flex: 1 }}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              style={{ flex: 1 }}
            >
              إنشاء الحساب
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          Modal 2: Change User Role
          ========================================================================= */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="تعديل دور وصلاحية المستخدم"
      >
        {selectedUser && (
          <div className="flex flex-col gap-4">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              أنت تقوم بتغيير صلاحيات الحساب: <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.name}</strong> ({selectedUser.phone})
            </p>

            <div>
              <label className="form-label">اختر الدور الجديد:</label>
              <select
                className="input"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="admin">مسؤول (Admin) — إدارة الحجوزات والملاعب</option>
                <option value="owner">مالك ملعب (Owner) — إدارة ملعبه وأسعاره</option>
                <option value="superadmin">مدير عام (SuperAdmin) — تحكم شامل بالنظام</option>
                <option value="player">لاعب (Player) — حجز عادي</option>
              </select>
            </div>

            <div className="flex gap-2" style={{ marginTop: 'var(--space-2)' }}>
              <Button
                variant="outline"
                onClick={() => setIsRoleModalOpen(false)}
                style={{ flex: 1 }}
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateRole}
                loading={submitting}
                style={{ flex: 1 }}
              >
                حفظ التغيير
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================================
          Modal 3: Reset Password
          ========================================================================= */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="إعادة تعيين كلمة المرور"
      >
        {selectedUser && (
          <div className="flex flex-col gap-4">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              تعيين كلمة مرور جديدة للمستخدم: <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.name}</strong>
            </p>

            <div>
              <label className="form-label required">كلمة المرور الجديدة</label>
              <input
                type="password"
                className="input"
                placeholder="أدخل 6 أحرف أو أرقام على الأقل"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-2" style={{ marginTop: 'var(--space-2)' }}>
              <Button
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                style={{ flex: 1 }}
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={handleResetPassword}
                loading={submitting}
                style={{ flex: 1 }}
              >
                تحديث كلمة المرور
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================================
          Modal 4: Delete User Confirmation
          ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف الحساب"
      >
        {selectedUser && (
          <div className="flex flex-col gap-4 text-center">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-full)',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                هل أنت متأكد من حذف الحساب؟
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 'var(--space-1)' }}>
                سيتم حذف حساب <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.name}</strong> ({selectedUser.phone}) نهائياً من النظام.
              </p>
            </div>

            <div className="flex gap-2" style={{ marginTop: 'var(--space-2)' }}>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                style={{ flex: 1 }}
              >
                تراجع
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteUser}
                loading={submitting}
                style={{ flex: 1 }}
              >
                نعم، احذف الحساب
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

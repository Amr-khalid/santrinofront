'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    // 1. Restore cached user and impersonation state synchronously upon client mount
    try {
      const saved = localStorage.getItem('santrino_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
      const originalToken = localStorage.getItem('santrino_original_token');
      if (originalToken) {
        setIsImpersonating(true);
      }
    } catch (e) {
      console.warn('Failed to parse cached user:', e);
    }

    // 2. Validate session with server if token exists
    const checkAuth = async () => {
      const token = localStorage.getItem('santrino_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiRequest('/auth/me');
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('santrino_user', JSON.stringify(res.data));
        }
      } catch (err) {
        // ONLY clear session if server explicitly returns 401 (expired/invalid token)
        if (err.status === 401) {
          console.warn('Token expired (401), logging out');
          logout();
        } else {
          console.warn('checkAuth server connection error, keeping cached user session:', err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (phone, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });

    if (res && res.success && res.data) {
      localStorage.setItem('santrino_token', res.data.token);
      localStorage.setItem('santrino_user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    }
    throw new Error(res?.message || 'فشل تسجيل الدخول، تأكد من البيانات');
  };

  const register = async (name, phone, password, role = 'player') => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, phone, password, role }),
    });

    if (res && res.success && res.data) {
      localStorage.setItem('santrino_token', res.data.token);
      localStorage.setItem('santrino_user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    }
    throw new Error(res?.message || 'فشل إنشاء الحساب، يرجى التحقق من البيانات');
  };

  const loginWithGoogle = async (googleData) => {
    const res = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });

    if (res.success && res.data) {
      localStorage.setItem('santrino_token', res.data.token);
      localStorage.setItem('santrino_user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    }
  };

  const updateProfile = async (profileData) => {
    const res = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (res.success && res.data) {
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem('santrino_user', JSON.stringify(updated));
      return res.data;
    }
  };


  const impersonateUser = async (targetUserId) => {
    const originalToken = localStorage.getItem('santrino_token');
    const originalUser = localStorage.getItem('santrino_user');

    const res = await apiRequest(`/superadmin/impersonate/${targetUserId}`, {
      method: 'POST',
    });

    if (res.success && res.data) {
      if (!localStorage.getItem('santrino_original_token')) {
        localStorage.setItem('santrino_original_token', originalToken);
        localStorage.setItem('santrino_original_user', originalUser);
      }

      localStorage.setItem('santrino_token', res.data.token);
      localStorage.setItem('santrino_user', JSON.stringify(res.data));
      setUser(res.data);
      setIsImpersonating(true);
      return res.data;
    }
    throw new Error(res?.message || 'فشل التبديل للحساب المطلوب');
  };

  const stopImpersonation = () => {
    const originalToken = localStorage.getItem('santrino_original_token');
    const originalUser = localStorage.getItem('santrino_original_user');

    if (originalToken && originalUser) {
      localStorage.setItem('santrino_token', originalToken);
      localStorage.setItem('santrino_user', originalUser);
      localStorage.removeItem('santrino_original_token');
      localStorage.removeItem('santrino_original_user');

      try {
        const parsed = JSON.parse(originalUser);
        setUser(parsed);
      } catch (e) {
        setUser(null);
      }
      setIsImpersonating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('santrino_token');
    localStorage.removeItem('santrino_user');
    localStorage.removeItem('santrino_original_token');
    localStorage.removeItem('santrino_original_user');
    setIsImpersonating(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        updateProfile,
        logout,
        impersonateUser,
        stopImpersonation,
        isImpersonating,
        isOwner: user?.role === 'owner' || user?.role === 'admin' || user?.role === 'superadmin',
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
        isSuperAdmin: user?.role === 'superadmin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

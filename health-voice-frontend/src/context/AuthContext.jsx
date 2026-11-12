import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-restore session từ localStorage khi khởi động
  useEffect(() => {
    const storedToken = localStorage.getItem('hv_token');
    const storedUser = localStorage.getItem('hv_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('hv_token');
        localStorage.removeItem('hv_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const payload = res?.data || res;
    const jwtToken = payload.accessToken || payload.token || res.accessToken || res.token;
    
    // Chuẩn hóa vai trò: ROLE_ADMIN -> ADMIN, ROLE_DOCTOR -> DOCTOR, ROLE_LISTENER -> PATIENT
    let roleRaw = payload.role || payload.data?.role || res.role || '';
    if (roleRaw.startsWith('ROLE_')) {
      roleRaw = roleRaw.replace('ROLE_', '');
    }
    const cleanRole = (roleRaw === 'LISTENER' || roleRaw === 'PATIENT') ? 'PATIENT' : roleRaw;

    const userObj = {
      id: payload.id || payload.data?.id || res.id,
      username: payload.username || payload.data?.username || res.username || credentials.username,
      fullName: payload.fullName || payload.data?.fullName || res.fullName || payload.username,
      email: payload.email || payload.data?.email || res.email,
      role: cleanRole,
    };

    localStorage.setItem('hv_token', jwtToken);
    localStorage.setItem('accessToken', jwtToken);
    localStorage.setItem('hv_user', JSON.stringify(userObj));
    localStorage.setItem('currentUser', JSON.stringify(userObj));

    setToken(jwtToken);
    setUser(userObj);
    return userObj;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hv_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('hv_user');
    localStorage.removeItem('currentUser');
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  }, [user]);

  const isAuthenticated = !!token && !!user;
  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      isPatient,
      isDoctor,
      isAdmin,
      login,
      register,
      logout,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;

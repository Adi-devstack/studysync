import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem('token', nextToken);
      setToken(nextToken);
    }
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/users/me');
        const userData = res.data?.user || res.data;
        persistAuth(storedToken, userData);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [persistAuth, logout]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    persistAuth(newToken, userData);
    return userData;
  };

  const register = async (email, password, full_name) => {
    const res = await api.post('/auth/register', { email, password, full_name });
    const { token: newToken, user: userData } = res.data;
    persistAuth(newToken, userData);
    return userData;
  };

  const updateUser = async (data) => {
    const res = await api.put('/users/me', data);
    const updated = res.data?.user || res.data;
    persistAuth(token, updated);
    return updated;
  };

  const refreshUser = async () => {
    const res = await api.get('/users/me');
    const updated = res.data?.user || res.data;
    persistAuth(token, updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

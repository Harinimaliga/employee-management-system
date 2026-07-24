import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, id, username: uName, email, role } = response.data;
      const userData = { id, username: uName, email, role };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

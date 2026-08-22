import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate auth state on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    if (storedUser && storedToken && storedRole) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { user: loggedUser, token: loggedToken, role: loggedRole } = response.data;
      
      setUser(loggedUser);
      setToken(loggedToken);
      setRole(loggedRole);
      
      localStorage.setItem('user', JSON.stringify(loggedUser));
      localStorage.setItem('token', loggedToken);
      localStorage.setItem('role', loggedRole);
      
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout request failed, cleaning local state anyway", err);
    } finally {
      setUser(null);
      setToken(null);
      setRole(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setLoading(false);
    }
  };

  const registerStudent = async (data) => {
    return await authService.registerStudent(data);
  };

  const registerStaff = async (data) => {
    return await authService.registerStaff(data);
  };

  const verifyOtp = async (email, otp) => {
    return await authService.verifyOtp(email, otp);
  };

  const value = {
    user,
    token,
    role,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    registerStudent,
    registerStaff,
    verifyOtp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
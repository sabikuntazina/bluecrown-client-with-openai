'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Fetch current user profile on load
  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        // Also fetch notifications if user exists
        fetchNotifications(token);
      } else {
        // Token is invalid/expired
        localStorage.removeItem('bc_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('bc_token');
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async (token) => {
    const activeToken = token || localStorage.getItem('bc_token');
    if (!activeToken) return;

    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Register
  const register = async (name, email, password, role, photoUrl) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, photoUrl })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('bc_token', data.token);
        setUser(data.user);
        Swal.fire({
          title: 'Success!',
          text: data.message,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        router.push('/dashboard');
        return { success: true };
      } else {
        Swal.fire({
          title: 'Registration Failed',
          text: data.message || 'Something went wrong.',
          icon: 'error'
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to connect to the server.',
        icon: 'error'
      });
      return { success: false, message: 'Server connection failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('bc_token', data.token);
        setUser(data.user);
        Swal.fire({
          title: 'Success!',
          text: data.message,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        router.push('/dashboard');
        return { success: true };
      } else {
        Swal.fire({
          title: 'Login Failed',
          text: data.message || 'Invalid credentials.',
          icon: 'error'
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to connect to the server.',
        icon: 'error'
      });
      return { success: false, message: 'Server connection failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async (googleUser) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/google-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: googleUser.name,
          email: googleUser.email,
          photoUrl: googleUser.picture
        })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('bc_token', data.token);
        setUser(data.user);
        Swal.fire({
          title: 'Google Login Success!',
          text: data.message,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        router.push('/dashboard');
        return { success: true };
      } else {
        Swal.fire({
          title: 'Google Sign-In Failed',
          text: data.message || 'Google authentication failed.',
          icon: 'error'
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to connect to the server.',
        icon: 'error'
      });
      return { success: false, message: 'Server connection failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('bc_token');
    setUser(null);
    setNotifications([]);
    Swal.fire({
      title: 'Logged Out',
      text: 'You have logged out successfully.',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false
    });
    router.push('/');
  };

  // Update credits locally (e.g. after contributing or purchasing)
  const updateCreditsLocally = (creditsChange) => {
    if (user) {
      setUser(prev => ({
        ...prev,
        credits: prev.credits + creditsChange
      }));
    }
  };

  // Refresh profile details (helpful to sync credits)
  const refreshUser = async () => {
    const token = localStorage.getItem('bc_token');
    if (token) {
      await fetchProfile(token);
    }
  };

  // Mark notifications as read
  const markNotificationsRead = async () => {
    const token = localStorage.getItem('bc_token');
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/mark-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Mark local states read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      notifications,
      showNotifications,
      setShowNotifications,
      register,
      login,
      loginWithGoogle,
      logout,
      updateCreditsLocally,
      refreshUser,
      fetchNotifications,
      markNotificationsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

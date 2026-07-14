'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Incorrect email or password.');
    }
  };

  const handleGoogleSignIn = async () => {
    // Generate a mock google account sign in
    const mockGoogleProfile = {
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    };
    
    setIsSubmitting(true);
    await loginWithGoogle(mockGoogleProfile);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="card w-full max-w-md bg-white rounded-3xl shadow-lg border border-slate-100 p-8 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800">Welcome Back</h1>
          <p className="text-slate-400 text-sm font-light">Login to manage your crowdfunding campaigns and credits.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error rounded-2xl flex items-start gap-2 text-xs py-3">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-slate-600">Email Address</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FiMail />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-slate-600">Password</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FiLock />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full rounded-xl text-white font-bold tracking-wide mt-4"
          >
            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider text-xs text-slate-400 uppercase tracking-widest">or</div>

        {/* Google sign-in */}
        <button
          onClick={handleGoogleSignIn}
          type="button"
          disabled={isSubmitting}
          className="btn btn-outline btn-neutral w-full rounded-xl flex items-center gap-2 border-slate-200 hover:bg-slate-50 font-bold"
        >
          <FcGoogle className="w-5 h-5" /> Sign in with Google
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}

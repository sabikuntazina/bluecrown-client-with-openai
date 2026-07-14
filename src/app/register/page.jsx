'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiImage, FiBriefcase } from 'react-icons/fi';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('supporter');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY || '5a8ac52a0ed2b98f51f8625063adc5c9';

  // Handle imgBB image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setPhotoUrl(data.data.url);
      } else {
        setError('Image upload failed. Please try a different image or enter a URL.');
      }
    } catch (err) {
      console.error('imgBB upload error:', err);
      setError('Connection to image server failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !role) {
      setError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password, role, photoUrl);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="card w-full max-w-md bg-white rounded-3xl shadow-lg border border-slate-100 p-8 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800">Get Started</h1>
          <p className="text-slate-400 text-sm font-light">Join BlueCrown. Back or raise campaigns instantly.</p>
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
          
          {/* Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-slate-600">Full Name</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FiUser />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                required
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                required
              />
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-slate-600">Select Role</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FiBriefcase />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="select select-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-semibold text-slate-600"
              >
                <option value="supporter">Supporter (Get 50 Credits by default)</option>
                <option value="creator">Creator (Get 20 Credits by default)</option>
              </select>
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-slate-600">Profile Picture (imgBB Upload)</span>
            </label>
            <div className="flex flex-col gap-2">
              <div className="relative w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input file-input-bordered file-input-primary file-input-sm w-full rounded-xl"
                />
              </div>
              
              {/* Optional Manual URL input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <FiImage />
                </span>
                <input
                  type="url"
                  placeholder="Or enter image URL manually"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="input input-bordered input-sm w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-xs"
                />
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Uploading to imgBB...</span>
                </div>
              )}

              {photoUrl && !isUploading && (
                <div className="flex items-center gap-2 pt-1">
                  <img src={photoUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border" />
                  <span className="text-[10px] text-emerald-600 font-semibold">Image uploaded successfully!</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="btn btn-primary w-full rounded-xl text-white font-bold tracking-wide mt-4"
          >
            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Register'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}

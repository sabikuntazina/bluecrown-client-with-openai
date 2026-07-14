'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const { loading } = useAuth();
  const isDashboard = pathname ? pathname.startsWith('/dashboard') : false;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          {/* Custom animated loader */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 shadow-lg animate-bounce">
            <div className="w-6 h-6 rounded-full bg-white animate-ping"></div>
          </div>
          <p className="text-slate-500 font-semibold animate-pulse tracking-wide">Loading BlueCrown...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboard && <Navbar />}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
}

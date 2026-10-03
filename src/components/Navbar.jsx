'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiCompass, FiLayers, FiDollarSign, FiLogOut, FiMenu, FiGithub, FiUser } from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  

  return (
    <div className="sticky top-0 z-50 navbar glass-panel shadow-sm px-4 md:px-8 border-b border-slate-200/50">
      {/* Navbar Start */}
      <div className="navbar-start">
        {/* Mobile Dropdown */}
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden text-slate-700">
            <FiMenu className="h-5 w-5" />
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white rounded-box w-52 border border-slate-100"
          >
            <li>
              <Link href="/explore" className="flex items-center gap-2 py-2">
                <FiCompass /> Explore Campaigns
              </Link>
            </li>
            {!user ? (
              <>
                <li>
                  <Link href="/login" className="flex items-center gap-2 py-2">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="flex items-center gap-2 py-2">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link href="/dashboard" className="flex items-center gap-2 py-2">
                  <FiLayers /> Dashboard
                </Link>
              </li>
            )}
            
          </ul>
        </div>

        {/* CSS-Only Minimalist Geometric Logo (No Crown) */}
        <Link href="/" className="flex items-center gap-2 group normal-case text-xl font-bold tracking-tight">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-teal-400 shadow-md group-hover:scale-105 transition-transform">
            {/* Minimalist overlapping circle shapes inside logo */}
            <div className="w-4 h-4 rounded-full bg-white/30 backdrop-blur-xs absolute -top-1 -left-1"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-white/40 backdrop-blur-xs absolute -bottom-0.5 -right-0.5"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white absolute"></div>
          </div>
          <span className="font-extrabold text-slate-800 transition-colors group-hover:text-blue-600">
            Blue<span className="text-blue-600">Crown</span>
          </span>
        </Link>
      </div>

      {/* Navbar Center (Desktop Links) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1 font-medium text-slate-600">
          <li>
            <Link href="/explore" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg">
              <FiCompass className="w-4 h-4" /> Explore Campaigns
            </Link>
          </li>
          {user && (
            <li>
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg">
                <FiLayers className="w-4 h-4" /> Dashboard
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end gap-3">
        {/* Available Credits badge for logged in users */}
        {user && (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 shadow-xs font-semibold text-sm">
            <FaCoins className="text-amber-500 animate-pulse-subtle" />
            <span>{user.credits ?? 0} Credits</span>
          </div>
        )}

      

        {/* Auth Actions */}
        {!user ? (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm font-semibold text-slate-700 hover:bg-slate-100">
              Login
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm rounded-full shadow-md text-white font-semibold">
              Register
            </Link>
          </div>
        ) : (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar border border-slate-200 hover:border-blue-500 transition-colors">
              <div className="w-10 rounded-full">
                <img
                  src={user.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-white rounded-xl w-60 border border-slate-100"
            >
              <div className="px-4 py-2 border-b border-slate-100 mb-2">
                <p className="font-bold text-slate-800 text-sm leading-tight truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate mb-1">{user.email}</p>
                <span className="badge badge-primary badge-sm text-[10px] capitalize font-bold tracking-wider">
                  {user.role}
                </span>
              </div>
              <li>
                <Link href="/dashboard" className="flex items-center gap-2 py-2">
                  <FiUser /> View Dashboard
                </Link>
              </li>
              <li>
                <button onClick={logout} className="flex items-center gap-2 py-2 text-red-600 hover:bg-red-50">
                  <FiLogOut /> Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

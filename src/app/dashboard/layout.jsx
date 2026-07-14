'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FiHome, FiCompass, FiFolderPlus, FiFileText, FiDollarSign, 
  FiCheckCircle, FiUsers, FiTrash2, FiAlertOctagon, FiLogOut, 
  FiBell, FiChevronRight, FiGrid, FiUser
} from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';

export default function DashboardLayout({ children }) {
  const { 
    user, loading, notifications, showNotifications, setShowNotifications,
    logout, markNotificationsRead, fetchNotifications 
  } = useAuth();
  
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not logged in after loading finishes
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);

  // Periodically refresh notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 15000); // refresh every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-ring loading-lg text-blue-600"></span>
          <p className="text-slate-500 font-semibold tracking-wide">Securing Session...</p>
        </div>
      </div>
    );
  }

  // Double check user profile exists
  if (!user) return null;

  // Define sidebar menus based on role
  const getSidebarMenu = () => {
    const role = user.role.toLowerCase();
    
    if (role === 'supporter') {
      return [
        { name: 'Dashboard Home', path: '/dashboard', icon: <FiHome /> },
        { name: 'Explore Campaigns', path: '/explore', icon: <FiCompass /> },
        { name: 'My Contributions', path: '/dashboard/my-contributions', icon: <FiFileText /> },
        { name: 'Purchase Credit', path: '/dashboard/purchase-credit', icon: <FiDollarSign /> },
        { name: 'Payment History', path: '/dashboard/payment-history', icon: <FiFileText /> },
      ];
    }
    
    if (role === 'creator') {
      return [
        { name: 'Creator Home', path: '/dashboard', icon: <FiHome /> },
        { name: 'Add New Campaign', path: '/dashboard/add-campaign', icon: <FiFolderPlus /> },
        { name: 'My Campaigns', path: '/dashboard/my-campaigns', icon: <FiGrid /> },
        { name: 'Withdrawals', path: '/dashboard/withdrawals', icon: <FiDollarSign /> },
        { name: 'Payment History', path: '/dashboard/payment-history', icon: <FiFileText /> },
      ];
    }

    if (role === 'admin') {
      return [
        { name: 'Admin Home', path: '/dashboard', icon: <FiHome /> },
        { name: 'Campaign Approvals', path: '/dashboard/campaign-approvals', icon: <FiCheckCircle /> },
        { name: 'Withdrawal Requests', path: '/dashboard/withdrawal-requests', icon: <FiDollarSign /> },
        { name: 'Manage Users', path: '/dashboard/manage-users', icon: <FiUsers /> },
        { name: 'Manage Campaigns', path: '/dashboard/manage-campaigns', icon: <FiTrash2 /> },
        { name: 'Reports', path: '/dashboard/reports', icon: <FiAlertOctagon /> },
      ];
    }

    return [];
  };

  const menuItems = getSidebarMenu();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      
      {/* 1. TOP DASHBOARD NAV */}
      <header className="h-16 glass-panel border-b border-slate-200/50 flex items-center justify-between px-4 md:px-8 z-30 sticky top-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-white">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <span className="text-slate-800 font-extrabold text-lg">
            Blue<span className="text-blue-600">Crown</span>
          </span>
        </Link>

        {/* Right Nav Options */}
        <div className="flex items-center gap-4">
          
          {/* Credit balance display */}
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full border border-blue-100 font-semibold text-xs shadow-xs">
            <FaCoins className="text-amber-500 animate-pulse-subtle" />
            <span>{user.credits} Credits Available</span>
          </div>

          {/* User badge */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <img 
              src={user.photoUrl} 
              alt={user.name} 
              className="w-8 h-8 rounded-full object-cover border border-blue-500 shadow-xs" 
            />
            <div className="hidden md:block text-left">
              <h4 className="text-xs font-bold text-slate-805 leading-tight truncate max-w-28">{user.name}</h4>
              <span className="badge badge-primary badge-xs text-[9px] capitalize px-1.5 font-bold tracking-wider">{user.role}</span>
            </div>
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsRead();
              }}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              )}
            </button>

            {/* FLOATING NOTIFICATIONS POPUP */}
            {showNotifications && (
              <>
                {/* Backdrop interceptor to close popup on click anywhere */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                ></div>
                
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 space-y-3 z-50 animate-pulse-subtle">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Notifications</h3>
                    <span className="badge badge-primary badge-xs text-[10px]">{notifications.length} Total</span>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-slate-400 text-xs py-4 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          onClick={() => {
                            setShowNotifications(false);
                            if (notif.actionRoute) router.push(notif.actionRoute);
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all text-left space-y-1"
                        >
                          <p className="text-slate-600 text-xs leading-normal font-light">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-slate-400 font-semibold block">
                            {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.time).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Logout */}
          <button 
            onClick={logout}
            className="btn btn-ghost btn-circle btn-sm text-slate-600 hover:text-red-500 hover:bg-red-50"
            title="Logout"
          >
            <FiLogOut className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* 2. BODY DRAWER GRID */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Drawer */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-400 flex flex-col justify-between border-r border-slate-800 md:h-[calc(100vh-64px)] md:sticky md:top-16">
          <div className="p-4 space-y-6">
            
            {/* User Mini Banner */}
            <div className="bg-slate-850 p-4 rounded-2xl flex items-center gap-3 border border-slate-800">
              <img src={user.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" />
              <div>
                <h3 className="font-extrabold text-white text-sm truncate max-w-36">{user.name}</h3>
                <span className="text-[10px] text-teal-400 uppercase tracking-widest font-bold font-mono">{user.role}</span>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    <span>{item.name}</span>
                    {isActive && <FiChevronRight className="ml-auto" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer inside sidebar */}
          <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
            BlueCrown Dashboard v1.0
          </div>
        </aside>

        {/* Content Render Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
          {children}
        </main>

      </div>

    </div>
  );
}

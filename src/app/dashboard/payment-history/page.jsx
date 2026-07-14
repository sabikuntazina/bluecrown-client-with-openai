'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiDollarSign, FiClock, FiFileText } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') 
      ? 'https://bluecrown-server-with-openai.vercel.app/api' 
      : 'http://localhost:5000/api');
  if (rawApiUrl.endsWith('/')) {
    rawApiUrl = rawApiUrl.slice(0, -1);
  }
  if (!rawApiUrl.endsWith('/api')) {
    rawApiUrl += '/api';
  }
  const API_URL = rawApiUrl;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('bc_token');
        const role = user.role.toLowerCase();
        
        let endpoint = '';
        if (role === 'supporter') {
          endpoint = `${API_URL}/payments/supporter-history`;
        } else if (role === 'creator') {
          endpoint = `${API_URL}/withdrawals/creator`;
        } else {
          setLoading(false);
          return;
        }

        const res = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        } else {
          Swal.fire('Error', 'Failed to retrieve payment history.', 'error');
        }
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [user]);

  if (loading) {
    return <div className="skeleton h-60 w-full rounded-3xl"></div>;
  }

  if (!user) return null;
  const role = user.role.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-extrabold text-slate-805 flex items-center gap-2">
          <FiDollarSign /> {role === 'supporter' ? 'Purchase History' : 'Withdrawal History'}
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          {role === 'supporter' 
            ? 'Track your Stripe purchases and credit package additions.' 
            : 'Track the status of your credit earnings withdrawals.'}
        </p>
      </div>

      {/* Table view */}
      <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <FiClock className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">No transactions found.</p>
            </div>
          ) : role === 'supporter' ? (
            /* Supporter Table */
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-455 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Transaction Date</th>
                  <th>Amount Paid</th>
                  <th>Credits Purchased</th>
                  <th>Stripe Reference ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 border-b border-slate-50">
                    <td className="font-semibold text-slate-700">{new Date(tx.date).toLocaleString()}</td>
                    <td>${tx.amount.toFixed(2)}</td>
                    <td className="font-bold text-blue-600">+{tx.credits} Credits</td>
                    <td className="font-mono text-[10px] text-slate-400">{tx.paymentIntentId}</td>
                    <td>
                      <span className="badge badge-success badge-sm text-white font-bold text-[9px] capitalize">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Creator Table */
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-455 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Request Date</th>
                  <th>Credits Withdrawn</th>
                  <th>Earnings (USD)</th>
                  <th>Payment System</th>
                  <th>Account Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => {
                  let statusBadge = 'badge-ghost';
                  if (tx.status === 'approved') statusBadge = 'badge-success text-white';
                  if (tx.status === 'pending') statusBadge = 'badge-warning text-white animate-pulse-subtle';

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50 border-b border-slate-50">
                      <td className="font-semibold text-slate-700">{new Date(tx.withdrawDate).toLocaleString()}</td>
                      <td className="font-bold text-amber-600">-{tx.withdrawalCredit} Credits</td>
                      <td className="font-bold text-slate-800">${tx.withdrawalAmount.toFixed(2)}</td>
                      <td className="capitalize font-semibold">{tx.paymentSystem}</td>
                      <td className="font-mono text-slate-550">{tx.accountNumber}</td>
                      <td>
                        <span className={`badge badge-sm font-bold text-[9px] capitalize ${statusBadge}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

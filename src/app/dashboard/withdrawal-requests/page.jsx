'use client';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FiDollarSign, FiInfo, FiCheckCircle } from 'react-icons/fi';

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState([]);
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

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/withdrawals/admin/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Error fetching withdrawal requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handlePaymentSuccess = async (id, creatorName, amountUSD, credits) => {
    Swal.fire({
      title: 'Confirm Payment Success?',
      text: `Confirming will mark withdrawal of $${amountUSD.toFixed(2)} (${credits} credits) by ${creatorName} as approved.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Payment Success'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('bc_token');
          const res = await fetch(`${API_URL}/withdrawals/${id}/approve`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.ok) {
            Swal.fire({
              title: 'Withdrawal Completed!',
              text: 'Credits deducted and creator notified.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            fetchWithdrawals();
          } else {
            const data = await res.json();
            Swal.fire('Error', data.message || 'Failed to process withdrawal.', 'error');
          }
        } catch (err) {
          console.error('Confirm withdrawal error:', err);
        }
      }
    });
  };

  if (loading) {
    return <div className="skeleton h-60 w-full rounded-3xl"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-extrabold text-slate-805 flex items-center gap-2">
          <FiDollarSign /> Creator Withdrawal Requests
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review cash-out requests submitted by creators. Processing will deduct credits from their account.</p>
      </div>

      {/* Table Card */}
      <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <FiInfo className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">No pending withdrawal requests found.</p>
            </div>
          ) : (
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-455 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Creator Name</th>
                  <th>Creator Email</th>
                  <th>Credits Requested</th>
                  <th>Value (USD)</th>
                  <th>Payment Method</th>
                  <th>Account Number</th>
                  <th>Date Requested</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 border-b border-slate-50">
                    <td className="font-bold text-slate-700">{r.creatorName}</td>
                    <td>{r.creatorEmail}</td>
                    <td className="font-bold text-amber-600">-{r.withdrawalCredit} Credits</td>
                    <td className="font-bold text-slate-800">${r.withdrawalAmount.toFixed(2)}</td>
                    <td className="capitalize font-semibold">{r.paymentSystem}</td>
                    <td className="font-mono text-slate-500">{r.accountNumber}</td>
                    <td>{new Date(r.withdrawDate).toLocaleDateString()}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handlePaymentSuccess(r._id, r.creatorName, r.withdrawalAmount, r.withdrawalCredit)}
                        className="btn btn-success btn-xs rounded-lg text-white font-bold flex items-center gap-1 ml-auto"
                      >
                        <FiCheckCircle /> Payment Success
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

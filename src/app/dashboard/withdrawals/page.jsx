'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';
import { FiDollarSign, FiInfo, FiCreditCard } from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';

export default function WithdrawalsPage() {
  const { user, refreshUser } = useAuth();
  
  // Form states
  const [creditsToWithdraw, setCreditsToWithdraw] = useState('');
  const [paymentSystem, setPaymentSystem] = useState('Stripe');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  if (!user) return null;

  // Earnings calculations
  const totalRaisedCredits = user.credits ?? 0;
  const totalRaisedDollars = totalRaisedCredits / 20;

  // Calculate USD dynamically when credits field changes
  const creditsVal = Number(creditsToWithdraw);
  const calculatedUSD = !isNaN(creditsVal) && creditsVal > 0 ? (creditsVal / 20).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!creditsToWithdraw || !paymentSystem || !accountNumber) {
      setError('All fields are required.');
      return;
    }

    const creditsNum = Number(creditsToWithdraw);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      setError('Please enter a positive number of credits.');
      return;
    }

    if (creditsNum < 200) {
      setError('Minimum withdrawal limit is 200 credits ($10).');
      return;
    }

    if (creditsNum > totalRaisedCredits) {
      setError(`Insufficient credit balance. You can withdraw a maximum of ${totalRaisedCredits} credits.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          withdrawalCredit: creditsNum,
          paymentSystem,
          accountNumber
        })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Withdrawal Requested!',
          text: `Your request to withdraw $${(creditsNum / 20).toFixed(2)} (${creditsNum} credits) is pending admin approval.`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        
        setCreditsToWithdraw('');
        setAccountNumber('');
        await refreshUser(); // Update balance
      } else {
        setError(data.message || 'Withdrawal request failed.');
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      setError('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-extrabold text-slate-805 flex items-center gap-2">
          <FiDollarSign /> Request Withdrawal
        </h1>
        <p className="text-slate-500 text-xs mt-1">Convert your raised campaign credits into cash. 20 credits = $1 USD. Minimum withdrawal is 200 credits ($10 USD).</p>
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl py-3 px-4 flex items-start gap-2">
          <FiInfo className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats and Form */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Earnings Stats Card */}
        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs grid grid-cols-2 gap-4 text-center">
          <div className="border-r border-slate-100">
            <div className="text-2xl font-extrabold text-blue-600 flex items-center justify-center gap-1.5">
              <FaCoins className="text-amber-500" /> {totalRaisedCredits}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Available Credits</p>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-850">
              ${totalRaisedDollars.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Cash Value (USD)</p>
          </div>
        </div>

        {/* Withdrawal Form Card */}
        <div className="card bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs">
          {totalRaisedCredits < 200 ? (
            <div className="text-center py-6 space-y-3">
              <FiInfo className="w-12 h-12 text-slate-350 mx-auto animate-bounce" />
              <div className="text-red-500 font-bold text-sm">Insufficient credit</div>
              <p className="text-slate-400 text-xs max-w-sm mx-auto font-light leading-relaxed">
                You must raise a minimum of **200 credits ($10 USD)** to request a withdrawal. Pledges are currently at {totalRaisedCredits} credits.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Credits to Withdraw */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-600">Credits to Withdraw</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <FaCoins className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    placeholder="Minimum 200 credits"
                    value={creditsToWithdraw}
                    onChange={(e) => setCreditsToWithdraw(e.target.value)}
                    max={totalRaisedCredits}
                    min="200"
                    className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                    required
                  />
                </div>
              </div>

              {/* USD Value (non-editable) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-600">Equivalent Cash Value ($ USD)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <FiDollarSign />
                  </span>
                  <input
                    type="text"
                    value={`$${calculatedUSD}`}
                    readOnly
                    className="input input-bordered w-full pl-10 rounded-xl bg-slate-50 text-slate-500 font-bold text-sm border-slate-200 outline-hidden"
                  />
                </div>
              </div>

              {/* Payment System selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-600">Select Payment System</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <FiCreditCard />
                  </span>
                  <select
                    value={paymentSystem}
                    onChange={(e) => setPaymentSystem(e.target.value)}
                    className="select select-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-semibold text-slate-600"
                  >
                    <option value="Stripe">Stripe Checkout</option>
                    <option value="bKash">bKash (Mobile Wallet)</option>
                    <option value="Rocket">Rocket (Mobile Wallet)</option>
                    <option value="Nagad">Nagad (Mobile Wallet)</option>
                  </select>
                </div>
              </div>

              {/* Account Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-600">Account / Phone Number</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Card number or Mobile number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="input input-bordered w-full rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full rounded-xl text-white font-bold mt-4"
              >
                {isSubmitting ? <span className="loading loading-spinner"></span> : 'Request Withdrawal'}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}

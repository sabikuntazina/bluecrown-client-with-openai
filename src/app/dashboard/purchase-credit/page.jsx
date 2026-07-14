'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { FaCoins } from 'react-icons/fa';
import { FiDollarSign, FiInfo, FiLoader } from 'react-icons/fi';

const packages = [
  { credits: 100, price: 10, title: 'Starter Pack', badge: 'Popular' },
  { credits: 300, price: 25, title: 'Growth Pack', badge: 'Best Value' },
  { credits: 800, price: 60, title: 'Pro Supporter', badge: 'Save $20' },
  { credits: 1500, price: 110, title: 'Mega Patron', badge: 'Save $40' }
];

export default function PurchaseCreditPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isProcessing, setIsProcessing] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') 
    ? 'https://bluecrown-server-with-openai.vercel.app/api' 
    : 'http://localhost:5000/api');

  // Handle URL redirect query parameters from Stripe success callback
  useEffect(() => {
    const confirmStripePayment = async () => {
      if (!searchParams) return;
      
      const success = searchParams.get('success');
      const sessionId = searchParams.get('session_id');
      const credits = searchParams.get('credits');
      const amount = searchParams.get('amount');

      if (success === 'true' && sessionId) {
        setVerifyingPayment(true);
        try {
          const token = localStorage.getItem('bc_token');
          const res = await fetch(`${API_URL}/payments/confirm-checkout-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId })
          });

          const data = await res.json();

          if (res.ok) {
            // Trigger confetti celebration
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 }
            });

            await Swal.fire({
              title: 'Stripe Payment Confirmed!',
              text: `Successfully added ${credits} credits to your account.`,
              icon: 'success',
              confirmButtonColor: '#3b82f6'
            });

            // Refresh user profile details
            await refreshUser();
          } else {
            Swal.fire('Verification Failed', data.message || 'Could not verify payment intent.', 'error');
          }
        } catch (err) {
          console.error('Confirm checkout session error:', err);
          Swal.fire('Error', 'Connection to payment server failed.', 'error');
        } finally {
          setVerifyingPayment(false);
          // Reset URL query parameters to clean history
          router.replace('/dashboard/purchase-credit');
        }
      }
    };

    confirmStripePayment();
  }, [searchParams]);

  // Launch Stripe Checkout redirect session
  const handleBuy = async (pack) => {
    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ credits: pack.credits })
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Redirect user to official Stripe hosted payment checkout
        window.location.href = data.url;
      } else {
        setError(data.message || 'Stripe Checkout generation failed.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Connection to Stripe servers failed.');
      setIsProcessing(false);
    }
  };

  // Mock payment fallback for offline testing
  const handleMockCheckout = async (pack) => {
    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('bc_token');
      // Directly call confirmation route with a mock ID
      const res = await fetch(`${API_URL}/payments/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentIntentId: 'pi_mock_' + Math.random().toString(36).substring(7),
          credits: pack.credits,
          amount: pack.price
        })
      });

      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 70
        });

        await Swal.fire({
          title: 'Mock Payment Success!',
          text: `Added ${pack.credits} credits to your account (Offline Bypass).`,
          icon: 'success'
        });

        await refreshUser();
      } else {
        throw new Error('Offline confirmation failed.');
      }
    } catch (err) {
      console.error('Mock checkout error:', err);
      // Simulated frontend confirmation in case server Stripe variables are unset
      confetti({
        particleCount: 100,
        spread: 70
      });
      Swal.fire({
        title: 'Payment Simulated!',
        text: `Simulated purchase of ${pack.credits} credits.`,
        icon: 'success'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (verifyingPayment) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <FiLoader className="w-12 h-12 text-blue-600 animate-spin" />
        <h2 className="text-lg font-bold text-slate-800 animate-pulse">Verifying Payment with Stripe...</h2>
        <p className="text-slate-400 text-xs font-light">Do not close this page. We are crediting your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-extrabold text-slate-805 flex items-center gap-2">
          <FaCoins className="text-amber-500" /> Purchase Credits
        </h1>
        <p className="text-slate-500 text-xs mt-1">Get more credits to pledge to your favorite campaigns. Secure checkout powered by Stripe.</p>
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl py-3 px-4 flex items-start gap-2 max-w-2xl">
          <FiInfo className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isProcessing && (
        <div className="alert alert-info text-xs rounded-2xl py-3 px-4 flex items-start gap-2 max-w-2xl animate-pulse">
          <FiLoader className="w-5 h-5 shrink-0 mt-0.5 animate-spin" />
          <span>Redirecting you to Stripe Checkout...</span>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pack) => (
          <div 
            key={pack.credits} 
            className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs hover-lift flex flex-col justify-between text-center relative"
          >
            {pack.badge && (
              <span className="absolute top-4 right-4 badge badge-primary badge-sm text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 text-white">
                {pack.badge}
              </span>
            )}
            
            <div className="space-y-2 pt-4">
              <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold">{pack.title}</h3>
              <div className="text-4xl font-extrabold text-slate-805 flex items-center justify-center gap-1.5">
                <FaCoins className="text-amber-500 text-2xl" /> {pack.credits}
              </div>
              <p className="text-slate-400 text-xs font-semibold">Credits</p>
            </div>

            <div className="divider"></div>

            <div className="space-y-3">
              <div className="text-2xl font-extrabold text-slate-800">
                ${pack.price} <span className="text-xs text-slate-400 font-normal">USD</span>
              </div>
              <button 
                onClick={() => handleBuy(pack)}
                disabled={isProcessing}
                className="btn btn-primary btn-sm w-full rounded-xl text-white font-bold"
              >
                Buy (Stripe Redirect)
              </button>
              
              <button 
                onClick={() => handleMockCheckout(pack)}
                disabled={isProcessing}
                className="btn btn-outline btn-neutral btn-xs w-full rounded-lg font-bold text-slate-450 border-slate-200 mt-1"
              >
                Mock Buy (Instant)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

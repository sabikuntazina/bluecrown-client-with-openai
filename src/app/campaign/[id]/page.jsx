'use client';

import React, { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { FiClock, FiDollarSign, FiHeart, FiUser, FiInfo, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';

export default function CampaignDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [submittingContribution, setSubmittingContribution] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`${API_URL}/campaigns/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCampaign(data);
        } else {
          Swal.fire('Error', 'Campaign not found.', 'error');
          router.push('/explore');
        }
      } catch (err) {
        console.error('Error fetching campaign details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in or register to contribute credits.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Go to Login'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login');
        }
      });
      return;
    }

    if (user.role !== 'supporter') {
      Swal.fire('Restricted Action', 'Only accounts with the "Supporter" role can pledge credits.', 'warning');
      return;
    }

    const amount = Number(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Swal.fire('Invalid Amount', 'Please enter a valid contribution amount.', 'warning');
      return;
    }

    if (amount < campaign.minimumContribution) {
      Swal.fire('Minimum Pledging Rule', `This campaign requires a minimum contribution of ${campaign.minimumContribution} credits.`, 'warning');
      return;
    }

    if (user.credits < amount) {
      Swal.fire({
        title: 'Insufficient Balance',
        text: `You have ${user.credits} credits but tried to pledge ${amount}. Please purchase more credits.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Buy Credits'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/dashboard');
        }
      });
      return;
    }

    setSubmittingContribution(true);
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          campaignId: id,
          contributionAmount: amount
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        Swal.fire({
          title: 'Contribution Submitted!',
          text: 'Your contribution is successfully submitted. Once approved by the creator, the funds will be added to the campaign.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });

        setContributionAmount('');
        await refreshUser(); // Refreshes user credits balance
      } else {
        Swal.fire('Contribution Failed', data.message || 'Something went wrong.', 'error');
      }
    } catch (err) {
      console.error('Contribution API error:', err);
      Swal.fire('Error', 'Failed to submit contribution. Check your server connection.', 'error');
    } finally {
      setSubmittingContribution(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire('Login Required', 'You must be logged in to file a report.', 'info');
      return;
    }
    if (user.role !== 'supporter') {
      Swal.fire('Supporter Only', 'Only Supporters can report campaigns.', 'warning');
      return;
    }
    if (!reportReason.trim()) {
      Swal.fire('Reason Required', 'Please explain why you are reporting this campaign.', 'warning');
      return;
    }

    setSubmittingReport(true);
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/campaigns/${id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire('Report Submitted', 'Thank you. The platform administrators will review this campaign immediately.', 'success');
        setReportReason('');
        setShowReportModal(false);
      } else {
        Swal.fire('Report Failed', data.message || 'Could not file report.', 'error');
      }
    } catch (err) {
      console.error('Report submission error:', err);
      Swal.fire('Error', 'Server connection failed.', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <span className="loading loading-ring loading-lg text-blue-600"></span>
        <p className="text-slate-500 font-semibold tracking-wide mt-2">Loading Campaign Details...</p>
      </div>
    );
  }

  const percent = Math.min(Math.round((campaign.raisedAmount / campaign.fundingGoal) * 100), 100);
  const isExpired = new Date(campaign.deadline) < new Date();
  const daysLeft = Math.max(
    Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8 flex-1">
      
      {/* Campaign Top Layout (Banner + Side Info Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-[300px] md:h-[450px] w-full rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100">
            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
            <span className="absolute top-4 right-4 badge badge-neutral bg-slate-900/80 backdrop-blur-xs text-white border-0 font-bold uppercase tracking-widest px-4 py-2">
              {campaign.category}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100">
                <FiUser /> Creator: {campaign.creatorName}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100">
                <FiClock /> Deadline: {new Date(campaign.deadline).toLocaleDateString()}
              </span>
            </div>
            
            <div className="divider"></div>
            
            {/* Story */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-800">Campaign Story</h3>
              <p className="text-slate-600 text-sm font-light leading-relaxed whitespace-pre-wrap">
                {campaign.story}
              </p>
            </div>

            {/* Rewards */}
            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-bold text-slate-800">Supporter Rewards</h3>
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <FiInfo className="text-blue-600 w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-805 text-sm">Pledge Reward Tier</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed font-light">{campaign.rewardInfo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pledging Form & Progress Stats */}
        <div className="space-y-6">
          
          {/* Progress Card */}
          <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-3">
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Campaign Stats</h3>
              <div className="space-y-1">
                <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                  {campaign.raisedAmount}
                </span>
                <span className="text-slate-400 text-xs font-semibold ml-1">Credits Raised</span>
              </div>

              <progress className="progress progress-primary w-full h-3" value={percent} max="100"></progress>
              
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>{percent}% of {campaign.fundingGoal} Goal</span>
                <span>{daysLeft} days left</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 text-center">
              <div>
                <div className="text-lg font-bold text-slate-800">{campaign.minimumContribution}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Min Pledge</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{daysLeft}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Days Left</div>
              </div>
            </div>
          </div>

          {/* Contribute Card */}
          <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Support this Campaign</h3>
              <span className="text-xs text-blue-600 font-bold">20 credits = $1</span>
            </div>

            {/* Check role */}
            {user && user.role !== 'supporter' ? (
              <div className="alert alert-warning text-xs rounded-2xl py-3 px-4 flex items-start gap-2">
                <FiInfo className="w-4 h-4 mt-0.5" />
                <span>Only Supporters can pledge credits. Your current role is <strong className="capitalize">{user.role}</strong>.</span>
              </div>
            ) : isExpired ? (
              <div className="alert alert-error text-xs rounded-2xl py-3 px-4 flex items-start gap-2">
                <FiAlertTriangle className="w-4 h-4 mt-0.5" />
                <span>This campaign has ended and is no longer accepting contributions.</span>
              </div>
            ) : (
              <form onSubmit={handleContribute} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-slate-500 text-xs font-semibold">Pledge Amount (Credits)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <FaCoins className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      placeholder={`Min: ${campaign.minimumContribution} credits`}
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      min={campaign.minimumContribution}
                      className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                      required
                    />
                  </div>
                  {user && (
                    <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                      Your Available Credits: {user.credits}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submittingContribution}
                  className="btn btn-primary w-full rounded-xl text-white font-bold"
                >
                  {submittingContribution ? <span className="loading loading-spinner"></span> : 'Pledge Credits'}
                </button>
              </form>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Report Button */}
            {user && user.role === 'supporter' && (
              <button
                onClick={() => setShowReportModal(true)}
                className="btn btn-outline btn-error w-full rounded-xl flex items-center justify-center gap-2 border-red-200 hover:bg-red-50 text-xs font-semibold"
              >
                <FiAlertTriangle /> Report Campaign as Suspicious
              </button>
            )}
          </div>

        </div>
      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl p-6 max-w-md bg-white border border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <FiAlertTriangle className="text-red-500 animate-pulse" /> Report Campaign
            </h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Please explain why you believe this campaign violates terms or is fraudulent. Admin will investigate this report.
            </p>

            <form onSubmit={handleReport} className="mt-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-bold text-slate-600">Reason for Report</span>
                </label>
                <textarea
                  placeholder="Provide details about suspicious links, copycat story, or scam rewards..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="textarea textarea-bordered rounded-xl focus:border-blue-500 focus:outline-hidden text-xs min-h-24"
                  required
                ></textarea>
              </div>

              <div className="modal-action gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="btn btn-ghost btn-sm rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="btn btn-error btn-sm rounded-xl text-white font-bold"
                >
                  {submittingReport ? <span className="loading loading-spinner"></span> : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

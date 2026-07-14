'use client';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FiCheckCircle, FiXCircle, FiClock, FiInfo, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

export default function CampaignApprovalsPage() {
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
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

  const fetchPendingCampaigns = async () => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/campaigns/admin/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingCampaigns(data);
      }
    } catch (err) {
      console.error('Error fetching pending campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCampaigns();
  }, []);

  const handleApprove = async (id, title) => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/campaigns/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        Swal.fire({
          title: 'Approved!',
          text: `"${title}" has been approved and is now active for supporters.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        fetchPendingCampaigns();
      } else {
        Swal.fire('Error', 'Failed to approve campaign.', 'error');
      }
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (id, title) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Reject campaign "${title}"? Creator will be notified.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, reject it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('bc_token');
          const res = await fetch(`${API_URL}/campaigns/${id}/reject`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.ok) {
            Swal.fire('Rejected', 'Campaign was rejected and creator notified.', 'info');
            fetchPendingCampaigns();
          } else {
            Swal.fire('Error', 'Failed to reject campaign.', 'error');
          }
        } catch (err) {
          console.error('Reject error:', err);
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
          <FiClock /> Campaign Approvals
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review newly submitted creator campaigns. Approved campaigns are listed in the explore directory.</p>
      </div>

      {/* Table Card */}
      <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          {pendingCampaigns.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <FiInfo className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">No pending campaigns currently require review.</p>
            </div>
          ) : (
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-455 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Image</th>
                  <th>Title</th>
                  <th>Creator Name</th>
                  <th>Funding Goal</th>
                  <th>Min Pledge</th>
                  <th>Deadline</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingCampaigns.map((camp) => (
                  <tr key={camp._id} className="hover:bg-slate-50 border-b border-slate-50 animate-pulse-subtle">
                    <td>
                      <img src={camp.imageUrl} alt="" className="w-12 h-8 rounded-md object-cover border" />
                    </td>
                    <td className="font-bold text-slate-700 max-w-40 truncate">
                      <Link href={`/campaign/${camp._id}`} className="hover:text-blue-600 hover:underline flex items-center gap-1">
                        {camp.title} <FiExternalLink className="shrink-0 w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td>{camp.creatorName}</td>
                    <td>{camp.fundingGoal} Credits</td>
                    <td>{camp.minimumContribution} Credits</td>
                    <td>{new Date(camp.deadline).toLocaleDateString()}</td>
                    <td className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleApprove(camp._id, camp.title)}
                        className="btn btn-success btn-xs rounded-lg text-white font-bold flex items-center gap-1"
                      >
                        <FiCheckCircle /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(camp._id, camp.title)}
                        className="btn btn-error btn-xs rounded-lg text-white font-bold flex items-center gap-1"
                      >
                        <FiXCircle /> Reject
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

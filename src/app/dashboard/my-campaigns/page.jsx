'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiEdit, FiTrash2, FiClock, FiFileText, FiAward, FiInfo, FiLayers } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function MyCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editRewardInfo, setEditRewardInfo] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/campaigns/creator`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Error fetching creator campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const handleOpenEdit = (camp) => {
    setEditingCampaign(camp);
    setEditTitle(camp.title);
    setEditStory(camp.story);
    setEditRewardInfo(camp.rewardInfo);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editStory.trim() || !editRewardInfo.trim()) {
      Swal.fire('Validation Error', 'Please fill in all fields.', 'warning');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/campaigns/${editingCampaign._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          story: editStory,
          rewardInfo: editRewardInfo
        })
      });

      if (res.ok) {
        Swal.fire({
          title: 'Updated!',
          text: 'Campaign details updated successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        fetchCampaigns();
        setShowEditModal(false);
      } else {
        const data = await res.json();
        Swal.fire('Update Failed', data.message || 'Could not update campaign.', 'error');
      }
    } catch (err) {
      console.error('Update error:', err);
      Swal.fire('Error', 'Server connection failed.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id, title) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are deleting "${title}". WARNING: This will permanently delete the campaign and REFUND all approved contributors their credits!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete & refund'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('bc_token');
          const res = await fetch(`${API_URL}/campaigns/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.ok) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Campaign was removed and all supporter credits were refunded successfully.',
              icon: 'success',
              confirmButtonColor: '#3b82f6'
            });
            fetchCampaigns();
          } else {
            const data = await res.json();
            Swal.fire('Deletion Failed', data.message || 'Could not delete campaign.', 'error');
          }
        } catch (err) {
          console.error('Deletion error:', err);
          Swal.fire('Error', 'Server connection failed.', 'error');
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
          <FiLayers /> My Campaigns
        </h1>
        <p className="text-slate-500 text-xs mt-1">Manage details and status of all campaigns launched by you. Listed by deadline descending.</p>
      </div>

      {/* Campaigns Table */}
      <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <FiInfo className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">You have not launched any campaigns yet.</p>
            </div>
          ) : (
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-455 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Title</th>
                  <th>Category</th>
                  <th>Funding Goal</th>
                  <th>Credits Raised</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp) => {
                  let statusBadge = 'badge-ghost';
                  if (camp.status === 'approved') {
                    statusBadge = camp.isSuspended ? 'badge-error text-white' : 'badge-success text-white';
                  } else if (camp.status === 'pending') {
                    statusBadge = 'badge-warning text-white animate-pulse-subtle';
                  } else if (camp.status === 'rejected') {
                    statusBadge = 'badge-error text-white';
                  }

                  return (
                    <tr key={camp._id} className="hover:bg-slate-50 border-b border-slate-50">
                      <td className="font-bold text-slate-700 max-w-48 truncate">{camp.title}</td>
                      <td>{camp.category}</td>
                      <td>{camp.fundingGoal} Credits</td>
                      <td className="font-bold text-blue-600">{camp.raisedAmount} Credits</td>
                      <td>{new Date(camp.deadline).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-sm font-bold text-[9px] capitalize ${statusBadge}`}>
                          {camp.isSuspended ? 'suspended' : camp.status}
                        </span>
                      </td>
                      <td className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(camp)}
                          className="btn btn-ghost btn-circle btn-xs text-blue-600"
                          title="Edit Campaign"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(camp._id, camp.title)}
                          className="btn btn-ghost btn-circle btn-xs text-red-600"
                          title="Delete Campaign"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && editingCampaign && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl p-6 max-w-lg bg-white border border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-lg">Update Campaign</h3>
            <p className="text-slate-400 text-xs mt-1">You can edit the title, description story, and supporter rewards.</p>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-bold text-slate-600">Campaign Title</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <FiFileText />
                  </span>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                    required
                  />
                </div>
              </div>

              {/* Story */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-bold text-slate-600">Campaign Story</span>
                </label>
                <textarea
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  className="textarea textarea-bordered rounded-xl focus:border-blue-500 focus:outline-hidden text-sm min-h-28"
                  required
                ></textarea>
              </div>

              {/* Rewards */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-bold text-slate-600">Reward Description</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <FiAward />
                  </span>
                  <input
                    type="text"
                    value={editRewardInfo}
                    onChange={(e) => setEditRewardInfo(e.target.value)}
                    className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                    required
                  />
                </div>
              </div>

              <div className="modal-action gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-ghost btn-sm rounded-xl font-bold"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm rounded-xl text-white font-bold"
                  disabled={isUpdating}
                >
                  {isUpdating ? <span className="loading loading-spinner"></span> : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

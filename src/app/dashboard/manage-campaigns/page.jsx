'use client';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FiLayers, FiTrash2, FiInfo, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

export default function ManageCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/campaigns/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDelete = async (id, title) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete campaign "${title}"? This will permanently delete the campaign and REFUND all approved contributors their credits!`,
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
            Swal.fire('Deleted!', 'Campaign removed and contributors refunded.', 'success');
            fetchCampaigns();
          } else {
            const data = await res.json();
            Swal.fire('Error', data.message || 'Failed to delete campaign.', 'error');
          }
        } catch (err) {
          console.error('Delete error:', err);
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
          <FiLayers /> Manage Campaigns
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review and manage all campaigns listed on the platform. Deleting a campaign automatically refunds its backers.</p>
      </div>

      {/* Table Card */}
      <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <FiInfo className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">No campaigns found.</p>
            </div>
          ) : (
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-455 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Title</th>
                  <th>Category</th>
                  <th>Funding Goal</th>
                  <th>Credits Raised</th>
                  <th>Creator Name</th>
                  <th>Creator Email</th>
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
                    statusBadge = 'badge-warning text-white';
                  } else if (camp.status === 'rejected') {
                    statusBadge = 'badge-error text-white';
                  }

                  return (
                    <tr key={camp._id} className="hover:bg-slate-50 border-b border-slate-50">
                      <td className="font-bold text-slate-700 max-w-44 truncate">
                        <Link href={`/campaign/${camp._id}`} className="hover:text-blue-600 hover:underline flex items-center gap-1">
                          {camp.title} <FiExternalLink className="shrink-0 w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                      <td>{camp.category}</td>
                      <td>{camp.fundingGoal} Credits</td>
                      <td className="font-bold text-blue-600">{camp.raisedAmount} Credits</td>
                      <td>{camp.creatorName}</td>
                      <td>{camp.creatorEmail}</td>
                      <td>
                        <span className={`badge badge-sm font-bold text-[9px] capitalize ${statusBadge}`}>
                          {camp.isSuspended ? 'suspended' : camp.status}
                        </span>
                      </td>
                      <td className="text-right">
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
    </div>
  );
}

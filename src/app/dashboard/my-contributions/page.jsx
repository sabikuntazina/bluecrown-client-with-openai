'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiChevronLeft, FiChevronRight, FiList, FiClock, FiAlertTriangle } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function MyContributionsPage() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContributions, setTotalContributions] = useState(0);
  const limit = 5; // showing 5 records per page

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchContributions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/contributions/supporter?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setContributions(data.contributions || []);
        setTotalPages(data.totalPages || 1);
        setTotalContributions(data.totalContributions || 0);
      } else {
        Swal.fire('Error', 'Failed to retrieve contributions.', 'error');
      }
    } catch (err) {
      console.error('Error fetching contributions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContributions();
    }
  }, [user, page]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) {
    return (
      <div className="skeleton h-60 w-full rounded-3xl"></div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-805 flex items-center gap-2">
            <FiList /> My Contributions
          </h1>
          <p className="text-slate-500 text-xs mt-1">Track and manage all the pledges you have made to campaigns.</p>
        </div>
        <span className="badge badge-neutral badge-sm font-bold">{totalContributions} Total Pledges</span>
      </div>

      {/* Main Table */}
      <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          {contributions.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <FiClock className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">You have not pledged to any campaigns yet.</p>
            </div>
          ) : (
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-455 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Campaign Title</th>
                  <th>Credits Pledged</th>
                  <th>Creator Name</th>
                  <th>Pledge Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => {
                  let statusBadge = 'badge-ghost';
                  if (c.status === 'approved') statusBadge = 'badge-success text-white';
                  if (c.status === 'rejected') statusBadge = 'badge-error text-white';
                  if (c.status === 'pending') statusBadge = 'badge-warning text-white animate-pulse-subtle';

                  return (
                    <tr key={c._id} className="hover:bg-slate-50 border-b border-slate-50">
                      <td className="font-bold text-slate-700">{c.campaignTitle}</td>
                      <td className="font-semibold">{c.contributionAmount} Credits</td>
                      <td>{c.creatorName}</td>
                      <td>{new Date(c.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-sm font-bold text-[9px] capitalize ${statusBadge}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-6 border-t border-slate-50 mt-4">
            <span className="text-xs text-slate-400 font-semibold">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="btn btn-circle btn-outline btn-xs hover:bg-slate-800 hover:text-white"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="btn btn-circle btn-outline btn-xs hover:bg-slate-800 hover:text-white"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

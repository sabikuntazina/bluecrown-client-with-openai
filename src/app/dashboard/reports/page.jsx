'use client';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FiAlertOctagon, FiTrash2, FiInfo, FiSlash, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') 
    ? 'https://bluecrown-server-with-openai.vercel.app/api' 
    : 'http://localhost:5000/api');

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/campaigns/admin/reports/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSuspend = async (id, title) => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/campaigns/${id}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        Swal.fire({
          title: 'Suspension Status Updated!',
          text: data.message,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        fetchReports();
      } else {
        Swal.fire('Error', 'Failed to change suspension status.', 'error');
      }
    } catch (err) {
      console.error('Suspend campaign error:', err);
    }
  };

  const handleDelete = async (id, title) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete reported campaign "${title}"? This permanently removes the campaign and REFUNDS backers!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
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
            Swal.fire('Deleted!', 'Reported campaign was deleted and contributors refunded.', 'success');
            fetchReports();
          } else {
            Swal.fire('Error', 'Failed to delete campaign.', 'error');
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
          <FiAlertOctagon /> User Abuse Reports
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review campaigns flagged by supporters as suspicious, fraudulent, or violating platform guidelines.</p>
      </div>

      {/* Table Card */}
      <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FiInfo className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">No abuse reports currently registered.</p>
            </div>
          ) : (
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-455 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Reporter Name</th>
                  <th>Reporter Email</th>
                  <th>Campaign Title</th>
                  <th>Reason for Report</th>
                  <th>Date Reported</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50 border-b border-slate-50">
                    <td className="font-bold text-slate-700">{rep.reporterName}</td>
                    <td>{rep.reporterEmail}</td>
                    <td className="font-bold text-slate-850">
                      <Link href={`/campaign/${rep.campaignId}`} className="hover:text-blue-600 hover:underline flex items-center gap-1">
                        {rep.campaignTitle} <FiExternalLink className="shrink-0 w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="italic text-xs font-light text-slate-500 max-w-xs break-words">"{rep.reason}"</td>
                    <td>{new Date(rep.date).toLocaleDateString()}</td>
                    <td className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleSuspend(rep.campaignId, rep.campaignTitle)}
                        className="btn btn-warning btn-xs rounded-lg text-white font-bold flex items-center gap-1"
                        title="Toggle Suspension"
                      >
                        <FiSlash /> Suspend/Unsuspend
                      </button>
                      <button
                        onClick={() => handleDelete(rep.campaignId, rep.campaignTitle)}
                        className="btn btn-error btn-xs rounded-lg text-white font-bold flex items-center gap-1"
                        title="Delete Campaign"
                      >
                        <FiTrash2 /> Delete
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

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { 
  FiFileText, FiClock, FiCheckCircle, FiDollarSign, FiPlusCircle, 
  FiEye, FiTrendingUp, FiUsers, FiBox, FiFolderPlus
} from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Role routing
  if (!user) return null;
  const role = user.role.toLowerCase();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-805">
          Welcome back, {user.name}!
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Here is what is happening with your BlueCrown account today.
        </p>
      </div>

      {role === 'supporter' && <SupporterHome API_URL={API_URL} user={user} />}
      {role === 'creator' && <CreatorHome API_URL={API_URL} user={user} refreshUser={refreshUser} />}
      {role === 'admin' && <AdminHome API_URL={API_URL} user={user} />}
    </div>
  );
}

// -------------------------------------------------------------
// 1. SUPPORTER DASHBOARD HOME
// -------------------------------------------------------------
function SupporterHome({ API_URL, user }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, approvedCost: 0 });
  const [approvedContributions, setApprovedContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupporterData = async () => {
      try {
        const token = localStorage.getItem('bc_token');
        // Fetch paginated contributions (to get totals)
        const res1 = await fetch(`${API_URL}/contributions/supporter?page=1&limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Fetch approved contributions
        const res2 = await fetch(`${API_URL}/contributions/supporter/approved`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res1.ok && res2.ok) {
          const data1 = await res1.json();
          const data2 = await res2.json();

          const total = data1.totalContributions || 0;
          const pending = data1.contributions.filter(c => c.status === 'pending').length;
          const approvedCost = data2.reduce((acc, c) => acc + Number(c.contributionAmount), 0);

          setStats({ total, pending, approvedCost });
          setApprovedContributions(data2);
        }
      } catch (error) {
        console.error('Error fetching supporter stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupporterData();
  }, []);

  if (loading) return <div className="skeleton h-60 w-full rounded-3xl"></div>;

  // Chart data: contribution cost by campaign title
  const chartData = approvedContributions.map(c => ({
    name: c.campaignTitle.substring(0, 15) + '...',
    credits: c.contributionAmount
  }));

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 text-xl">
            <FiFileText />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{stats.total}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Contributions</div>
          </div>
        </div>

        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 text-xl">
            <FiClock />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{stats.pending}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Approvals</div>
          </div>
        </div>

        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 text-xl">
            <FaCoins />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{stats.approvedCost}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Approved Pledges (Credits)</div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Table View */}
        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Approved Contributions</h3>
          <div className="overflow-x-auto">
            {approvedContributions.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center">No approved contributions yet.</p>
            ) : (
              <table className="table table-xs w-full text-slate-600 font-medium">
                <thead>
                  <tr className="text-slate-450 uppercase text-[9px] tracking-wider border-b border-slate-100">
                    <th>Campaign</th>
                    <th>Credits Pledged</th>
                    <th>Creator</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedContributions.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50 border-b border-slate-50">
                      <td className="font-bold text-slate-700">{c.campaignTitle}</td>
                      <td>{c.contributionAmount}</td>
                      <td>{c.creatorName}</td>
                      <td>
                        <span className="badge badge-success badge-sm text-white font-bold text-[9px] capitalize">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Chart View */}
        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Pledges Chart (Credits)</h3>
          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <p className="text-slate-400 text-xs py-20 text-center">No cost statistics to display.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip cursor={{ fill: 'rgba(224, 242, 254, 0.4)' }} />
                  <Bar dataKey="credits" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. CREATOR DASHBOARD HOME
// -------------------------------------------------------------
function CreatorHome({ API_URL, user, refreshUser }) {
  const [metrics, setMetrics] = useState({ totalCampaigns: 0, activeCampaigns: 0, totalRaised: 0 });
  const [pendingContributions, setPendingContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCreatorData = async () => {
    try {
      const token = localStorage.getItem('bc_token');
      // Fetch creator campaigns
      const res1 = await fetch(`${API_URL}/campaigns/creator`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Fetch pending contributions to review
      const res2 = await fetch(`${API_URL}/contributions/creator/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res1.ok && res2.ok) {
        const campaigns = await res1.json();
        const pending = await res2.json();

        const totalCampaigns = campaigns.length;
        const activeCampaigns = campaigns.filter(c => new Date(c.deadline) > new Date() && !c.isSuspended).length;
        const totalRaised = campaigns.reduce((acc, c) => acc + Number(c.raisedAmount), 0);

        setMetrics({ totalCampaigns, activeCampaigns, totalRaised });
        setPendingContributions(pending);
      }
    } catch (err) {
      console.error('Error fetching creator home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const handleApprove = async (id, title, amount) => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/contributions/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        Swal.fire({
          title: 'Contribution Approved!',
          text: `Added ${amount} credits to the campaign raised amount.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        fetchCreatorData();
        if (refreshUser) refreshUser();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error approving contribution:', error);
    }
  };

  const handleReject = async (id, title, amount) => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/contributions/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        Swal.fire({
          title: 'Contribution Rejected',
          text: `Refunded ${amount} credits back to the supporter.`,
          icon: 'info',
          timer: 1500,
          showConfirmButton: false
        });
        fetchCreatorData();
        if (refreshUser) refreshUser();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error rejecting contribution:', error);
    }
  };

  if (loading) return <div className="skeleton h-60 w-full rounded-3xl"></div>;

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 text-xl">
            <FiBox />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{metrics.totalCampaigns}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Campaigns</div>
          </div>
        </div>

        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 text-xl">
            <FiCheckCircle />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{metrics.activeCampaigns}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Campaigns</div>
          </div>
        </div>

        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 text-xl">
            <FaCoins />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{metrics.totalRaised}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Credits Raised (Earnings)</div>
          </div>
        </div>

      </div>

      {/* Contributions To Review */}
      <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Contributions To Review</h3>
        
        <div className="overflow-x-auto">
          {pendingContributions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-slate-400 text-xs">No pending contributions to review right now.</p>
              <Link href="/dashboard/add-campaign" className="btn btn-primary btn-xs rounded-lg text-white font-bold inline-flex gap-1">
                <FiPlusCircle /> Add New Campaign
              </Link>
            </div>
          ) : (
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-450 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Supporter</th>
                  <th>Campaign Title</th>
                  <th>Amount (Credits)</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingContributions.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 border-b border-slate-50">
                    <td className="font-bold text-slate-700">{c.supporterName}</td>
                    <td>{c.campaignTitle}</td>
                    <td>
                      <span className="font-bold text-slate-800">{c.contributionAmount}</span>
                    </td>
                    <td className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setSelectedContribution(c);
                          setShowModal(true);
                        }}
                        className="btn btn-ghost btn-circle btn-xs text-blue-600"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleApprove(c._id, c.campaignTitle, c.contributionAmount)}
                        className="btn btn-success btn-xs rounded-lg text-white font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(c._id, c.campaignTitle, c.contributionAmount)}
                        className="btn btn-error btn-xs rounded-lg text-white font-bold"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showModal && selectedContribution && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl p-6 max-w-md bg-white border border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-lg">Contribution Details</h3>
            
            <div className="mt-4 space-y-3 text-xs leading-normal font-light">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-500">Supporter Name:</span>
                <span className="font-semibold text-slate-850">{selectedContribution.supporterName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-500">Email:</span>
                <span className="font-semibold text-slate-850">{selectedContribution.supporterEmail}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-500">Campaign:</span>
                <span className="font-semibold text-slate-850 truncate max-w-48">{selectedContribution.campaignTitle}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-500">Amount Pledged:</span>
                <span className="font-bold text-blue-600">{selectedContribution.contributionAmount} Credits</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-500">Pledge Date:</span>
                <span className="font-semibold text-slate-850">{new Date(selectedContribution.date).toLocaleDateString()}</span>
              </div>
              {selectedContribution.message && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-500 block">Supporter Message:</span>
                  <p className="p-3 bg-slate-50 rounded-xl italic text-slate-600">"{selectedContribution.message}"</p>
                </div>
              )}
            </div>

            <div className="modal-action gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost btn-sm rounded-xl font-bold"
              >
                Close
              </button>
              <button
                onClick={() => handleReject(selectedContribution._id, selectedContribution.campaignTitle, selectedContribution.contributionAmount)}
                className="btn btn-error btn-sm rounded-xl text-white font-bold"
              >
                Reject Pledging
              </button>
              <button
                onClick={() => handleApprove(selectedContribution._id, selectedContribution.campaignTitle, selectedContribution.contributionAmount)}
                className="btn btn-success btn-sm rounded-xl text-white font-bold"
              >
                Approve & Credit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// 3. ADMIN DASHBOARD HOME
// -------------------------------------------------------------
function AdminHome({ API_URL, user }) {
  const [adminStats, setAdminStats] = useState({
    totalSupporters: 0,
    totalCreators: 0,
    totalCredits: 0,
    totalPaymentsAmount: 0,
    totalPaymentsCount: 0,
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('bc_token');
        const res = await fetch(`${API_URL}/users/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAdminStats(data);
        }
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <div className="skeleton h-60 w-full rounded-3xl"></div>;

  // Chart data: group payments by date
  const chartData = adminStats.recentPayments.map(p => ({
    date: new Date(p.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    amount: p.amount
  }));

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 text-xl">
            <FiUsers />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{adminStats.totalSupporters}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Supporters</div>
          </div>
        </div>

        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 text-xl">
            <FiUsers />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{adminStats.totalCreators}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Creators</div>
          </div>
        </div>

        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 text-xl">
            <FaCoins />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{adminStats.totalCredits}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total User Credits</div>
          </div>
        </div>

        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-row items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 text-xl">
            <FiDollarSign />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">${adminStats.totalPaymentsAmount}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Processed Payments</div>
          </div>
        </div>

      </div>

      {/* Chart and Detail view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Payments chart */}
        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Processed Payments Chart ($ USD)</h3>
          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <p className="text-slate-400 text-xs py-20 text-center">No payment processing history yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform stats summary */}
        <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Platform Stats Overview</h3>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold">Total Supporters:</span>
              <span className="text-sm font-bold text-slate-800">{adminStats.totalSupporters}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold">Total Creators:</span>
              <span className="text-sm font-bold text-slate-800">{adminStats.totalCreators}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold">Processed Sales Count:</span>
              <span className="text-sm font-bold text-emerald-600">{adminStats.totalPaymentsCount} Payments</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold">Total User Balance:</span>
              <span className="text-sm font-bold text-amber-600">{adminStats.totalCredits} Credits</span>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 font-medium text-center italic">
            Stats auto-update in real-time.
          </div>
        </div>

      </div>
    </div>
  );
}

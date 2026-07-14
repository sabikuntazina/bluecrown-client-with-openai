'use client';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FiUsers, FiTrash2, FiInfo } from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, name, newRole) => {
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        Swal.fire({
          title: 'Role Updated!',
          text: `"${name}" is now a ${newRole}.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        fetchUsers();
      } else {
        const data = await res.json();
        Swal.fire('Error', data.message || 'Failed to update user role.', 'error');
      }
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  const handleRemove = async (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Remove user "${name}" from the system permanently? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, remove user'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('bc_token');
          const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.ok) {
            Swal.fire('User Removed', `"${name}" was deleted successfully.`, 'success');
            fetchUsers();
          } else {
            const data = await res.json();
            Swal.fire('Error', data.message || 'Failed to remove user.', 'error');
          }
        } catch (err) {
          console.error('Remove user error:', err);
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
          <FiUsers /> Manage Users
        </h1>
        <p className="text-slate-500 text-xs mt-1">View list of all registered accounts. You can elevate roles or remove users from the platform database.</p>
      </div>

      {/* Table Card */}
      <div className="card bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <FiInfo className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 text-xs font-semibold">No users found.</p>
            </div>
          ) : (
            <table className="table table-xs w-full text-slate-600 font-medium">
              <thead>
                <tr className="text-slate-455 uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th>Photo</th>
                  <th>Display Name</th>
                  <th>Email Address</th>
                  <th>Credits Balance</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 border-b border-slate-50">
                    <td>
                      <img src={u.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border" />
                    </td>
                    <td className="font-bold text-slate-700">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="flex items-center gap-1 font-bold text-blue-600">
                        <FaCoins className="text-amber-500 w-3 h-3" /> {u.credits}
                      </span>
                    </td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, u.name, e.target.value)}
                        className="select select-bordered select-xs rounded-lg font-semibold text-slate-655"
                      >
                        <option value="supporter">Supporter</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleRemove(u._id, u.name)}
                        className="btn btn-ghost btn-circle btn-xs text-red-600"
                        title="Delete User"
                      >
                        <FiTrash2 />
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

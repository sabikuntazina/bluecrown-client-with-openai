'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FiFolderPlus, FiFileText, FiDollarSign, FiClock, FiAward, FiImage, FiGrid, FiInfo } from 'react-icons/fi';

export default function AddCampaignPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('Technology');
  const [fundingGoal, setFundingGoal] = useState('');
  const [minimumContribution, setMinimumContribution] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rewardInfo, setRewardInfo] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY || '5a8ac52a0ed2b98f51f8625063adc5c9';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') 
    ? 'https://bluecrown-server-with-openai.vercel.app/api' 
    : 'http://localhost:5000/api');

  // Handle Cover Image upload to imgBB
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setImageUrl(data.data.url);
      } else {
        setError('Cover image upload failed. Please try again or paste a link.');
      }
    } catch (err) {
      console.error('imgBB upload error:', err);
      setError('Connection to image server failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !story || !category || !fundingGoal || !minimumContribution || !deadline || !rewardInfo || !imageUrl) {
      setError('All fields are required. Please upload an image.');
      return;
    }

    const goal = Number(fundingGoal);
    const minPledge = Number(minimumContribution);
    
    if (isNaN(goal) || goal <= 0) {
      setError('Funding Goal must be a positive number.');
      return;
    }
    if (isNaN(minPledge) || minPledge <= 0) {
      setError('Minimum contribution must be a positive number.');
      return;
    }
    if (new Date(deadline) <= new Date()) {
      setError('Deadline must be in the future.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('bc_token');
      const res = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          story,
          category,
          fundingGoal: goal,
          minimumContribution: minPledge,
          deadline,
          rewardInfo,
          imageUrl
        })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Campaign Submitted!',
          text: 'Your campaign was successfully sent to the administrators for review. It will become active once approved.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        
        // Reset Form
        setTitle('');
        setStory('');
        setFundingGoal('');
        setMinimumContribution('');
        setDeadline('');
        setRewardInfo('');
        setImageUrl('');
        
        router.push('/dashboard/my-campaigns');
      } else {
        setError(data.message || 'Failed to submit campaign.');
      }
    } catch (err) {
      console.error('Campaign creation error:', err);
      setError('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-extrabold text-slate-805 flex items-center gap-2">
          <FiFolderPlus /> Launch New Campaign
        </h1>
        <p className="text-slate-500 text-xs mt-1">Design your story, set your goal, and attract contributors. Admin approval is required before going public.</p>
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl py-3 px-4 flex items-start gap-2">
          <FiInfo className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Campaign Form Card */}
      <div className="card bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-slate-600">Campaign Title</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FiFileText />
              </span>
              <input
                type="text"
                placeholder="e.g. Help us build a solar-powered water pump"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                required
              />
            </div>
          </div>

          {/* Story */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-slate-600">Campaign Story / Description</span>
            </label>
            <textarea
              placeholder="Provide a detailed description explaining what your campaign does, who it helps, and how you will use the funds..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="textarea textarea-bordered rounded-xl focus:border-blue-500 focus:outline-hidden text-sm min-h-36 leading-relaxed"
              required
            ></textarea>
          </div>

          {/* Grid fields (Category & Deadline) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Category selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-slate-600">Category</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <FiGrid />
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="select select-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm font-semibold text-slate-600"
                >
                  <option value="Technology">Technology</option>
                  <option value="Art">Art</option>
                  <option value="Community">Community</option>
                  <option value="Health">Health</option>
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-slate-600">Campaign Deadline</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <FiClock />
                </span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm text-slate-600 font-medium"
                  required
                />
              </div>
            </div>

          </div>

          {/* Grid fields (Goal & Min Pledge) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Goal */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-slate-600">Funding Goal (Credits)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <FiDollarSign />
                </span>
                <input
                  type="number"
                  placeholder="Total credits needed"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                  required
                />
              </div>
            </div>

            {/* Minimum Pledge */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-slate-600">Minimum Contribution (Credits)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <FiDollarSign />
                </span>
                <input
                  type="number"
                  placeholder="Smallest pledge allowed"
                  value={minimumContribution}
                  onChange={(e) => setMinimumContribution(e.target.value)}
                  className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                  required
                />
              </div>
            </div>

          </div>

          {/* Reward Info */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-slate-600">Rewards Description</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FiAward />
              </span>
              <input
                type="text"
                placeholder="What do supporters receive? (e.g. Free early-bird software license, Custom postcard)"
                value={rewardInfo}
                onChange={(e) => setRewardInfo(e.target.value)}
                className="input input-bordered w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-sm"
                required
              />
            </div>
          </div>

          {/* Cover image upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-slate-600">Campaign Cover Image</span>
            </label>
            
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input file-input-bordered file-input-primary file-input-sm w-full rounded-xl"
              />

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <FiImage />
                </span>
                <input
                  type="url"
                  placeholder="Or paste cover image URL manually"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="input input-bordered input-sm w-full pl-10 rounded-xl focus:border-blue-500 focus:outline-hidden text-xs"
                />
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Uploading campaign image to imgBB...</span>
                </div>
              )}

              {imageUrl && !isUploading && (
                <div className="flex items-center gap-2 pt-2 border p-3 rounded-2xl bg-slate-50">
                  <img src={imageUrl} alt="Preview" className="w-16 h-12 rounded-lg object-cover border" />
                  <span className="text-[10px] text-emerald-600 font-semibold">Image loaded successfully!</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="btn btn-primary w-full rounded-xl text-white font-bold mt-4"
          >
            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Submit Campaign'}
          </button>

        </form>
      </div>
    </div>
  );
}

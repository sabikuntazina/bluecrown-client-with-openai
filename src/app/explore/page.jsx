'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiSliders, FiClock, FiDollarSign, FiFilter, FiTrendingUp } from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams ? searchParams.get('category') || 'All' : 'All';

  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('newest'); // newest, raised-high, raised-low, goal-high, deadline-near

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

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`${API_URL}/campaigns/active`);
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data);
          setFilteredCampaigns(data);
        }
      } catch (error) {
        console.error('Error fetching explore campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Sync category if URL search param changes
  useEffect(() => {
    if (searchParams) {
      const cat = searchParams.get('category');
      if (cat) setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Apply filters and sort
  useEffect(() => {
    let result = [...campaigns];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search term filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(term) || 
        c.story.toLowerCase().includes(term)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'raised-high') {
        return b.raisedAmount - a.raisedAmount;
      }
      if (sortBy === 'raised-low') {
        return a.raisedAmount - b.raisedAmount;
      }
      if (sortBy === 'goal-high') {
        return b.fundingGoal - a.fundingGoal;
      }
      if (sortBy === 'deadline-near') {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return 0;
    });

    setFilteredCampaigns(result);
  }, [campaigns, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8 flex-1">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Explore Campaigns</h1>
          <p className="text-slate-500 text-sm font-light">Support projects, products, and causes by pledging your platform credits.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100 font-semibold text-xs shadow-xs">
          <FaCoins className="text-amber-500" />
          <span>20 Credits = $1 USD Withdrawal Ratio</span>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder="Search campaigns by title or story..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full pl-10 rounded-2xl focus:border-blue-500 focus:outline-hidden text-sm"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <FiFilter />
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select select-bordered w-full pl-10 rounded-2xl focus:border-blue-500 focus:outline-hidden text-sm font-semibold text-slate-600"
          >
            <option value="All">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Art">Art</option>
            <option value="Community">Community</option>
            <option value="Health">Health</option>
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <FiSliders />
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select select-bordered w-full pl-10 rounded-2xl focus:border-blue-500 focus:outline-hidden text-sm font-semibold text-slate-600"
          >
            <option value="newest">Sort: Newest</option>
            <option value="raised-high">Sort: Highest Raised</option>
            <option value="raised-low">Sort: Lowest Raised</option>
            <option value="goal-high">Sort: Highest Goal</option>
            <option value="deadline-near">Sort: Closing Soon</option>
          </select>
        </div>

      </div>

      {/* Campaigns Listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="flex flex-col gap-4 w-full">
              <div className="skeleton h-56 w-full rounded-3xl"></div>
              <div className="skeleton h-6 w-3/4"></div>
              <div className="skeleton h-4 w-1/2"></div>
              <div className="skeleton h-10 w-full rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <p className="text-slate-400 font-medium">No campaigns match your filters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSortBy('newest');
            }}
            className="btn btn-outline btn-primary rounded-xl btn-sm font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map((camp) => {
            const percent = Math.min(Math.round((camp.raisedAmount / camp.fundingGoal) * 100), 100);
            const isExpired = new Date(camp.deadline) < new Date();
            const daysLeft = Math.max(
              Math.ceil((new Date(camp.deadline) - new Date()) / (1000 * 60 * 60 * 24)),
              0
            );

            return (
              <div
                key={camp._id}
                className="card bg-white rounded-3xl shadow-sm border border-slate-100 hover-lift overflow-hidden flex flex-col"
              >
                <figure className="relative h-52 w-full">
                  <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
                  <span className="absolute top-4 right-4 badge badge-neutral bg-slate-900/80 backdrop-blur-xs text-white border-0 font-bold text-[10px] uppercase tracking-wider px-3 py-1">
                    {camp.category}
                  </span>
                </figure>
                
                <div className="card-body p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="card-title text-lg font-bold text-slate-800 line-clamp-1">
                      {camp.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-3 font-light leading-relaxed">
                      {camp.story}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-blue-600">{camp.raisedAmount} Credits Raised</span>
                        <span className="text-slate-400">{percent}%</span>
                      </div>
                      <progress className="progress progress-primary w-full h-2" value={percent} max="100"></progress>
                    </div>

                    {/* Stats footer info */}
                    <div className="grid grid-cols-3 gap-1 border-t border-slate-50 pt-2 text-center">
                      <div className="text-[10px] text-slate-400 flex flex-col items-center">
                        <span className="font-semibold text-slate-700">{camp.fundingGoal}</span>
                        <span>Goal Credits</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex flex-col items-center border-x border-slate-100">
                        <span className="font-semibold text-slate-700">{camp.minimumContribution}</span>
                        <span>Min Pledge</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex flex-col items-center">
                        <span className="font-semibold text-slate-700">
                          {isExpired ? 'Ended' : `${daysLeft} days`}
                        </span>
                        <span>Time Left</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href={`/campaign/${camp._id}`} className="btn btn-primary btn-sm w-full rounded-xl text-white font-bold">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

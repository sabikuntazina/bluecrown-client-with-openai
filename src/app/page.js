'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiCheckCircle, FiHeart, FiTrendingUp, FiAward, FiShield, FiArrowLeft } from 'react-icons/fi';
import { FaCoins, FaUsers, FaTasks } from 'react-icons/fa';

const slides = [
  {
    id: 1,
    title: 'Fund the Future of Innovation',
    subtitle: 'Help creators bring breakthrough gadgets, software, and creative platforms to life.',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
    tag: 'Technology'
  },
  {
    id: 2,
    title: 'Empower Local Communities',
    subtitle: 'Support clean water systems, sustainable solar pumps, and education centers worldwide.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Community'
  },
  {
    id: 3,
    title: 'Unleash Artistic Expressions',
    subtitle: 'From independent indie films to stunning art installations. Support the creative minds.',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
    tag: 'Art'
  }
];

const testimonials = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Tech Innovator',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    quote: 'BlueCrown helped us raise 12,000 credits to build our eco-friendly charging hubs. The system is smooth and the support is top-notch!'
  },
  {
    id: 2,
    name: 'David Kojo',
    role: 'Community Activist',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    quote: 'Dedicating our solar pump project to BlueCrown brought us contributors from around the globe. Credits transfer was fast and simple.'
  },
  {
    id: 3,
    name: 'Elena Rostova',
    role: 'Indie Producer',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    quote: 'The direct communication between creators and supporters builds incredible trust. Best crowdfunding experience I have ever had.'
  }
];

const categories = [
  { name: 'Technology', icon: '💻', color: 'from-blue-500 to-indigo-600' },
  { name: 'Art', icon: '🎨', color: 'from-purple-500 to-pink-600' },
  { name: 'Community', icon: '🌱', color: 'from-emerald-500 to-teal-600' },
  { name: 'Health', icon: '🏥', color: 'from-rose-500 to-orange-600' }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Hero slide auto transitions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch campaigns
  useEffect(() => {
    const getCampaigns = async () => {
      try {
        const res = await fetch(`${API_URL}/campaigns/active`);
        if (res.ok) {
          const data = await res.json();
          // Sort by raised amount descending and slice top 6
          const sorted = data.sort((a, b) => b.raisedAmount - a.raisedAmount).slice(0, 6);
          setTopCampaigns(sorted);
        }
      } catch (err) {
        console.error('Error fetching home campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    getCampaigns();
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="w-full space-y-16 pb-20 overflow-x-hidden">
      
      {/* 1. HERO SECTION (Animated Slider) */}
      <section className="relative w-full h-[600px] bg-slate-900 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[6000ms]"
              style={{
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url(${slide.image})`
              }}
            ></div>
            
            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-5xl text-white space-y-6">
              <span className="badge badge-accent badge-lg font-bold uppercase tracking-widest text-xs py-2 px-4 shadow-sm animate-float">
                {slide.tag}
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-slate-350 max-w-2xl font-light">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/explore" className="btn btn-primary btn-md rounded-full shadow-lg border-0 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
                  Back Campaigns <FiArrowRight />
                </Link>
                <Link href="/register" className="btn btn-outline btn-md text-white border-white/40 rounded-full hover:bg-white hover:text-slate-900 px-8">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentSlide ? 'bg-blue-500 w-8' : 'bg-white/40'
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. TOP FUNDED CAMPAIGNS SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1">
            <FiTrendingUp className="animate-bounce" /> Trending
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            Top Funded Campaigns
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Discover the most successful campaigns raising credits right now. Join other supporters to cross the finish line.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col gap-4 w-full">
                <div className="skeleton h-56 w-full rounded-2xl"></div>
                <div className="skeleton h-6 w-3/4"></div>
                <div className="skeleton h-4 w-1/2"></div>
                <div className="skeleton h-10 w-full rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : topCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 font-medium">No campaigns found. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topCampaigns.map((camp) => {
              const percent = Math.min(Math.round((camp.raisedAmount / camp.fundingGoal) * 100), 100);
              return (
                <div key={camp._id} className="card bg-white rounded-3xl shadow-sm border border-slate-100 hover-lift overflow-hidden">
                  <figure className="relative h-52 w-full">
                    <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
                    <span className="absolute top-4 right-4 badge badge-neutral bg-slate-900/80 backdrop-blur-xs text-white border-0 font-bold text-[10px] uppercase tracking-wider px-3 py-1">
                      {camp.category}
                    </span>
                  </figure>
                  <div className="card-body p-6 space-y-4">
                    <h3 className="card-title text-lg font-bold text-slate-855 line-clamp-1">
                      {camp.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 font-light">
                      {camp.story}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-blue-600">{camp.raisedAmount} Credits Raised</span>
                        <span className="text-slate-400">{percent}%</span>
                      </div>
                      <progress className="progress progress-primary w-full h-2" value={percent} max="100"></progress>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Goal: {camp.fundingGoal} Credits</span>
                        <span className="capitalize">By {camp.creatorName}</span>
                      </div>
                    </div>

                    <div className="card-actions pt-2">
                      <Link href={`/campaign/${camp._id}`} className="btn btn-outline btn-primary btn-sm w-full rounded-xl font-bold">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. EXTRA SECTION 1: HOW IT WORKS */}
      <section className="bg-slate-100/70 py-16 px-4 md:px-8 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest">
              Simple Guide
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              How BlueCrown Works
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Follow these simple steps to launch your idea or contribute to a cause.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-xs border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xl shadow-inner mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Create Account</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-light">
                Sign up as a **Creator** or **Supporter**. Supporters get 50 credits and Creators get 20 credits instantly to initiate the system.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-xs border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-extrabold text-xl shadow-inner mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Launch / Support</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-light">
                Creators list campaigns with reward details. Supporters discover active campaigns and pledge credits to back the ideas they love.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-xs border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xl shadow-inner mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Build & Withdraw</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-light">
                Once approved, Creators withdraw raised credits directly to Stripe/bkash (20 Credits = $1). Supporters track project milestones.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. EXTRA SECTION 2: EXPLORE BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-purple-600 font-bold text-xs uppercase tracking-widest">
            Categories
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            Explore by Category
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Target your backing. Select a category and discover specific campaigns tailored to your interests.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/explore?category=${cat.name}`}
              className="group relative overflow-hidden rounded-3xl p-6 h-36 bg-white border border-slate-100 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="text-3xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-850 text-base">{cat.name}</h3>
                <span className="text-[10px] text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                  View Projects <FiArrowRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. TESTIMONIAL SECTION (Slider Carousel) */}
      <section className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="card glass-panel shadow-sm border border-slate-200/40 p-8 md:p-12 relative rounded-3xl">
          <div className="absolute top-4 left-6 text-slate-200 text-7xl font-serif select-none pointer-events-none">
            “
          </div>
          
          <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
              What Our Community Says
            </h2>

            <div className="min-h-36 flex flex-col justify-center items-center space-y-4">
              <p className="text-slate-600 text-base italic leading-relaxed max-w-2xl">
                {testimonials[currentTestimonial].quote}
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={testimonials[currentTestimonial].photo}
                  alt={testimonials[currentTestimonial].name}
                  className="w-12 h-12 rounded-full object-cover border border-blue-500 shadow-xs"
                />
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-slate-400 text-xs">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>

            {/* Testimonial Controls */}
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                onClick={prevTestimonial}
                className="btn btn-circle btn-outline btn-sm hover:bg-slate-800 hover:text-white"
              >
                <FiArrowLeft />
              </button>
              <span className="text-xs text-slate-400">
                {currentTestimonial + 1} / {testimonials.length}
              </span>
              <button
                onClick={nextTestimonial}
                className="btn btn-circle btn-outline btn-sm hover:bg-slate-800 hover:text-white"
              >
                <FiArrowRight />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 6. EXTRA SECTION 3: PLATFORM IMPACT IN NUMBERS */}
      <section className="bg-slate-900 text-white py-16 px-4 md:px-8 rounded-3xl max-w-7xl mx-auto shadow-xl relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/25 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full filter blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          
          <div className="space-y-1">
            <div className="text-blue-400 text-3xl flex justify-center mb-2">
              <FaCoins />
            </div>
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight">1.2M+</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Credits Contributed</div>
          </div>

          <div className="space-y-1">
            <div className="text-teal-400 text-3xl flex justify-center mb-2">
              <FaUsers />
            </div>
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight">4,800+</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Supporters</div>
          </div>

          <div className="space-y-1">
            <div className="text-indigo-400 text-3xl flex justify-center mb-2">
              <FaTasks />
            </div>
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight">320+</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Successful Campaigns</div>
          </div>

          <div className="space-y-1">
            <div className="text-purple-400 text-3xl flex justify-center mb-2">
              <FiCheckCircle />
            </div>
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight">99.4%</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Approval Rate</div>
          </div>

        </div>
      </section>

    </div>
  );
}

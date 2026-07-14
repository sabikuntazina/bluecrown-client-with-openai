'use client';

import React from 'react';
import Link from 'next/link';
import { FiFacebook, FiTwitter, FiLinkedin, FiGithub, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 md:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo and Description */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2 text-white text-xl font-bold tracking-tight">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-teal-400">
              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
            </div>
            <span className="font-extrabold text-white">
              Blue<span className="text-blue-400">Crown</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm max-w-sm">
            Empowering innovators, creators, and supporters to fund next-generation solutions, art, and community initiatives worldwide. Together, we crown the futures of tomorrow.
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2">
            <a href="https://linkedin.com/in/sabikuntazina" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all">
              <FiLinkedin className="w-4 h-4" />
            </a>
            <a href="https://github.com/sabikuntazina" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 hover:text-white transition-all">
              <FiGithub className="w-4 h-4" />
            </a>
            <a href="https://facebook.com/sabikuntazina" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-blue-800 hover:text-white transition-all">
              <FiFacebook className="w-4 h-4" />
            </a>
            <a href="https://twitter.com/sabikuntazina" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-sky-500 hover:text-white transition-all">
              <FiTwitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/explore" className="hover:text-white transition-colors">
                Explore Campaigns
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition-colors">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white transition-colors">
                Register
              </Link>
            </li>
            <li>
              <a href="https://github.com/sabikuntazina/bluecrown-client" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Developer Repo
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Platform Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FiMapPin className="text-blue-500 w-4 h-4 shrink-0" />
              <span>Dhaka, Bangladesh</span>
            </li>
            <li className="flex items-center gap-2">
              <FiPhone className="text-blue-500 w-4 h-4 shrink-0" />
              <span>+880 1234 567890</span>
            </li>
            <li className="flex items-center gap-2">
              <FiMail className="text-blue-500 w-4 h-4 shrink-0" />
              <span>support@bluecrown.com</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-850 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>&copy; {new Date().getFullYear()} BlueCrown. Built for MERN Assessment. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-350 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

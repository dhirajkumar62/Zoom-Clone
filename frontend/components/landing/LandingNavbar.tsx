'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Video, ArrowRight, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function LandingNavbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-gray-800/80 bg-[#0b0f19]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
              Meet<span className="text-blue-500">Flow</span>
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-blue-400/80 uppercase -mt-1">
              Video Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            Workflow
          </a>
          <a href="#preview" className="hover:text-white transition-colors">
            Preview
          </a>
        </nav>

        {/* Dynamic Auth Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-semibold text-gray-200">{user?.name}</span>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors border border-gray-800"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-500/40"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

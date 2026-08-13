'use client';

import React from 'react';
import Link from 'next/link';
import { Video, UserPlus, Calendar, ArrowRight } from 'lucide-react';

export default function ActionCards() {
  return (
    <section className="py-12 border-y border-gray-800/80 bg-gray-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Quick Actions to Get Started
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
            Choose how you want to connect today with one-click instant navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Start a Meeting */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800 flex flex-col justify-between space-y-6 group hover:border-amber-500/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                Start a Meeting
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Create an instant meeting room immediately and invite team members with a unique shareable link.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all"
            >
              <span>Start Meeting</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Join a Meeting */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800 flex flex-col justify-between space-y-6 group hover:border-blue-500/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Join a Meeting
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Enter a 9-digit Meeting ID or paste an invite link to jump straight into an ongoing conversation.
              </p>
            </div>
            <Link
              href="/meeting/join"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <span>Join Meeting</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Schedule a Meeting */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800 flex flex-col justify-between space-y-6 group hover:border-emerald-500/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Schedule a Meeting
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Plan your upcoming session with title, date, time, and custom duration stored in SQLite.
              </p>
            </div>
            <Link
              href="/meeting/schedule"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
            >
              <span>Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

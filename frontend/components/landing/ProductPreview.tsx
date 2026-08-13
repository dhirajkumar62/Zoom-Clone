'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Video, UserPlus, Sparkles } from 'lucide-react';

export default function ProductPreview() {
  return (
    <section className="py-20 bg-[#0b0f19] relative" id="preview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Application Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything Organized in One Place
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            Manage your video meetings, scheduled sessions, and history from a central workspace.
          </p>
        </div>

        {/* Dashboard Preview Visual Card */}
        <div className="relative rounded-3xl border border-gray-800 glass-card p-6 sm:p-8 overflow-hidden shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400 ml-2 font-mono">http://localhost:3000/dashboard</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-blue-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>MeetFlow Workspace</span>
            </div>
          </div>

          {/* Quick Mock Dashboard Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center gap-3 text-amber-300">
              <Video className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-sm text-white">New Meeting</h4>
                <span className="text-[10px] text-gray-400">Instant Room</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center gap-3 text-blue-300">
              <UserPlus className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-sm text-white">Join Meeting</h4>
                <span className="text-[10px] text-gray-400">via ID or Link</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
              <Calendar className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-sm text-white">Schedule</h4>
                <span className="text-[10px] text-gray-400">Plan Ahead</span>
              </div>
            </div>
          </div>

          {/* Mock Upcoming Meeting Card */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Scheduled
                </span>
                <h4 className="font-bold text-sm text-white">Product Strategy & Architecture Review</h4>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Tomorrow • 10:30 AM (60 mins) | Meeting ID: 482 719 365
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md"
              >
                Join Room
              </Link>
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="text-center pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

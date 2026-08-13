'use client';

import React from 'react';
import Link from 'next/link';
import { Video, UserPlus, Sparkles } from 'lucide-react';

export default function LandingCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0b0f19] to-gray-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Get Started Today</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Ready to Start Your Next Meeting?
        </h2>

        <p className="text-sm sm:text-base text-gray-300 max-w-lg mx-auto leading-relaxed">
          Join thousands of professionals using MeetFlow for simple, reliable video conferencing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Video className="w-4 h-4" />
            <span>Start a Meeting</span>
          </Link>

          <Link
            href="/meeting/join"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl glass-panel hover:bg-gray-800/80 text-gray-200 font-bold text-sm border border-gray-800 transition-all hover:scale-105"
          >
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>Join a Meeting</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

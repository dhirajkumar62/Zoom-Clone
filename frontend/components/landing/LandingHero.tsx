'use client';

import React from 'react';
import Link from 'next/link';
import { Video, UserPlus, Sparkles, Mic, Camera, Shield, Users, Monitor, PhoneOff } from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Video Conferencing Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Connect. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Collaborate. Meet.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Simple, reliable video meetings for teams, interviews, classes, and conversations. High-definition video with crystal-clear audio and zero setup friction.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Start a Meeting</span>
              </Link>

              <Link
                href="/meeting/join"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl glass-panel hover:bg-gray-800/80 text-gray-200 font-bold text-sm border border-gray-800 transition-all hover:scale-105 active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Join a Meeting</span>
              </Link>
            </div>

            {/* Micro Badge Stats */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 border-t border-gray-800/80 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Fast & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>No Login Needed</span>
              </div>
            </div>
          </div>

          {/* Right Visual Mockup Illustration */}
          <div className="lg:col-span-6 relative">
            <div className="relative glass-card rounded-3xl p-4 sm:p-6 border border-gray-800 shadow-2xl space-y-4 overflow-hidden bg-[#0e1322]">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-white">Product Architecture Sync</span>
                </div>
                <span className="font-mono text-gray-400 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
                  ID: 482 719 365
                </span>
              </div>

              {/* Video Cards Grid Mockup */}
              <div className="grid grid-cols-2 gap-3 h-56 sm:h-64">
                {/* Tile 1 */}
                <div className="relative rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 border border-gray-800 overflow-hidden flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
                    DK
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-white">
                    <span>Dhiraj (You)</span>
                    <Mic className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>

                {/* Tile 2 */}
                <div className="relative rounded-2xl bg-gradient-to-tr from-slate-900 to-purple-950 border border-gray-800 overflow-hidden flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
                    DU
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-white">
                    <span>Default User (Host)</span>
                    <Mic className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Bottom Meeting Controls Bar */}
              <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-800/80">
                <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-emerald-400">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-blue-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
                  <Users className="w-4 h-4" />
                </div>
                <div className="p-2.5 rounded-xl bg-red-600 text-white">
                  <PhoneOff className="w-4 h-4" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

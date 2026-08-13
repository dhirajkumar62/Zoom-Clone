'use client';

import React from 'react';
import { Video, Calendar, Link2, Users, LayoutDashboard, Smartphone } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Video,
      title: 'HD Video Meetings',
      description: 'Crystal-clear video feeds with real webcam support and interactive frequency visualizer canvas.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: Calendar,
      title: 'Simple Scheduling',
      description: 'Plan future sessions with custom date, time, agendas, and duration stored directly in SQLite.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: Link2,
      title: 'Shareable Links',
      description: 'Unique 9-digit public Meeting IDs and shareable URLs generated instantly for one-click access.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: Users,
      title: 'Participant Management',
      description: 'Persistent attendee tracking storing display names, joined timestamps, and active status.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: LayoutDashboard,
      title: 'Meeting Dashboard',
      description: 'Centralized workspace showcasing upcoming scheduled sessions and recent completed history.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: Smartphone,
      title: 'Responsive Experience',
      description: 'Fluid glassmorphism layout optimized seamlessly for desktop, tablet, and mobile displays.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <section className="py-20 bg-[#0b0f19] relative" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything You Need to Meet
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            Built with modern architecture to deliver frictionless video conferencing for work and education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4 hover:border-gray-700 transition-colors"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} border flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

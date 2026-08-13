'use client';

import React from 'react';
import { ShieldCheck, Zap, Share2, Smartphone } from 'lucide-react';

export default function TrustSection() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: 'Reliable Architecture',
      description: 'Built on FastAPI, SQLAlchemy, and SQLite for stable data persistence.',
      color: 'text-emerald-400',
    },
    {
      icon: Zap,
      title: 'Fast Meeting Creation',
      description: 'Generate instant meeting rooms with unique 9-digit IDs in under a second.',
      color: 'text-amber-400',
    },
    {
      icon: Share2,
      title: 'Frictionless Sharing',
      description: 'One-click invite link copying for seamless teammate onboarding.',
      color: 'text-blue-400',
    },
    {
      icon: Smartphone,
      title: 'Fully Responsive',
      description: 'Optimized touch-friendly UI for mobile, tablet, and desktop viewports.',
      color: 'text-purple-400',
    },
  ];

  return (
    <section className="py-16 bg-gray-900/40 border-y border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
                <Icon className={`w-6 h-6 ${item.color}`} />
                <h4 className="font-bold text-sm text-white">{item.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

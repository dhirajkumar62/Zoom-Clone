'use client';

import React from 'react';
import { PlusCircle, Share2, Video } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: PlusCircle,
      title: 'Create',
      description: 'Start an instant room or schedule a future session with custom date, time, and duration.',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      step: '02',
      icon: Share2,
      title: 'Share',
      description: 'Copy your auto-generated 9-digit Meeting ID or shareable invite link with your teammates.',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      step: '03',
      icon: Video,
      title: 'Connect',
      description: 'Participants enter their display name and join the video room with full mic, camera, and chat controls.',
      color: 'from-purple-600 to-pink-600',
    },
  ];

  return (
    <section className="py-20 bg-gray-900/30 border-y border-gray-800/80 relative" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Simple Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Meet in Three Simple Steps
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            No complex signups or downloads required. Start collaborating in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card p-8 rounded-3xl border border-gray-800 relative space-y-5 text-center group hover:border-gray-700 transition-colors"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>

                <span className="text-xs font-mono font-bold tracking-widest text-gray-500 uppercase block">
                  Step {item.step}
                </span>

                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

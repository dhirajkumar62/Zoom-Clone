'use client';

import React from 'react';
import Link from 'next/link';
import { Video, Code } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/80 text-gray-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Video className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Meet<span className="text-blue-500">Flow</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Modern video conferencing platform engineered for high performance, simple meeting creation, and smooth team collaboration.
            </p>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/meeting/join" className="hover:text-white transition-colors">Join Meeting</Link></li>
              <li><Link href="/meeting/schedule" className="hover:text-white transition-colors">Schedule Session</Link></li>
            </ul>
          </div>

          {/* Col 3: Solutions */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200">Solutions</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Engineering Syncs</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Technical Interviews</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Remote Classes</a></li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200">Resources</h4>
            <ul className="space-y-2">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5"><Code className="w-3.5 h-3.5" /> GitHub Repository</a></li>
              <li><span className="text-gray-500 cursor-not-allowed">API Documentation</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">Privacy & Terms</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
          <p>© 2026 MeetFlow Platform. Built for Scaler SDE Assignment.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

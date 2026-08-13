'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Clock, Video, UserCheck, ShieldCheck, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  onScheduleClick?: () => void;
  onJoinClick?: () => void;
  onOpenSettings?: () => void;
}

export default function Sidebar({ onScheduleClick, onJoinClick, onOpenSettings }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isPrivileged = user?.account_role === 'OWNER' || user?.account_role === 'ADMIN';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    ...(isPrivileged ? [{ name: 'Admin Console', href: '/admin', icon: ShieldCheck }] : []),
    { name: 'Public Landing Page', href: '/', icon: Video },
    { name: 'Upcoming Meetings', href: '#upcoming', icon: Calendar },
    { name: 'Recent Meetings', href: '#recent', icon: Clock },
  ];

  const userName = user?.name || 'User';
  const userRole = user?.account_role || (user?.role === 'admin' ? 'ADMIN' : 'MEMBER');

  return (
    <aside className="w-64 hidden md:flex flex-col gap-6 p-4 glass-panel border-r border-gray-800 min-h-[calc(100vh-65px)]">
      {/* Navigation Menu */}
      <div className="space-y-1">
        <span className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Navigation
        </span>
        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.includes(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Action Triggers */}
      <div className="space-y-1 pt-4 border-t border-gray-800/80">
        <span className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Quick Actions
        </span>
        <div className="mt-2 space-y-2">
          {onJoinClick && (
            <button
              onClick={onJoinClick}
              className="w-full flex items-center justify-start gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              Join via ID
            </button>
          )}
          {onScheduleClick && (
            <button
              onClick={onScheduleClick}
              className="w-full flex items-center justify-start gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              Schedule New
            </button>
          )}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-start gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              Device Settings
            </button>
          )}
        </div>
      </div>

      {/* Profile / System Info Card */}
      <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-gray-900 via-gray-900/90 to-blue-950/40 border border-gray-800/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RBAC Authenticated</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Signed in as <strong className="text-gray-200">{userName}</strong> (<span className="text-amber-400 font-mono text-[11px] font-bold">{userRole}</span>).
        </p>
      </div>
    </aside>
  );
}


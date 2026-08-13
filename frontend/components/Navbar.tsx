'use client';

import React, { useEffect, useState } from 'react';
import { Video, Search, Settings, Bell, LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { fetchHealth } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}

export default function Navbar({
  searchQuery = '',
  onSearchChange,
  onOpenNotifications,
  onOpenSettings,
}: NavbarProps) {
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchHealth()
      .then(() => setIsServerOnline(true))
      .catch(() => setIsServerOnline(false));
  }, []);

  const userName = user?.name || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleBadge = () => {
    const role = user?.account_role || (user?.role === 'admin' ? 'ADMIN' : 'MEMBER');
    if (role === 'OWNER') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
          <ShieldCheck className="w-2.5 h-2.5" />
          OWNER
        </span>
      );
    }
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300">
          <ShieldCheck className="w-2.5 h-2.5" />
          ADMIN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
        MEMBER
      </span>
    );
  };

  const isPrivileged = user?.account_role === 'OWNER' || user?.account_role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Meet<span className="text-blue-500">Flow</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-400/80 -mt-1">
              Video Platform
            </span>
          </div>
        </Link>

        {/* Server Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900/60 border border-gray-800">
          <span className={`w-2 h-2 rounded-full ${isServerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-gray-400">API:</span>
          <span className={isServerOnline ? 'text-emerald-400' : 'text-amber-400'}>
            {isServerOnline === null ? 'Checking...' : isServerOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex items-center relative max-w-sm w-full mx-6">
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search meetings, title, or ID..."
          className="w-full pl-9 pr-4 py-1.5 rounded-lg text-sm bg-gray-900/80 border border-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* User Actions & Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isPrivileged && (
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
        )}

        <button
          onClick={onOpenNotifications}
          title="Notifications"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-3 text-left group"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10 group-hover:border-blue-400 transition-colors">
                {userInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-gray-950 rounded-full" />
            </div>

            <div className="hidden lg:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-100 leading-tight group-hover:text-blue-400 transition-colors">{userName}</span>
                {roleBadge()}
              </div>
              <span className="text-xs text-gray-400">{userEmail}</span>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors ml-1"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}


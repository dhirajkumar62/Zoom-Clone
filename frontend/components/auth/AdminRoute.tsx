'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isPrivileged = user?.account_role === 'OWNER' || user?.account_role === 'ADMIN';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070a12] flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 font-medium">Verifying Administrative Privileges...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isPrivileged) {
    return (
      <div className="min-h-screen bg-[#070a12] flex flex-col items-center justify-center p-4 text-white">
        <div className="glass-panel p-8 rounded-3xl border border-red-500/20 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-100">403 Access Forbidden</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your account <span className="text-gray-200 font-semibold">({user?.email})</span> has the role{' '}
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[11px]">
                {user?.account_role || 'MEMBER'}
              </span>
              . Access to the Admin Management Console requires an OWNER or ADMIN account.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

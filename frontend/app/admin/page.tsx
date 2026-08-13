'use client';

import React, { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { fetchAdminDashboardStats, fetchAdminUsers, fetchAdminMeetings } from '@/lib/api';
import { AdminDashboardStats, User, AdminMeeting } from '@/lib/types';
import {
  Users,
  Video,
  UserCheck,
  Calendar,
  ShieldCheck,
  Activity,
  UserX,
  Clock,
  ArrowRight,
  Loader2,
  RefreshCw,
  Crown
} from 'lucide-react';
import Link from 'next/link';

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<AdminMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, u, m] = await Promise.all([
        fetchAdminDashboardStats(),
        fetchAdminUsers(),
        fetchAdminMeetings(),
      ]);
      setStats(s);
      setRecentUsers(u.slice(0, 5));
      setRecentMeetings(m.slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900/90 to-amber-950/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>MeetFlow RBAC Administration</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Admin Console Dashboard
              </h1>
              <p className="text-xs text-gray-400">
                Monitor system metrics, manage user role permissions, and supervise live video meetings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 text-xs font-semibold flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>
            <Link
              href="/admin/users"
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Management</span>
            </Link>
            <Link
              href="/admin/meetings"
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Video className="w-3.5 h-3.5" />
              <span>All Meetings</span>
            </Link>
            <Link
              href="/admin/participants"
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Attendance Log</span>
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Total Users */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                  Total Accounts
                </span>
                <span className="text-2xl font-bold text-white">
                  {loading ? '...' : stats?.total_users ?? 0}
                </span>
              </div>
            </div>

            {/* Active Users */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                  Active Users
                </span>
                <span className="text-2xl font-bold text-white">
                  {loading ? '...' : stats?.active_users ?? 0}
                </span>
              </div>
            </div>

            {/* Total Meetings */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                  Total Meetings
                </span>
                <span className="text-2xl font-bold text-white">
                  {loading ? '...' : stats?.total_meetings ?? 0}
                </span>
              </div>
            </div>

            {/* Active Rooms */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                  Active Live Rooms
                </span>
                <span className="text-2xl font-bold text-white">
                  {loading ? '...' : stats?.active_meetings ?? 0}
                </span>
              </div>
            </div>

            {/* Scheduled Meetings */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                  Scheduled Meetings
                </span>
                <span className="text-2xl font-bold text-white">
                  {loading ? '...' : stats?.scheduled_meetings ?? 0}
                </span>
              </div>
            </div>

            {/* Total Room Entries */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                  Total Attendance Logs
                </span>
                <span className="text-2xl font-bold text-white">
                  {loading ? '...' : stats?.total_participants ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Tables Preview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Registered Users Preview */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-100">Recent Users</h3>
                  <p className="text-xs text-gray-400">System user registrations</p>
                </div>
                <Link
                  href="/admin/users"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 flex justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-800">
                      <tr>
                        <th className="py-2.5 px-3">User</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {recentUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-800/30">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-gray-200">{u.name}</div>
                            <div className="text-[11px] text-gray-400">{u.email}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px]">
                            {u.account_role === 'OWNER' && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                OWNER
                              </span>
                            )}
                            {u.account_role === 'ADMIN' && (
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                                ADMIN
                              </span>
                            )}
                            {u.account_role === 'MEMBER' && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">
                                MEMBER
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {u.is_active ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                                Disabled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Meetings System Preview */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-100">System Meetings</h3>
                  <p className="text-xs text-gray-400">Active and past meeting sessions</p>
                </div>
                <Link
                  href="/admin/meetings"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 flex justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-800">
                      <tr>
                        <th className="py-2.5 px-3">Title & ID</th>
                        <th className="py-2.5 px-3">Host</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {recentMeetings.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-800/30">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-gray-200">{m.title}</div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              ID: {m.meeting_id}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-300">
                            {m.host_name || `User #${m.host_user_id}`}
                          </td>
                          <td className="py-3 px-3">
                            {m.status === 'active' && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold animate-pulse">
                                Live Active
                              </span>
                            )}
                            {m.status === 'scheduled' && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                Scheduled
                              </span>
                            )}
                            {m.status === 'ended' && (
                              <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                Ended
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}

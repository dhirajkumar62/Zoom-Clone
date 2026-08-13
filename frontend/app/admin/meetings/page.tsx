'use client';

import React, { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { fetchAdminMeetings, endMeeting } from '@/lib/api';
import { AdminMeeting } from '@/lib/types';
import {
  Video,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  ExternalLink,
  OctagonX,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import Link from 'next/link';

function AdminMeetingsContent() {
  const [meetings, setMeetings] = useState<AdminMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminMeetings(searchQuery, statusFilter);
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMeetings();
  };

  const handleEndMeeting = async (m: AdminMeeting) => {
    if (!window.confirm(`Are you sure you want to administratively end meeting "${m.title}" (${m.meeting_id})?`)) {
      return;
    }

    setError(null);
    try {
      await endMeeting(m.meeting_id);
      setSuccessMsg(`Meeting ${m.meeting_id} ended successfully.`);
      loadMeetings();
    } catch (err: any) {
      setError(err.message || 'Failed to end meeting');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-gray-800">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <Video className="w-6 h-6 text-purple-500" />
                <span>System Meetings & Session Management</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Monitor all created meeting rooms across the platform, view host assignments, and force-end sessions if required.
              </p>
            </div>

            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold self-start md:self-auto transition-all"
            >
              &larr; Back to Admin Overview
            </Link>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search title or meeting ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input text-white placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shrink-0"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-lg text-xs bg-gray-900 border border-gray-800 text-white focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="active font-bold">Active Only</option>
                  <option value="scheduled">Scheduled Only</option>
                  <option value="ended">Ended Only</option>
                </select>
              </div>

              <button
                onClick={loadMeetings}
                disabled={loading}
                title="Reload"
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Meetings Table */}
          <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden">
            {loading ? (
              <div className="py-16 flex justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Meeting Title & ID</th>
                      <th className="py-3 px-4">Host Name</th>
                      <th className="py-3 px-4">Participants</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {meetings.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-100 text-sm">{m.title}</div>
                          <div className="text-gray-400 text-xs font-mono">ID: {m.meeting_id}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-gray-200">{m.host_name || `User #${m.host_user_id}`}</div>
                          <div className="text-[11px] text-gray-400">Host User ID: {m.host_user_id}</div>
                        </td>

                        <td className="py-3.5 px-4 text-gray-300 font-medium">
                          {m.participants_count ?? m.participants?.length ?? 0} attendees
                        </td>

                        <td className="py-3.5 px-4">
                          {m.status === 'active' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              Live Active
                            </span>
                          )}
                          {m.status === 'scheduled' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              <Calendar className="w-3 h-3" />
                              Scheduled
                            </span>
                          )}
                          {m.status === 'ended' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                              <Clock className="w-3 h-3" />
                              Ended
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Link
                            href={`/meeting/${m.meeting_id}`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Join / Inspect</span>
                          </Link>

                          {m.status !== 'ended' && (
                            <button
                              onClick={() => handleEndMeeting(m)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all inline-flex items-center gap-1"
                            >
                              <OctagonX className="w-3 h-3" />
                              <span>End Session</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminMeetingsPage() {
  return (
    <AdminRoute>
      <AdminMeetingsContent />
    </AdminRoute>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { fetchAdminParticipants } from '@/lib/api';
import { Participant } from '@/lib/types';
import {
  UserCheck,
  Search,
  RefreshCw,
  Loader2,
  Clock,
  ShieldCheck,
  Shield,
  User,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

function AdminParticipantsContent() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingIdFilter, setMeetingIdFilter] = useState('');

  const loadParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminParticipants(meetingIdFilter);
      setParticipants(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadParticipants();
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
                <UserCheck className="w-6 h-6 text-emerald-500" />
                <span>Attendance & Participant Logs</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Real-time and historic tracking of user session entries, meeting roles, and timestamps.
              </p>
            </div>

            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold self-start md:self-auto transition-all"
            >
              &larr; Back to Admin Overview
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Filter Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by Meeting ID (e.g. 482719365)..."
                  value={meetingIdFilter}
                  onChange={(e) => setMeetingIdFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input text-white placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shrink-0"
              >
                Filter
              </button>
            </form>

            <button
              onClick={loadParticipants}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>

          {/* Participants Table */}
          <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden">
            {loading ? (
              <div className="py-16 flex justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Participant Name</th>
                      <th className="py-3 px-4">Meeting ID</th>
                      <th className="py-3 px-4">Meeting Role</th>
                      <th className="py-3 px-4">Joined At</th>
                      <th className="py-3 px-4">Left At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {participants.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-100 text-sm">{p.display_name}</div>
                          {p.email && <div className="text-gray-400 text-xs">{p.email}</div>}
                          <div className="text-[10px] text-gray-500 font-mono">User ID: #{p.user_id}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-gray-200">
                          {p.meeting_id}
                        </td>

                        <td className="py-3.5 px-4">
                          {p.meeting_role === 'HOST' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Shield className="w-3 h-3 text-amber-400" />
                              HOST
                            </span>
                          )}
                          {p.meeting_role === 'CO_HOST' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              <ShieldCheck className="w-3 h-3 text-purple-400" />
                              CO-HOST
                            </span>
                          )}
                          {p.meeting_role === 'PARTICIPANT' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              <User className="w-3 h-3" />
                              PARTICIPANT
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-300 font-mono text-[11px]">
                          {new Date(p.joined_at).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          {p.left_at ? (
                            <span className="text-gray-400 font-mono text-[11px]">
                              {new Date(p.left_at).toLocaleString()}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px] animate-pulse">
                              Currently In Session
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
        </main>
      </div>
    </div>
  );
}

export default function AdminParticipantsPage() {
  return (
    <AdminRoute>
      <AdminParticipantsContent />
    </AdminRoute>
  );
}

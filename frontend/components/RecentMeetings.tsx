'use client';

import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { Meeting } from '@/lib/types';
import { getRecentMeetings } from '@/lib/api';
import MeetingCard from './MeetingCard';

interface RecentMeetingsProps {
  refreshKey?: number;
  searchQuery?: string;
}

export default function RecentMeetings({ refreshKey = 0, searchQuery = '' }: RecentMeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecentMeetings();
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recent meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [refreshKey]);

  const filteredMeetings = meetings.filter((m) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query)) ||
      m.meeting_id.includes(query)
    );
  });

  return (
    <section className="space-y-4" id="recent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100">Recent Meetings</h2>
            <p className="text-xs text-gray-400">History of your created or concluded sessions</p>
          </div>
        </div>

        <button
          onClick={fetchMeetings}
          disabled={loading}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Refresh recent meetings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-5 rounded-2xl animate-pulse space-y-4">
              <div className="h-5 bg-gray-800 rounded w-3/4" />
              <div className="h-4 bg-gray-800/60 rounded w-1/2" />
              <div className="h-8 bg-gray-800/40 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-4 rounded-xl glass-card border-red-500/30 text-red-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>Unable to load recent meetings.</span>
          </div>
          <button
            onClick={fetchMeetings}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredMeetings.length === 0 && (
        <div className="glass-card p-8 rounded-2xl text-center space-y-2 border-dashed border-gray-800">
          <div className="w-12 h-12 rounded-2xl bg-gray-800/80 flex items-center justify-center mx-auto text-gray-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-200">
            {searchQuery ? 'No matching meetings found' : 'No meeting history'}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery
              ? `No recent meetings matched "${searchQuery}".`
              : 'Meetings you create or complete will appear here for easy reference.'}
          </p>
        </div>
      )}

      {/* Meetings Grid */}
      {!loading && !error && filteredMeetings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </section>
  );
}

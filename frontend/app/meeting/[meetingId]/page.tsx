'use client';

import React, { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Meeting } from '@/lib/types';
import { getMeetingDetails, joinMeeting } from '@/lib/api';
import MeetingRoom from '@/components/MeetingRoom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle, Video, User, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function MeetingContent({ params }: { params: Promise<{ meetingId: string }> }) {
  const resolvedParams = use(params);
  const rawMeetingId = resolvedParams.meetingId;
  const router = useRouter();
  const { user } = useAuth();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Participant entry modal state
  const [displayName, setDisplayName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [joining, setJoining] = useState(false);
  const [participantId, setParticipantId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchMeeting = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getMeetingDetails(rawMeetingId);
        setMeeting(data);

        // Retrieve display name from logged in user profile or localStorage
        const activeName = user?.name || localStorage.getItem('zoom_display_name');
        if (activeName) {
          setDisplayName(activeName);
          try {
            const joinRes = await joinMeeting(data.meeting_id, activeName);
            setParticipantId(joinRes.participant_id);
          } catch {
            // Proceed even if participant join endpoint call returns warning
          }
        } else {
          setShowNamePrompt(true);
        }
      } catch (err: any) {
        setError(err.message || 'Meeting not found or failed to load');
      } finally {
        setLoading(false);
      }
    };

    if (rawMeetingId) {
      fetchMeeting();
    }
  }, [rawMeetingId, user]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !meeting) return;

    setJoining(true);
    try {
      const joinRes = await joinMeeting(meeting.meeting_id, displayName.trim());
      localStorage.setItem('zoom_display_name', displayName.trim());
      setParticipantId(joinRes.participant_id);
      setShowNamePrompt(false);
    } catch (err: any) {
      alert(`Error joining meeting: ${err.message}`);
    } finally {
      setJoining(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a12] flex flex-col items-center justify-center p-4 text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold">Connecting to Meeting...</h2>
          <p className="text-xs text-gray-400">Validating Meeting ID and preparing media room</p>
        </div>
      </div>
    );
  }

  // Error State (e.g. Meeting Not Found)
  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-[#070a12] flex flex-col items-center justify-center p-4 text-white">
        <div className="glass-panel p-8 rounded-3xl border border-gray-800 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-100">Meeting Not Found</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              {error || "The requested meeting ID does not exist or has been removed."}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  // Display Name Prompt Modal if user hasn't set display name yet
  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-[#070a12] flex flex-col items-center justify-center p-4 text-white">
        <div className="glass-panel p-8 rounded-3xl border border-gray-800 max-w-md w-full space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Enter Your Name</h2>
              <p className="text-xs text-gray-400">Joining "{meeting.title}"</p>
            </div>
          </div>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Display Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhiraj Kumar"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-white placeholder-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={joining || !displayName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>Enter Meeting Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Meeting Room View
  return (
    <MeetingRoom
      meeting={meeting}
      displayName={displayName || 'Guest'}
      participantId={participantId}
    />
  );
}

export default function MeetingPage({ params }: { params: Promise<{ meetingId: string }> }) {
  return (
    <ProtectedRoute>
      <MeetingContent params={params} />
    </ProtectedRoute>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { X, Video, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { joinMeeting } from '@/lib/api';
import { extractMeetingId } from '@/lib/utils';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMeetingId?: string;
}

export default function JoinMeetingModal({ isOpen, onClose, initialMeetingId = '' }: JoinMeetingModalProps) {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState(initialMeetingId);
  const [displayName, setDisplayName] = useState('Dhiraj');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMeetingId) {
      setMeetingInput(initialMeetingId);
    }
    // Retrieve stored display name if any
    const savedName = localStorage.getItem('zoom_display_name');
    if (savedName) {
      setDisplayName(savedName);
    }
  }, [initialMeetingId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = extractMeetingId(meetingInput);
    if (!cleanId) {
      setError('Please enter a valid Meeting ID or invite URL');
      return;
    }

    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    setLoading(true);

    try {
      // Validate meeting & create participant record
      const result = await joinMeeting(cleanId, displayName.trim());
      localStorage.setItem('zoom_display_name', displayName.trim());
      localStorage.setItem(`zoom_participant_${cleanId}`, JSON.stringify(result));
      
      onClose();
      router.push(`/meeting/${cleanId}`);
    } catch (err: any) {
      setError(err.message || 'Unable to join meeting. Please check the Meeting ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-gray-800 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Join Meeting</h3>
              <p className="text-xs text-gray-400">Enter details to enter the video room</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Meeting ID or Invite Link *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 482 719 365 or http://localhost:3000/meeting/482719365"
              value={meetingInput}
              onChange={(e) => setMeetingInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm glass-input placeholder-gray-500 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Your Display Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input placeholder-gray-500 text-white"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>Join Meeting</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

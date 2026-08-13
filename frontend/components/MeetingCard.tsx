'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Copy, Check, Video, Users, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Meeting } from '@/lib/types';
import { formatMeetingId } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface MeetingCardProps {
  meeting: Meeting;
  onJoinClick?: (meetingId: string) => void;
}

export default function MeetingCard({ meeting, onJoinClick }: MeetingCardProps) {
  const [copied, setCopied] = useState(false);

  const formattedId = formatMeetingId(meeting.meeting_id);
  const fullInviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/meeting/${meeting.meeting_id}`
    : `/meeting/${meeting.meeting_id}`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(fullInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (meeting.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live Now
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Calendar className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'ended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 border border-gray-700">
            Ended
          </span>
        );
      default:
        return null;
    }
  };

  const formatScheduledTime = () => {
    if (!meeting.scheduled_at) return 'Instant Session';
    try {
      const date = parseISO(meeting.scheduled_at);
      return format(date, 'EEEE, MMM d, yyyy • h:mm a');
    } catch {
      return meeting.scheduled_at;
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between gap-4 group relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/15 transition-all pointer-events-none" />

      <div>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">
              {meeting.title}
            </h3>
            {meeting.description && (
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                {meeting.description}
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Meeting Details Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-800/80 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span>{formatScheduledTime()}</span>
          </div>

          {meeting.duration_minutes && (
            <div className="flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Duration: {meeting.duration_minutes} mins</span>
            </div>
          )}

          <div className="flex items-center gap-2 sm:col-span-2 text-gray-400">
            <span className="font-mono text-[11px] bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800 text-gray-300">
              ID: {formattedId}
            </span>
            {meeting.participants && meeting.participants.length > 0 && (
              <div className="flex items-center gap-1 text-gray-400 ml-auto">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>{meeting.participants.length} attendee(s)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Card Controls */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-800/60 mt-1">
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-colors"
          title="Copy shareable link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied Link!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-400" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        <Link
          href={`/meeting/${meeting.meeting_id}`}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            meeting.status === 'ended'
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
          }`}
        >
          <span>{meeting.status === 'ended' ? 'View Details' : 'Join Room'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

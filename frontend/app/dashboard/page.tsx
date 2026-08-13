'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import UpcomingMeetings from '@/components/UpcomingMeetings';
import RecentMeetings from '@/components/RecentMeetings';
import JoinMeetingModal from '@/components/JoinMeetingModal';
import ScheduleMeetingModal from '@/components/ScheduleMeetingModal';
import NotificationsModal from '@/components/NotificationsModal';
import SettingsModal from '@/components/SettingsModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Video, UserPlus, Calendar, Plus, Sparkles, Loader2, Search, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createInstantMeeting } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [creatingInstant, setCreatingInstant] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNewMeeting = async () => {
    setCreatingInstant(true);
    try {
      const meeting = await createInstantMeeting({ title: 'Instant Meeting' });
      if (user?.name) {
        localStorage.setItem('zoom_display_name', user.name);
      }
      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err: any) {
      alert(`Failed to create meeting: ${err.message || 'Server error'}`);
      setCreatingInstant(false);
    }
  };

  const handleScheduleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const userName = user?.name || 'User';

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-gray-100 selection:bg-blue-500 selection:text-white">
      {/* Top Application Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar Navigation */}
        <Sidebar
          onJoinClick={() => setIsJoinOpen(true)}
          onScheduleClick={() => setIsScheduleOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header Greeting Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Good morning, {userName}</span>
                <span>👋</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Welcome to your MeetFlow workspace. Manage your instant and scheduled video meetings.
              </p>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meetings..."
                  className="pl-9 pr-4 py-2 rounded-xl text-xs glass-input text-white placeholder-gray-500 w-48 focus:w-60 transition-all"
                />
              </div>

              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="p-2.5 rounded-xl glass-panel border border-gray-800 text-gray-400 hover:text-white transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
              </button>
            </div>
          </div>

          {/* Hero Banner with Quick Actions */}
          <div className="relative rounded-3xl p-6 lg:p-8 overflow-hidden bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 shadow-2xl">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MeetFlow Video Conferencing</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Start or Join a Session Immediately
              </h2>
              <p className="text-xs lg:text-sm text-gray-300 leading-relaxed">
                Connect with team members, conduct interviews, or host classes with high-definition video.
              </p>
            </div>

            {/* Quick Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {/* Action 1: New Meeting */}
              <button
                onClick={handleNewMeeting}
                disabled={creatingInstant}
                className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-left shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    {creatingInstant ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Video className="w-6 h-6" />
                    )}
                  </div>
                  <Plus className="w-5 h-5 text-white/70 group-hover:scale-125 transition-transform" />
                </div>
                <h3 className="text-base font-extrabold">New Meeting</h3>
                <p className="text-xs text-orange-100/90 font-normal mt-0.5">
                  Start an instant room
                </p>
              </button>

              {/* Action 2: Join Meeting */}
              <button
                onClick={() => setIsJoinOpen(true)}
                className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-left shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-base font-extrabold">Join Meeting</h3>
                <p className="text-xs text-blue-100/90 font-normal mt-0.5">
                  via ID or invite link
                </p>
              </button>

              {/* Action 3: Schedule Meeting */}
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="group relative p-5 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-left shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-base font-extrabold">Schedule</h3>
                <p className="text-xs text-emerald-100/90 font-normal mt-0.5">
                  Plan future sessions
                </p>
              </button>
            </div>
          </div>

          {/* Upcoming Meetings Section */}
          <UpcomingMeetings
            refreshKey={refreshKey}
            searchQuery={searchQuery}
            onScheduleClick={() => setIsScheduleOpen(true)}
          />

          {/* Recent Meetings Section */}
          <RecentMeetings refreshKey={refreshKey} searchQuery={searchQuery} />
        </main>
      </div>

      {/* Modals */}
      <JoinMeetingModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={handleScheduleSuccess}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function ApplicationDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

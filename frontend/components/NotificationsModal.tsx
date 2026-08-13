'use client';

import React, { useState } from 'react';
import { X, Bell, CheckCircle2, Video, Calendar, ShieldCheck, Trash2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'meeting' | 'system' | 'auth';
  read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Product Strategy Sync',
      message: 'Upcoming meeting scheduled for tomorrow at 10:00 AM.',
      time: '10m ago',
      type: 'meeting',
      read: false,
    },
    {
      id: '2',
      title: 'Secure JWT Session Active',
      message: 'Authenticated securely with bcrypt password hashing.',
      time: '1h ago',
      type: 'auth',
      read: false,
    },
    {
      id: '3',
      title: 'MeetFlow HD Video Ready',
      message: 'High-definition WebRTC video grid and screen sharing online.',
      time: '2h ago',
      type: 'system',
      read: true,
    },
  ]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'auth':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <Video className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-md w-full rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Notifications</h2>
              <p className="text-xs text-gray-400">System alerts and meeting updates</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        {notifications.length > 0 && (
          <div className="px-5 py-2.5 bg-gray-950/40 border-b border-gray-800/80 flex items-center justify-between text-xs">
            <button
              onClick={markAllAsRead}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="text-gray-400 hover:text-red-400 font-semibold transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}

        {/* Content list */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Bell className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-xs font-semibold text-gray-400">No notifications</p>
              <p className="text-[11px] text-gray-500">You're all caught up with your meetings!</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-colors flex items-start gap-3 ${
                  item.read
                    ? 'bg-gray-900/40 border-gray-800/60 text-gray-400'
                    : 'bg-blue-950/30 border-blue-500/30 text-gray-200 shadow-md shadow-blue-950/20'
                }`}
              >
                <div className="p-2 rounded-xl bg-gray-900 border border-gray-800 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                    <span className="text-[10px] text-gray-500 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-300">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/40 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

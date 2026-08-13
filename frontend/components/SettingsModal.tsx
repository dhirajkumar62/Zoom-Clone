'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Camera, Mic, Volume2, ShieldCheck, User, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [saved, setSaved] = useState(false);

  // Device test state
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCam, setSelectedCam] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [testingCam, setTestingCam] = useState(false);
  const [camSuccess, setCamSuccess] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zoom_display_name');
      if (stored) setDisplayName(stored);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        const audioInputs = devices.filter((d) => d.kind === 'audioinput');
        setCameras(videoInputs);
        setMics(audioInputs);
        if (videoInputs.length > 0) setSelectedCam(videoInputs[0].deviceId);
        if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      localStorage.setItem('zoom_display_name', displayName.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const testCameraStream = async () => {
    setTestingCam(true);
    setCamSuccess(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCamSuccess(true);
      // Stop preview after 2 seconds
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop());
        setTestingCam(false);
      }, 2500);
    } catch (err) {
      alert('Could not access camera device. Please grant browser camera permissions.');
      setTestingCam(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-lg w-full rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Application Settings</h2>
              <p className="text-xs text-gray-400">Audio, Video, and Profile Preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* User Profile Section */}
          <form onSubmit={handleSave} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Profile Settings</span>
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Display Name in Meetings</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Dhiraj Kumar"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm glass-input text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Update</span>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Camera Settings */}
          <div className="space-y-3 pt-4 border-t border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Setup</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Selected Video Device</label>
              <select
                value={selectedCam}
                onChange={(e) => setSelectedCam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs glass-input text-white bg-gray-900 focus:outline-none"
              >
                {cameras.length === 0 ? (
                  <option value="">Default System Camera</option>
                ) : (
                  cameras.map((c, idx) => (
                    <option key={c.deviceId || idx} value={c.deviceId}>
                      {c.label || `Camera Device ${idx + 1}`}
                    </option>
                  ))
                )}
              </select>

              <button
                type="button"
                onClick={testCameraStream}
                disabled={testingCam}
                className="w-full py-2.5 px-4 rounded-xl glass-panel border border-gray-700 hover:bg-gray-800 text-gray-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {testingCam ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>Testing Camera Permissions...</span>
                  </>
                ) : camSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Camera Working Perfectly!</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Test Camera Stream</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Microphone Settings */}
          <div className="space-y-3 pt-4 border-t border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              <span>Microphone & Audio</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Selected Microphone Input</label>
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs glass-input text-white bg-gray-900 focus:outline-none"
              >
                {mics.length === 0 ? (
                  <option value="">Default System Microphone</option>
                ) : (
                  mics.map((m, idx) => (
                    <option key={m.deviceId || idx} value={m.deviceId}>
                      {m.label || `Microphone Input ${idx + 1}`}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Auth & System Details */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>JWT Authentication Details</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase">
                {user?.role || 'USER'}
              </span>
            </div>
            <div className="text-xs text-gray-400 space-y-1 font-mono text-[11px]">
              <p>Email: <span className="text-gray-200">{user?.email || 'user@example.com'}</span></p>
              <p>User ID: <span className="text-gray-200">{user?.id || 1}</span></p>
              <p>Encryption: <span className="text-gray-200">HS256 Bearer Token</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/40 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

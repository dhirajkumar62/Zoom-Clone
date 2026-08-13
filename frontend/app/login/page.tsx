'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Video, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const { login, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.push(redirectPath);
    } catch (err) {
      // Error state handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-auto space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Video className="w-6 h-6" />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome Back to MeetFlow
        </h1>
        <p className="text-xs text-gray-400">
          Sign in to access your dashboard and active meeting rooms.
        </p>
      </div>

      {/* Login Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-5">
        {authError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <input
              type="email"
              placeholder="dhiraj@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm glass-input text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm glass-input text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300/90 space-y-1">
          <p className="font-semibold text-blue-200">Demo Seed Accounts:</p>
          <p>• User: <code className="text-white">dhiraj@example.com</code> / <code className="text-white">password123</code></p>
          <p>• Admin: <code className="text-white">admin@example.com</code> / <code className="text-white">admin123</code></p>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-400 font-bold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center text-xs text-gray-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          Loading...
        </div>
      }>
        <LoginFormContent />
      </Suspense>

      {/* Bottom Copyright */}
      <div className="max-w-md w-full mx-auto text-center text-gray-500 text-[11px]">
        © 2026 MeetFlow Platform. All rights reserved.
      </div>
    </div>
  );
}

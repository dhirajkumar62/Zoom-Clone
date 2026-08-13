'use client';

import React, { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { fetchAdminUsers, updateUserRole, updateUserStatus } from '@/lib/api';
import { User, AccountRole } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Loader2,
  RefreshCw,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import Link from 'next/link';

function AdminUsersContent() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Role Change Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<AccountRole>('MEMBER');
  const [updating, setUpdating] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeBool = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;
      const data = await fetchAdminUsers(searchQuery, roleFilter, activeBool);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleRoleUpdate = async () => {
    if (!editingUser) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateUserRole(editingUser.id, selectedRole);
      setSuccessMsg(`Updated role for ${updated.name} to ${updated.account_role}`);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    const nextStatus = !targetUser.is_active;
    const confirmMsg = nextStatus
      ? `Are you sure you want to activate ${targetUser.name}'s account?`
      : `Are you sure you want to deactivate ${targetUser.name}'s account? They will be logged out and blocked.`;

    if (!window.confirm(confirmMsg)) return;

    setError(null);
    try {
      const updated = await updateUserStatus(targetUser.id, nextStatus);
      setSuccessMsg(
        `Account status for ${updated.name} updated to ${updated.is_active ? 'Active' : 'Disabled'}`
      );
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update account status');
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
                <Users className="w-6 h-6 text-blue-500" />
                <span>User Account & Role Management</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Enforce Role-Based Access Control (OWNER, ADMIN, MEMBER) and manage user account statuses.
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

          {/* Filters & Search Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
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
                <span>Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-lg text-xs bg-gray-900 border border-gray-800 text-white focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MEMBER">MEMBER</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-lg text-xs bg-gray-900 border border-gray-800 text-white focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Disabled Only</option>
                </select>
              </div>

              <button
                onClick={loadUsers}
                disabled={loading}
                title="Reload"
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden">
            {loading ? (
              <div className="py-16 flex justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">User Details</th>
                      <th className="py-3 px-4">Account Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {users.map((u) => {
                      const isSelf = currentUser?.id === u.id;
                      const isOwnerUser = u.account_role === 'OWNER';
                      const isAdminUser = u.account_role === 'ADMIN';

                      return (
                        <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-100 text-sm">{u.name}</div>
                            <div className="text-gray-400 text-xs">{u.email}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            {u.account_role === 'OWNER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Shield className="w-3 h-3 text-amber-400" />
                                OWNER
                              </span>
                            )}
                            {u.account_role === 'ADMIN' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                <ShieldCheck className="w-3 h-3 text-purple-400" />
                                ADMIN
                              </span>
                            )}
                            {u.account_role === 'MEMBER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                MEMBER
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {u.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <UserCheck className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                                <UserX className="w-3 h-3" />
                                Disabled
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-2">
                            {/* Change Role Button */}
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setSelectedRole(u.account_role);
                              }}
                              disabled={
                                currentUser?.account_role === 'ADMIN' && (isOwnerUser || isSelf)
                              }
                              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Role</span>
                            </button>

                            {/* Status Toggle Button */}
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isSelf || (currentUser?.account_role === 'ADMIN' && isOwnerUser)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1 ${
                                u.is_active
                                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {u.is_active ? 'Disable' : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Role Change Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Modify User Account Role</h3>
                <p className="text-xs text-gray-400">{editingUser.name} ({editingUser.email})</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Select New Account Role
              </label>

              <div className="space-y-2">
                {currentUser?.account_role === 'OWNER' && (
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 cursor-pointer hover:bg-amber-500/20 transition-all">
                    <input
                      type="radio"
                      name="roleOption"
                      value="OWNER"
                      checked={selectedRole === 'OWNER'}
                      onChange={() => setSelectedRole('OWNER')}
                      className="text-amber-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-amber-300 block">OWNER</span>
                      <span className="text-[11px] text-gray-400">Full system control, administrative oversight, and role assignments</span>
                    </div>
                  </label>
                )}

                <label className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 cursor-pointer hover:bg-purple-500/20 transition-all">
                  <input
                    type="radio"
                    name="roleOption"
                    value="ADMIN"
                    checked={selectedRole === 'ADMIN'}
                    onChange={() => setSelectedRole('ADMIN')}
                    className="text-purple-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-purple-300 block">ADMIN</span>
                    <span className="text-[11px] text-gray-400">Can manage MEMBER users, view all meetings, and moderate live rooms</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 cursor-pointer hover:bg-blue-500/20 transition-all">
                  <input
                    type="radio"
                    name="roleOption"
                    value="MEMBER"
                    checked={selectedRole === 'MEMBER'}
                    onChange={() => setSelectedRole('MEMBER')}
                    className="text-blue-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-blue-300 block">MEMBER</span>
                    <span className="text-[11px] text-gray-400">Standard user account; create, schedule, and join video meetings</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleUpdate}
                disabled={updating}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Role Change</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminRoute>
      <AdminUsersContent />
    </AdminRoute>
  );
}

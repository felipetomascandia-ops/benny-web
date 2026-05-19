"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, LogOut, User as UserIcon, Mail, Phone, Calendar, Send, X, CheckCircle2, UserPlus, Eye, EyeOff, MapPin, MailPlus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AdminUserRow = {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    full_name?: string;
  };
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Broadcast State
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Create User State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    password: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createFeedback, setCreateFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Invite State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Edit/Delete State
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const metadata = user.user_metadata;
      const values = [
        user.email,
        metadata.first_name || "",
        metadata.last_name || "",
        metadata.phone || "",
      ];
      return values.some((value) => value.toLowerCase().includes(term));
    });
  }, [users, search]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = (await response.json()) as { users?: AdminUserRow[]; error?: string };

      if (!response.ok) {
        setError(payload.error || "Could not load users.");
        setUsers([]);
        return;
      }

      setUsers(payload.users || []);
    } catch {
      setError("Could not load users.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleLogout() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    setCreateFeedback(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const payload = await response.json();

      if (!response.ok) {
        setCreateFeedback({ type: "error", message: payload.error || "Failed to create user." });
        return;
      }

      setCreateFeedback({ type: "success", message: payload.message });
      setNewUser({ email: "", firstName: "", lastName: "", phone: "", address: "", password: "" });
      void load();
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateFeedback(null);
      }, 2000);
    } catch {
      setCreateFeedback({ type: "error", message: "An error occurred while creating the user." });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleInviteUser(e: React.FormEvent) {
    e.preventDefault();
    setIsInviting(true);
    setInviteFeedback(null);

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          firstName: inviteName,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setInviteFeedback({ type: "error", message: payload.error || "Failed to send invitation." });
        return;
      }

      setInviteFeedback({ type: "success", message: payload.message });
      setInviteEmail("");
      setInviteName("");
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteFeedback(null);
      }, 2000);
    } catch {
      setInviteFeedback({ type: "error", message: "An error occurred while sending the invitation." });
    } finally {
      setIsInviting(false);
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdating(true);
    setEditFeedback(null);

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editingUser.email,
          firstName: editingUser.user_metadata.first_name,
          lastName: editingUser.user_metadata.last_name,
          phone: editingUser.user_metadata.phone,
          address: editingUser.user_metadata.address,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setEditFeedback({ type: "error", message: payload.error || "Failed to update user." });
        return;
      }

      setEditFeedback({ type: "success", message: payload.message });
      void load();
      setTimeout(() => {
        setShowEditModal(false);
        setEditFeedback(null);
      }, 2000);
    } catch {
      setEditFeedback({ type: "error", message: "An error occurred while updating the user." });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteUser() {
    if (!editingUser) return;
    setIsDeleting(true);
    setEditFeedback(null);

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        setEditFeedback({ type: "error", message: payload.error || "Failed to delete user." });
        return;
      }

      setEditFeedback({ type: "success", message: payload.message });
      void load();
      setTimeout(() => {
        setShowEditModal(false);
        setShowDeleteConfirm(false);
        setEditFeedback(null);
      }, 2000);
    } catch {
      setEditFeedback({ type: "error", message: "An error occurred while deleting the user." });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    setIsBroadcasting(true);
    setBroadcastFeedback(null);

    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: broadcastSubject,
          content: broadcastContent,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setBroadcastFeedback({ type: "error", message: payload.error || "Failed to send broadcast." });
        return;
      }

      setBroadcastFeedback({ type: "success", message: payload.message });
      setBroadcastSubject("");
      setBroadcastContent("");
      setTimeout(() => setShowBroadcast(false), 3000);
    } catch {
      setBroadcastFeedback({ type: "error", message: "An error occurred while sending the broadcast." });
    } finally {
      setIsBroadcasting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8fc] py-16 text-slate-900">
      <div className="container-shell">
        <div className="soft-card overflow-hidden">
          <div className="border-b border-slate-200 bg-white px-6 py-8 md:px-10">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="shrink-0">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-sky-600">Admin</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 uppercase">
                  VIP <span className="text-sky-600">Users</span>
                </h1>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Manage discount club members and communications.
                </p>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:flex-wrap xl:justify-end">
                {/* Navigation Links */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Appointments
                  </Link>
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/invoices"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Invoices
                  </Link>
                </div>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Create User
                  </button>

                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                  >
                    <MailPlus className="w-3.5 h-3.5" /> Invite User
                  </button>

                  <button
                    onClick={() => setShowBroadcast(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
                  >
                    <Send className="w-3.5 h-3.5" /> Broadcast
                  </button>
                </div>

                {/* Search & Logout */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search users..."
                      className="w-full lg:w-[180px] rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-sky-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-bold">
                {error}
              </div>
            )}
          </div>

          <div className="bg-white px-6 py-8 md:px-10">
            {isLoading ? (
              <div className="flex items-center gap-3 text-slate-600">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Loading users...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <th className="pb-4 pr-4">Member</th>
                      <th className="pb-4 pr-4">Contact</th>
                      <th className="pb-4 pr-4">Registration</th>
                      <th className="pb-4 pr-4 text-center">Email Status</th>
                      <th className="pb-4 text-right pr-12">Last Session</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-black uppercase text-xs border border-sky-100">
                              {user.user_metadata.first_name?.[0]}{user.user_metadata.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 uppercase tracking-tight">
                                {user.user_metadata.first_name} {user.user_metadata.last_name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VIP Member</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 pr-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Mail className="w-3 h-3 text-sky-500" />
                              <span className="font-medium">{user.email}</span>
                            </div>
                            {user.user_metadata.phone && (
                              <div className="flex items-center gap-2 text-slate-500">
                                <Phone className="w-3 h-3 text-sky-400" />
                                <span className="text-xs">{user.user_metadata.phone}</span>
                              </div>
                            )}
                            {user.user_metadata.address && (
                              <div className="flex items-center gap-2 text-slate-500">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] italic leading-tight max-w-[150px] block">{user.user_metadata.address}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-6 pr-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs font-bold">{new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-6 pr-4 text-center">
                          {user.email_confirmed_at ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-100">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-6 text-right pr-12">
                          <p className="text-xs text-slate-500 font-bold uppercase">
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleString() 
                              : "Never"}
                          </p>
                        </td>
                        <td className="py-6 text-right">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditModal(true);
                              setShowDeleteConfirm(false);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100 hover:border-blue-100"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-blue-600 px-8 py-6 flex items-center justify-between text-white">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Create New User</h3>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-widest">Register a new VIP member</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                  <input
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="John"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                  <input
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Home Address</label>
                  <input
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    placeholder="123 Pool St, Pennsylvania"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {createFeedback && (
                <div className={cn(
                  "p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2",
                  createFeedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                )}>
                  {createFeedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="w-full h-16 flex items-center justify-center gap-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {isCreating ? (
                  <LoaderCircle className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create VIP Member
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-600 px-8 py-6 flex items-center justify-between text-white">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Invite VIP Member</h3>
                <p className="text-emerald-100 text-xs font-medium uppercase tracking-widest">Send a registration link via email</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Client Name (Optional)</label>
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              {inviteFeedback && (
                <div className={cn(
                  "p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2",
                  inviteFeedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                )}>
                  {inviteFeedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isInviting}
                className="w-full h-16 flex items-center justify-center gap-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              >
                {isInviting ? (
                  <LoaderCircle className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Invitation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 px-8 py-6 flex items-center justify-between text-white">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Edit VIP Member</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Update user information or delete account</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                  <input
                    required
                    value={editingUser.user_metadata.first_name || ""}
                    onChange={(e) => setEditingUser({ 
                      ...editingUser, 
                      user_metadata: { ...editingUser.user_metadata, first_name: e.target.value } 
                    })}
                    placeholder="John"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                  <input
                    required
                    value={editingUser.user_metadata.last_name || ""}
                    onChange={(e) => setEditingUser({ 
                      ...editingUser, 
                      user_metadata: { ...editingUser.user_metadata, last_name: e.target.value } 
                    })}
                    placeholder="Doe"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                <input
                  value={editingUser.user_metadata.phone || ""}
                  onChange={(e) => setEditingUser({ 
                    ...editingUser, 
                    user_metadata: { ...editingUser.user_metadata, phone: e.target.value } 
                  })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Home Address</label>
                <input
                  value={editingUser.user_metadata.address || ""}
                  onChange={(e) => setEditingUser({ 
                    ...editingUser, 
                    user_metadata: { ...editingUser.user_metadata, address: e.target.value } 
                  })}
                  placeholder="123 Pool St, Pennsylvania"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {editFeedback && (
                <div className={cn(
                  "p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2",
                  editFeedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                )}>
                  {editFeedback.message}
                </div>
              )}

              <div className="flex gap-4">
                {!showDeleteConfirm ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-16 h-16 flex items-center justify-center bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all"
                      title="Delete User"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 h-16 flex items-center justify-center gap-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <LoaderCircle className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Update Member
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-rose-50 rounded-2xl p-6 border border-rose-100 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3 text-rose-700 mb-4">
                      <AlertTriangle className="w-6 h-6" />
                      <p className="font-black uppercase tracking-tight text-sm">Delete Account?</p>
                    </div>
                    <p className="text-xs text-rose-600 font-medium mb-6">
                      This action is permanent and cannot be undone. All user data will be removed.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 h-12 bg-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-200 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteUser}
                        disabled={isDeleting}
                        className="flex-1 h-12 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition disabled:opacity-50 flex items-center justify-center"
                      >
                        {isDeleting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-sky-600 px-8 py-6 flex items-center justify-between text-white">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Global Broadcast</h3>
                <p className="text-sky-100 text-xs font-medium uppercase tracking-widest">Send email to {users.length} members</p>
              </div>
              <button onClick={() => setShowBroadcast(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Subject</label>
                <input
                  required
                  value={broadcastSubject}
                  onChange={e => setBroadcastSubject(e.target.value)}
                  placeholder="Special Offer for VIP Members!"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-sky-400 outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Content</label>
                <textarea
                  required
                  rows={6}
                  value={broadcastContent}
                  onChange={e => setBroadcastContent(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:border-sky-400 outline-none transition resize-none"
                />
              </div>

              {broadcastFeedback && (
                <div className={cn(
                  "p-4 rounded-2xl text-sm font-bold flex items-center gap-3",
                  broadcastFeedback.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                )}>
                  {broadcastFeedback.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <X className="w-5 h-5 shrink-0" />}
                  {broadcastFeedback.message}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcast(false)}
                  className="flex-1 h-14 rounded-2xl border border-slate-200 bg-white text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="flex-[2] h-14 rounded-2xl bg-sky-600 text-white font-black uppercase tracking-widest text-xs hover:bg-sky-700 transition shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBroadcasting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Now</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}


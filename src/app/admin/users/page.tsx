"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, LogOut, User as UserIcon, Mail, Phone, Calendar, Send, X, CheckCircle2 } from "lucide-react";
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
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-sky-600">Admin</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 uppercase">
                  VIP <span className="text-sky-600">Users</span>
                </h1>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Manage discount club members and communications.
                </p>
              </div>

              <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto">
                <div className="flex gap-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Appointments
                  </Link>
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/invoices"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Invoices
                  </Link>
                </div>
                
                <button
                  onClick={() => setShowBroadcast(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
                >
                  <Send className="w-4 h-4" /> Broadcast
                </button>

                <div className="relative">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search users..."
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 md:w-[200px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100"
                >
                  <LogOut className="h-4 w-4" />
                </button>
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
                      <th className="pb-4 text-right">Last Session</th>
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
                        <td className="py-6 text-right">
                          <p className="text-xs text-slate-500 font-bold uppercase">
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleString() 
                              : "Never"}
                          </p>
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


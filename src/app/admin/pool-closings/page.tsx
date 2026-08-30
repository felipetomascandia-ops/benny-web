"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { LoaderCircle, LogOut, CalendarClock, MapPin, Phone, Mail, User, Waves } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AdminPoolClosingRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  address: string;
  closing_date: string;
  notes: string | null;
  status: string;
  created_at: string | null;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-sky-50 text-sky-700 border-sky-100",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export default function AdminPoolClosingsPage() {
  const router = useRouter();
  const [closings, setClosings] = useState<AdminPoolClosingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return closings;

    return closings.filter((row) => {
      const values = [
        row.first_name,
        row.last_name,
        row.phone,
        row.email || "",
        row.address,
        row.closing_date,
        row.status,
      ];
      return values.some((value) => value.toLowerCase().includes(term));
    });
  }, [closings, search]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/pool-closings", { cache: "no-store" });
      const payload = (await response.json()) as {
        poolClosings?: AdminPoolClosingRow[];
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error || "Could not load pool closings.");
        setClosings([]);
        return;
      }

      setClosings(payload.poolClosings || []);
    } catch {
      setError("Could not load pool closings.");
      setClosings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, status: "scheduled" | "completed" | "cancelled") {
    setIsUpdatingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pool-closings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as {
        poolClosing?: { id: string; status: string };
        error?: string;
      };

      if (!response.ok || !payload.poolClosing) {
        setError(payload.error || "Could not update pool closing.");
        return;
      }

      setClosings((current) =>
        current.map((row) =>
          row.id === id
            ? { ...row, status: payload.poolClosing?.status || row.status }
            : row,
        ),
      );
    } catch {
      setError("Could not update pool closing.");
    } finally {
      setIsUpdatingId(null);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
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
                  Pool <span className="text-sky-600">Closings</span>
                </h1>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Manage scheduled pool closing appointments for your clients.
                </p>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:flex-wrap xl:justify-end">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Appointments
                  </Link>
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/pool-closings"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                  >
                    Pool Closings
                  </Link>
                  <Link
                    href="/admin/invoices"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Invoices
                  </Link>
                  <Link
                    href="/admin/contracts"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Contracts
                  </Link>
                </div>

                <div className="relative">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search closings..."
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-[11px] text-slate-900 outline-none transition focus:border-sky-400 md:w-[200px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Refresh"}
                </button>

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
                Loading pool closings...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                <Waves className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">
                  No pool closings scheduled yet
                </p>
                <p className="text-xs text-slate-300 mt-2 font-medium uppercase tracking-widest">
                  Send invitations to your clients to start scheduling
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1200px] w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <th className="pb-4 pr-4">Closing Date</th>
                      <th className="pb-4 pr-4">Customer</th>
                      <th className="pb-4 pr-4">Contact</th>
                      <th className="pb-4 pr-4">Address</th>
                      <th className="pb-4 pr-4">Notes</th>
                      <th className="pb-4 pr-4 text-center">Status</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((row) => {
                      const dateLabel = row.closing_date
                        ? format(
                            new Date(`${row.closing_date}T00:00:00`),
                            "dd MMM, yyyy",
                          )
                        : "-";
                      const weekdayLabel = row.closing_date
                        ? format(
                            new Date(`${row.closing_date}T00:00:00`),
                            "EEEE",
                          )
                        : "";
                      const isUpdating = isUpdatingId === row.id;
                      const isCancelled = row.status === "cancelled";
                      const isCompleted = row.status === "completed";
                      const statusCfg =
                        STATUS_LABELS[row.status] || STATUS_LABELS.scheduled;

                      return (
                        <tr
                          key={row.id}
                          className="group hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-6 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
                                <CalendarClock className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-black text-slate-900 uppercase tracking-tight">
                                  {dateLabel}
                                </div>
                                <div className="text-[10px] text-sky-600 font-bold uppercase tracking-widest mt-0.5">
                                  {weekdayLabel}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-black uppercase text-xs border border-sky-100 shrink-0">
                                {row.first_name?.[0]}
                                {row.last_name?.[0]}
                              </div>
                              <div>
                                <div className="font-black text-slate-900 uppercase tracking-tight">
                                  {row.first_name} {row.last_name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  Pool Closing Service
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 pr-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-700">
                                <Phone className="w-3 h-3 text-sky-500 shrink-0" />
                                <span className="font-bold text-xs">{row.phone}</span>
                              </div>
                              {row.email && (
                                <div className="flex items-center gap-2 text-slate-500">
                                  <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                                  <span className="text-[11px]">{row.email}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-6 pr-4">
                            <div className="flex items-start gap-2 text-slate-600">
                              <MapPin className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                              <span className="text-xs leading-relaxed max-w-[200px] block">
                                {row.address}
                              </span>
                            </div>
                          </td>
                          <td className="py-6 pr-4">
                            {row.notes ? (
                              <div className="max-w-[180px] text-[11px] leading-relaxed text-slate-500 font-medium italic bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                                "{row.notes}"
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">
                                -
                              </span>
                            )}
                          </td>
                          <td className="py-6 pr-4 text-center">
                            <span
                              className={`inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border ${statusCfg.className}`}
                            >
                              {statusCfg.label}
                            </span>
                          </td>
                          <td className="py-6 text-right">
                            <div className="flex justify-end gap-2">
                              {!isCompleted && !isCancelled && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void updateStatus(row.id, "completed")}
                                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-30"
                                >
                                  {isUpdating && row.status !== "completed"
                                    ? "..."
                                    : "Complete"}
                                </button>
                              )}
                              {!isCancelled && (
                                <button
                                  type="button"
                                  disabled={isUpdating || isCancelled}
                                  onClick={() => void updateStatus(row.id, "cancelled")}
                                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-700 transition hover:bg-rose-100 disabled:opacity-30"
                                >
                                  {isUpdating && isCancelled ? "..." : "Cancel"}
                                </button>
                              )}
                              {(isCancelled || isCompleted) && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void updateStatus(row.id, "scheduled")}
                                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50 disabled:opacity-30"
                                >
                                  {isUpdating && row.status === "scheduled"
                                    ? "..."
                                    : "Restore"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

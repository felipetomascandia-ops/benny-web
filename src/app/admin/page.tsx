"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { LoaderCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AdminBookingRow = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  project_details: string | null;
  reservation_date: string;
  reservation_time: string;
  status: string;
  created_at: string | null;
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return bookings;

    return bookings.filter((booking) => {
      const values = [
        booking.customer_name,
        booking.phone,
        booking.email || "",
        booking.address || "",
        booking.reservation_date,
        booking.reservation_time,
        booking.status,
      ];
      return values.some((value) => value.toLowerCase().includes(term));
    });
  }, [bookings, search]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/bookings", { cache: "no-store" });
      const payload = (await response.json()) as { bookings?: AdminBookingRow[]; error?: string };

      if (!response.ok) {
        setError(payload.error || "Could not load bookings.");
        setBookings([]);
        return;
      }

      setBookings(payload.bookings || []);
    } catch {
      setError("Could not load bookings.");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, status: "reserved" | "cancelled") {
    setIsUpdatingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as { booking?: { id: string; status: string }; error?: string };

      if (!response.ok || !payload.booking) {
        setError(payload.error || "Could not update booking.");
        return;
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, status: payload.booking?.status || booking.status } : booking,
        ),
      );
    } catch {
      setError("Could not update booking.");
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
                  Appointments <span className="text-sky-600">& Bookings</span>
                </h1>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Manage technical visits scheduled.
                </p>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:flex-wrap xl:justify-end">
                {/* Navigation Links */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
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
                    href="/admin/invoices"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Invoices
                  </Link>
                </div>

                <div className="relative">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search appointments..."
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
                Loading appointments...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold uppercase tracking-widest">
                No appointments registered.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1000px] w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <th className="pb-4 pr-4">Date & Time</th>
                      <th className="pb-4 pr-4">Customer</th>
                      <th className="pb-4 pr-4">Contact</th>
                      <th className="pb-4 pr-4">Address</th>
                      <th className="pb-4 pr-4 text-center">Status</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((booking) => {
                      const dateLabel = booking.reservation_date
                        ? format(new Date(`${booking.reservation_date}T00:00:00`), "dd MMM, yyyy")
                        : "-";
                      const isUpdating = isUpdatingId === booking.id;
                      const isCancelled = booking.status === "cancelled";

                      return (
                        <tr key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-6 pr-4">
                            <div className="font-black text-slate-900 uppercase tracking-tight">{dateLabel}</div>
                            <div className="text-xs text-sky-600 font-bold mt-1">{booking.reservation_time}</div>
                          </td>
                          <td className="py-6 pr-4">
                            <div className="font-black text-slate-900 uppercase tracking-tight">{booking.customer_name}</div>
                            {booking.project_details && (
                              <div className="mt-2 max-w-[300px] text-[11px] leading-relaxed text-slate-500 font-medium italic">
                                "{booking.project_details}"
                              </div>
                            )}
                          </td>
                          <td className="py-6 pr-4">
                            <div className="text-slate-700 font-bold">{booking.phone}</div>
                            <div className="text-[11px] text-slate-400 mt-1">{booking.email || "-"}</div>
                          </td>
                          <td className="py-6 pr-4">
                            <div className="text-slate-600 text-xs leading-relaxed max-w-[200px]">
                              {booking.address || "-"}
                            </div>
                          </td>
                          <td className="py-6 pr-4 text-center">
                            <span
                              className={`inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border ${
                                isCancelled
                                  ? "bg-slate-100 text-slate-600 border-slate-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}
                            >
                              {isCancelled ? "Cancelled" : "Reserved"}
                            </span>
                          </td>
                          <td className="py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                disabled={isUpdating || isCancelled}
                                onClick={() => void updateStatus(booking.id, "cancelled")}
                                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-700 transition hover:bg-rose-100 disabled:opacity-30"
                              >
                                {isUpdating && !isCancelled ? "..." : "Cancel"}
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating || !isCancelled}
                                onClick={() => void updateStatus(booking.id, "reserved")}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50 disabled:opacity-30"
                              >
                                {isUpdating && isCancelled ? "..." : "Restore"}
                              </button>
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

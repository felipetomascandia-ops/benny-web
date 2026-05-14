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
    <main className="min-h-screen bg-[#f4f8fc] py-16">
      <div className="container-shell">
        <div className="soft-card overflow-hidden">
          <div className="border-b border-slate-200 bg-white px-6 py-5 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">Admin</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                  Bookings
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  View upcoming bookings with customer details.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                <div className="flex gap-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Bookings
                  </Link>
                  <Link
                    href="/admin/invoices"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Invoices
                  </Link>
                </div>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, phone, date..."
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 md:w-[340px]"
                />
                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Refresh"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>

          <div className="bg-white px-6 py-6 md:px-8">
            {isLoading ? (
              <div className="flex items-center gap-3 text-slate-600">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Loading bookings...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-slate-600">No bookings to show.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Time</th>
                      <th className="py-3 pr-4">Customer</th>
                      <th className="py-3 pr-4">Phone</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Address</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((booking) => {
                      const dateLabel = booking.reservation_date
                        ? format(new Date(`${booking.reservation_date}T00:00:00`), "MMM d, yyyy")
                        : "-";
                      const isUpdating = isUpdatingId === booking.id;
                      const isCancelled = booking.status === "cancelled";

                      return (
                        <tr key={booking.id} className="border-b border-slate-100 align-top">
                          <td className="py-4 pr-4 font-medium text-slate-950">{dateLabel}</td>
                          <td className="py-4 pr-4 text-slate-700">{booking.reservation_time}</td>
                          <td className="py-4 pr-4">
                            <div className="font-medium text-slate-950">{booking.customer_name}</div>
                            {booking.project_details && (
                              <div className="mt-1 max-w-[360px] text-xs leading-5 text-slate-500">
                                {booking.project_details}
                              </div>
                            )}
                          </td>
                          <td className="py-4 pr-4 text-slate-700">{booking.phone}</td>
                          <td className="py-4 pr-4 text-slate-700">{booking.email || "-"}</td>
                          <td className="py-4 pr-4 text-slate-700">{booking.address || "-"}</td>
                          <td className="py-4 pr-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                isCancelled
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {isCancelled ? "Cancelled" : "Booked"}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isUpdating || isCancelled}
                                onClick={() => void updateStatus(booking.id, "cancelled")}
                                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isUpdating && !isCancelled ? "..." : "Cancel"}
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating || !isCancelled}
                                onClick={() => void updateStatus(booking.id, "reserved")}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isUpdating && isCancelled ? "..." : "Re-activate"}
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

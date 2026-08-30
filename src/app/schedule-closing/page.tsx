"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, startOfDay } from "date-fns";
import { CalendarDays, CheckCircle2, CalendarClock, LoaderCircle, Waves, MapPin, Phone, Mail, User } from "lucide-react";
import Link from "next/link";
import { companyConfig } from "@/lib/site-config";
import type { PoolClosingRecord } from "@/lib/types";

function isPastDay(date: Date) {
  return startOfDay(date) < startOfDay(new Date());
}

export default function ScheduleClosingPage() {
  const [poolClosings, setPoolClosings] = useState<PoolClosingRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [databaseEnabled, setDatabaseEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("firstName")) setFirstName(params.get("firstName") || "");
    if (params.get("lastName")) setLastName(params.get("lastName") || "");
    if (params.get("phone")) setPhone(params.get("phone") || "");
    if (params.get("email")) setEmail(params.get("email") || "");
    if (params.get("address")) setAddress(params.get("address") || "");
  }, []);

  async function loadClosings() {
    try {
      const response = await fetch("/api/pool-closings", { cache: "no-store" });
      const payload = (await response.json()) as {
        poolClosings?: PoolClosingRecord[];
        databaseEnabled?: boolean;
      };
      setPoolClosings(payload.poolClosings || []);
      setDatabaseEnabled(payload.databaseEnabled ?? true);
    } catch {
      setPoolClosings([]);
    }
  }

  useEffect(() => {
    void loadClosings();
  }, []);

  const bookedDates = useMemo(
    () => new Set(poolClosings.map((c) => c.closingDate)),
    [poolClosings],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDate) {
      setFeedback({ type: "error", message: "Please select a date for your pool closing." });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/pool-closings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          address,
          closingDate: format(selectedDate, "yyyy-MM-dd"),
          notes,
        }),
      });

      const payload = (await response.json()) as {
        poolClosing?: PoolClosingRecord;
        error?: string;
        whatsappUrl?: string;
      };

      if (!response.ok || !payload.poolClosing) {
        setFeedback({
          type: "error",
          message: payload.error || "We couldn't schedule your pool closing right now.",
        });
        return;
      }

      setPoolClosings((current) => [payload.poolClosing as PoolClosingRecord, ...current]);
      setFeedback({
        type: "success",
        message:
          "Your pool closing has been scheduled successfully! We'll open WhatsApp to confirm the appointment.",
      });

      if (payload.whatsappUrl) {
        window.open(payload.whatsappUrl, "_blank", "noopener,noreferrer");
      }

      setSelectedDate(undefined);
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setNotes("");
    } catch {
      setFeedback({
        type: "error",
        message: "Something went wrong while scheduling your pool closing.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#eaf4fc] via-[#f4f8fc] to-[#f8fafc] py-16 text-slate-900">
      <div className="container-shell">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-sky-600 hover:text-sky-700 transition"
          >
            ← Back to Home
          </Link>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-sky-100 bg-white/80 backdrop-blur px-5 py-2 shadow-sm">
            <Waves className="h-4 w-4 text-sky-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600">
              Pool Closing Service
            </span>
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight text-slate-950 uppercase leading-tight">
            Schedule Your <span className="text-sky-600">Pool Closing</span>
          </h1>
          <p className="mt-4 text-base text-slate-600 font-medium max-w-2xl mx-auto">
            Winter is coming. Book your professional pool closing service today.
            Choose your preferred date and we'll take care of the rest.
          </p>
        </div>

        <div id="schedule" className="mt-8 rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-sky-900/5 p-6 md:p-10">
          {!databaseEnabled && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 font-bold">
              Enable Supabase on Vercel to save reservations in production.
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-[28px] bg-gradient-to-b from-sky-50 to-white p-4 shadow-sm border border-sky-100 md:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Availability Calendar
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Green dates are available
                  </p>
                </div>
              </div>

              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                }}
                showOutsideDays
                disabled={(date) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  return isPastDay(date) || date.getDay() === 0 || bookedDates.has(dateKey);
                }}
                className="mx-auto w-full max-w-full overflow-hidden rounded-[24px] p-1 sm:p-2"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
                  month: "space-y-4 w-full",
                  month_caption: "flex items-center justify-between pb-2 px-2",
                  caption_label:
                    "text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase",
                  nav: "flex items-center gap-1",
                  button_previous:
                    "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all hover:bg-sky-600 hover:text-white hover:border-sky-600 shadow-sm",
                  button_next:
                    "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all hover:bg-sky-600 hover:text-white hover:border-sky-600 shadow-sm",
                  month_grid: "w-full border-collapse",
                  weekdays: "flex",
                  weekday:
                    "flex-1 py-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400",
                  week: "flex w-full mt-2",
                  day: "flex-1 p-0.5 text-center align-middle",
                  day_button:
                    "h-10 w-10 sm:h-12 sm:w-12 mx-auto flex items-center justify-center rounded-2xl text-xs sm:text-base font-bold text-slate-700 transition-all hover:bg-sky-100 hover:text-sky-700 hover:scale-105",
                  selected:
                    "[&>button]:bg-sky-600 [&>button]:text-white [&>button]:hover:bg-sky-700 [&>button]:shadow-[0_10px_20px_-5px_rgba(0,119,190,0.5)] [&>button]:scale-110",
                  today:
                    "[&>button]:border-2 [&>button]:border-sky-500/40 [&>button]:text-sky-700 [&>button]:bg-sky-50",
                  disabled:
                    "[&>button]:cursor-not-allowed [&>button]:text-slate-200 [&>button]:line-through [&>button]:hover:bg-transparent [&>button]:hover:scale-100",
                  outside: "[&>button]:text-slate-200",
                }}
              />

              <div className="mt-6 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-lg bg-white border border-slate-200"></span>
                  <span className="text-slate-500">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-lg bg-sky-600"></span>
                  <span className="text-slate-500">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-lg bg-slate-100 border border-slate-200"></span>
                  <span className="text-slate-500">Booked</span>
                </div>
              </div>

              {selectedDate && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-sky-600 text-white px-5 py-4 shadow-lg shadow-sky-600/20">
                  <CalendarClock className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-100">
                      Selected Date
                    </p>
                    <p className="text-lg font-black uppercase">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] bg-white p-6 shadow-sm border border-slate-200 md:p-8"
            >
              <div className="flex items-center gap-2 mb-8">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-600">
                  Client Information
                </p>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      <User className="h-3 w-3 text-sky-500" />
                      First Name
                    </label>
                    <input
                      required
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      <User className="h-3 w-3 text-sky-500" />
                      Last Name
                    </label>
                    <input
                      required
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      <Phone className="h-3 w-3 text-sky-500" />
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      <Mail className="h-3 w-3 text-sky-500" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    <MapPin className="h-3 w-3 text-sky-500" />
                    Home Address
                  </label>
                  <input
                    required
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition"
                    placeholder="123 Pool St, City, PA"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Notes / Special Instructions (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition"
                    placeholder="Gate code, pool location, special requests..."
                  />
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full h-16 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#0077be] to-[#00a8e8] text-white font-black uppercase tracking-widest text-sm hover:from-[#005a91] hover:to-[#007ea7] transition-all shadow-xl shadow-sky-700/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LoaderCircle className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-6 w-6" />
                      Schedule Pool Closing
                    </>
                  )}
                </button>

                {feedback && (
                  <div
                    className={`rounded-2xl p-4 text-center text-sm font-bold animate-in fade-in slide-in-from-top-2 ${
                      feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}
                  >
                    {feedback.message}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Need help? Call us at{" "}
            <a
              href={`tel:${companyConfig.phoneDigits}`}
              className="text-sky-600 font-black hover:underline"
            >
              {companyConfig.phoneDisplay}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

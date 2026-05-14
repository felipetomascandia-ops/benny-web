"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, startOfDay } from "date-fns";
import { CalendarDays, CheckCircle2, Clock3, LoaderCircle } from "lucide-react";

import { bookingTimeSlots } from "@/lib/site-config";
import type { BookingRecord } from "@/lib/types";

function isPastDay(date: Date) {
  return startOfDay(date) < startOfDay(new Date());
}

export default function BookingScheduler() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [databaseEnabled, setDatabaseEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  async function loadBookings() {
    try {
      const response = await fetch("/api/bookings", { cache: "no-store" });
      const payload = (await response.json()) as {
        bookings?: BookingRecord[];
        databaseEnabled?: boolean;
      };

      setBookings(payload.bookings || []);
      setDatabaseEnabled(payload.databaseEnabled ?? true);
    } catch {
      setBookings([]);
    }
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  const occupiedByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();

    for (const booking of bookings) {
      const current = map.get(booking.reservationDate) || new Set<string>();
      current.add(booking.reservationTime);
      map.set(booking.reservationDate, current);
    }

    return map;
  }, [bookings]);

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const isSelectedDateBooked = Boolean(selectedDateKey && occupiedByDate.get(selectedDateKey)?.size);
  const occupiedSlots = useMemo(() => {
    if (!selectedDateKey) return new Set<string>();
    if (isSelectedDateBooked) return new Set<string>(bookingTimeSlots);
    return occupiedByDate.get(selectedDateKey) || new Set<string>();
  }, [isSelectedDateBooked, occupiedByDate, selectedDateKey]);
  const availableSlots = bookingTimeSlots.filter((slot) => !occupiedSlots.has(slot));
  const bookedDates = useMemo(() => new Set(bookings.map((booking) => booking.reservationDate)), [bookings]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDate || !selectedTime) {
      setFeedback({ type: "error", message: "Please select a date and time to book." });
      return;
    }

    const customerName = `${firstName} ${lastName}`.trim();

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          email,
          address,
          phone,
          projectDetails,
          reservationDate: format(selectedDate, "yyyy-MM-dd"),
          reservationTime: selectedTime,
        }),
      });

      const payload = (await response.json()) as {
        booking?: BookingRecord;
        error?: string;
        whatsappUrl?: string;
      };

      if (!response.ok || !payload.booking || !payload.whatsappUrl) {
        setFeedback({
          type: "error",
          message: payload.error || "We couldn’t reserve your visit right now.",
        });
        return;
      }

      setBookings((current) => [payload.booking as BookingRecord, ...current]);
      setFeedback({
        type: "success",
        message: "Your visit is reserved. We’ll open WhatsApp to confirm your appointment.",
      });

      window.open(payload.whatsappUrl, "_blank", "noopener,noreferrer");
      setSelectedTime("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setProjectDetails("");
    } catch {
      setFeedback({
        type: "error",
        message: "Something went wrong while booking your visit.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div id="booking" className="mt-8 rounded-[32px] border border-slate-200 bg-slate-50 p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
            Book a visit
          </p>
          <h4 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Choose a day and time for your on-site visit
          </h4>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
          <Clock3 className="h-4 w-4 text-sky-600" />
          Slots are blocked automatically
        </div>
      </div>

      {!databaseEnabled && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Enable Supabase on Vercel to block time slots and store bookings in production.
        </div>
      )}

      <div className="mt-8 grid gap-8">
        <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Availability calendar</p>
              <p className="text-sm text-slate-500">Select your visit date first</p>
            </div>
          </div>

          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setSelectedTime("");
            }}
            showOutsideDays
            disabled={(date) => {
              const dateKey = format(date, "yyyy-MM-dd");
              return isPastDay(date) || date.getDay() === 0 || bookedDates.has(dateKey);
            }}
            className="mx-auto rounded-[24px] bg-white p-2"
            classNames={{
              months: "flex justify-center",
              month: "space-y-4",
              month_caption: "flex items-center justify-between pb-2",
              caption_label: "text-base font-semibold text-slate-950",
              nav: "flex items-center gap-2",
              button_previous:
                "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100",
              button_next:
                "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100",
              month_grid: "w-full border-collapse",
              weekdays: "",
              weekday: "py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400",
              week: "",
              day: "p-1 text-center align-middle",
              day_button:
                "h-11 w-11 rounded-2xl text-sm font-medium text-slate-700 transition hover:bg-slate-100",
              selected:
                "[&>button]:bg-sky-500 [&>button]:text-white [&>button]:hover:bg-sky-500",
              today: "[&>button]:border [&>button]:border-sky-300 [&>button]:text-sky-700",
              disabled: "[&>button]:cursor-not-allowed [&>button]:text-slate-300 [&>button]:hover:bg-transparent",
              outside: "[&>button]:text-slate-300",
            }}
          />

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-950">Available time slots</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {bookingTimeSlots.map((slot) => {
                const isOccupied = occupiedSlots.has(slot);
                const isSelected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!selectedDate || isOccupied}
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isSelected
                        ? "border-sky-500 bg-sky-500 text-white"
                        : isOccupied
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            {selectedDate && availableSlots.length === 0 && (
              <p className="mt-3 text-sm text-rose-600">
                This date is fully booked.
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
            Confirm your visit
          </p>
          <h5 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Lock in your time slot and confirm via WhatsApp
          </h5>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            When you submit, we reserve your time slot and open WhatsApp with a ready-to-send confirmation message.
          </p>

          <div className="mt-6 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">First name</label>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                />
              </div>
              <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Last name</label>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  type="tel"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                />
              </div>
              <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                />
              </div>
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
                type="text"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Selected date
                </span>
                <span className="mt-2 block font-medium text-slate-950">
                    {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Selected time
                </span>
                <span className="mt-2 block font-medium text-slate-950">
                    {selectedTime || "Select a time"}
                </span>
              </div>
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Visit details</label>
              <textarea
                value={projectDetails}
                onChange={(event) => setProjectDetails(event.target.value)}
                rows={4}
                className="w-full rounded-[24px] border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="Tell us about your pool and what you’d like us to look at during the visit."
              />
            </div>
          </div>

          {feedback && (
            <div
              className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {feedback.type === "success" && <CheckCircle2 className="mr-2 inline h-4 w-4" />}
              {feedback.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !selectedDate || !selectedTime || isSelectedDateBooked}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
            Book a visit
          </button>
        </form>
      </div>
    </div>
  );
}

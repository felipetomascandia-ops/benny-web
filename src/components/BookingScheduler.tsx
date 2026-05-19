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
    <div id="booking" className="mt-8 rounded-[32px] border border-border bg-card p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-500">
            Book a visit
          </p>
          <h4 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Choose a day and time for your on-site visit
          </h4>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm font-medium text-foreground shadow-sm">
          <Clock3 className="h-4 w-4 text-blue-500" />
          Slots are blocked automatically
        </div>
      </div>

      {!databaseEnabled && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
          Enable Supabase on Vercel to block time slots and store bookings in production.
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[28px] bg-card p-4 shadow-sm border border-border md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Availability calendar</p>
              <p className="text-sm text-muted-foreground">Select your visit date first</p>
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
            className="mx-auto w-full max-w-full overflow-hidden rounded-[24px] p-1 sm:p-2"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
              month: "space-y-4 w-full",
              month_caption: "flex items-center justify-between pb-2 px-2",
              caption_label: "text-base sm:text-lg font-black tracking-tight text-foreground",
              nav: "flex items-center gap-1",
              button_previous:
                "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-blue-500 hover:text-white hover:border-blue-500 shadow-sm",
              button_next:
                "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-blue-500 hover:text-white hover:border-blue-500 shadow-sm",
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday: "flex-1 py-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50",
              week: "flex w-full mt-2",
              day: "flex-1 p-0.5 text-center align-middle",
              day_button:
                "h-10 w-10 sm:h-12 sm:w-12 mx-auto flex items-center justify-center rounded-2xl text-xs sm:text-base font-bold text-foreground transition-all hover:bg-blue-500/10 hover:text-blue-500 hover:scale-110",
              selected:
                "[&>button]:bg-blue-500 [&>button]:text-white [&>button]:hover:bg-blue-600 [&>button]:shadow-[0_10px_20px_-5px_rgba(59,130,246,0.5)] [&>button]:scale-110",
              today: "[&>button]:border-2 [&>button]:border-blue-500/30 [&>button]:text-blue-500 [&>button]:bg-blue-500/5",
              disabled: "[&>button]:cursor-not-allowed [&>button]:text-muted-foreground/10 [&>button]:hover:bg-transparent [&>button]:hover:scale-100",
              outside: "[&>button]:text-muted-foreground/10",
            }}
          />

          <div className="mt-6">
            <p className="text-sm font-bold text-foreground">Available time slots</p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {bookingTimeSlots.map((slot) => {
                const isOccupied = occupiedSlots.has(slot);
                const isSelected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!selectedDate || isOccupied}
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-xl sm:rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : isOccupied
                          ? "cursor-not-allowed border-border/50 bg-muted/20 text-muted-foreground/30"
                          : "border-border bg-card text-foreground hover:border-blue-300 hover:bg-blue-500/5"
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

        <form onSubmit={handleSubmit} className="rounded-[28px] bg-card p-6 shadow-sm border border-border md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-500">
            Confirm your visit
          </p>
          <div className="mt-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">First name</label>
                <input
                  required
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3.5 text-sm text-foreground focus:border-blue-500 focus:ring-0"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Last name</label>
                <input
                  required
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3.5 text-sm text-foreground focus:border-blue-500 focus:ring-0"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Phone number</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3.5 text-sm text-foreground focus:border-blue-500 focus:ring-0"
                  placeholder="(555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Email address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3.5 text-sm text-foreground focus:border-blue-500 focus:ring-0"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Project address</label>
              <input
                required
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3.5 text-sm text-foreground focus:border-blue-500 focus:ring-0"
                placeholder="Street address, City, PA"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Project details (optional)</label>
              <textarea
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                className="h-32 w-full resize-none rounded-2xl border border-border bg-muted/20 px-4 py-3.5 text-sm text-foreground focus:border-blue-500 focus:ring-0"
                placeholder="Tell us about your pool project..."
              />
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="water-button w-full gap-3 py-5 text-lg"
            >
              {isLoading ? (
                <LoaderCircle className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  Reserve Visit & Confirm on WhatsApp
                </>
              )}
            </button>

            {feedback && (
              <p className={`text-center text-sm font-bold ${
                feedback.type === "success" ? "text-emerald-500" : "text-rose-500"
              }`}>
                {feedback.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

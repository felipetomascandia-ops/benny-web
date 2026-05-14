import { buildBookingWhatsAppMessage, buildWhatsAppUrl, bookingTimeSlots } from "@/lib/site-config";
import { getSupabaseServerClient, hasSupabaseServerCredentials } from "@/lib/supabase";
import type { BookingRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function mapBookingRow(row: {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  project_details: string | null;
  reservation_date: string;
  reservation_time: string;
  status: string;
}): BookingRecord {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email || undefined,
    address: row.address || undefined,
    projectDetails: row.project_details || undefined,
    reservationDate: row.reservation_date,
    reservationTime: row.reservation_time,
    status: row.status,
  };
}

export async function GET() {
  if (!hasSupabaseServerCredentials()) {
    return Response.json({ bookings: [], databaseEnabled: false });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return Response.json({ bookings: [], databaseEnabled: false });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, customer_name, phone, email, address, project_details, reservation_date, reservation_time, status",
    )
    .gte("reservation_date", today)
    .neq("status", "cancelled")
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true });

  if (error) {
    return Response.json({ bookings: [], databaseEnabled: true });
  }

  return Response.json({ bookings: data.map(mapBookingRow), databaseEnabled: true });
}

export async function POST(request: Request) {
  if (!hasSupabaseServerCredentials()) {
    return Response.json(
      {
        error:
          "Supabase is not configured. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY (also supports NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
      },
      { status: 503 },
    );
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return Response.json({ error: "Supabase is unavailable." }, { status: 503 });
  }

  const body = await request.json();
  const customerName = String(body.customerName || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const address = String(body.address || "").trim();
  const projectDetails = String(body.projectDetails || "").trim();
  const reservationDate = String(body.reservationDate || "").trim();
  const reservationTime = String(body.reservationTime || "").trim();

  if (!customerName || !phone || !email || !address || !reservationDate || !reservationTime) {
    return Response.json(
      { error: "Name, phone, email, address, date, and time are required." },
      { status: 400 },
    );
  }

  if (!bookingTimeSlots.includes(reservationTime)) {
    return Response.json({ error: "Invalid reservation time." }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: existingByPhone, error: existingByPhoneError } = await supabase
    .from("bookings")
    .select("id")
    .eq("phone", phone)
    .gte("reservation_date", today)
    .neq("status", "cancelled")
    .limit(1)
    .maybeSingle();

  if (existingByPhoneError) {
    return Response.json({ error: "Could not verify whether you already have a booking." }, { status: 500 });
  }

  if (existingByPhone) {
    return Response.json({ error: "Only one active booking per person is allowed." }, { status: 409 });
  }

  const { data: existingByDate, error: existingByDateError } = await supabase
    .from("bookings")
    .select("id")
    .eq("reservation_date", reservationDate)
    .neq("status", "cancelled")
    .limit(1)
    .maybeSingle();

  if (existingByDateError) {
    return Response.json({ error: "Could not verify availability for the selected date." }, { status: 500 });
  }

  if (existingByDate) {
    return Response.json({ error: "That date is already booked." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_name: customerName,
      email: email || null,
      address: address || null,
      phone,
      project_details: projectDetails || null,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      status: "reserved",
    })
    .select(
      "id, customer_name, phone, email, address, project_details, reservation_date, reservation_time, status",
    )
    .single();

  if (error || !data) {
    const message = error?.message || "Could not save the booking.";

    if (message.toLowerCase().includes("row-level security")) {
      return Response.json(
        {
          error:
            "Supabase blocked the INSERT (RLS). Fix: disable RLS for the bookings table or create a policy that allows INSERT for anon/authenticated. Recommended alternative: configure SUPABASE_SERVICE_ROLE_KEY on the server.",
        },
        { status: 500 },
      );
    }

    if (message.toLowerCase().includes("address") && message.toLowerCase().includes("does not exist")) {
      return Response.json(
        {
          error:
            'The "bookings" table does not have the "address" column yet. Run the migration SQL (alter table bookings add column address) in Supabase.',
        },
        { status: 500 },
      );
    }

    if (message.toLowerCase().includes("duplicate key") || message.toLowerCase().includes("unique")) {
      return Response.json(
        {
          error: "That date is already booked.",
        },
        { status: 409 },
      );
    }

    return Response.json(
      { error: process.env.NODE_ENV === "production" ? "Could not save the booking." : message },
      { status: 500 },
    );
  }

  const booking = mapBookingRow(data);
  const whatsappUrl = buildWhatsAppUrl(
    buildBookingWhatsAppMessage({
      customerName: booking.customerName,
      email: booking.email,
      phone: booking.phone,
      address: booking.address,
      projectDetails: booking.projectDetails,
      reservationDate: booking.reservationDate,
      reservationTime: booking.reservationTime,
    }),
  );

  return Response.json({ booking, whatsappUrl }, { status: 201 });
}

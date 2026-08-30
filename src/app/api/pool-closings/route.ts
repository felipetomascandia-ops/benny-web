import { buildPoolClosingWhatsAppMessage, buildWhatsAppUrl } from "@/lib/site-config";
import { getSupabaseServerClient, hasSupabaseServerCredentials } from "@/lib/supabase";
import type { PoolClosingRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function mapRowToRecord(row: {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  address: string;
  closing_date: string;
  notes: string | null;
  status: string;
  created_at?: string | null;
}): PoolClosingRecord {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email || undefined,
    address: row.address,
    closingDate: row.closing_date,
    notes: row.notes || undefined,
    status: row.status,
    createdAt: row.created_at || undefined,
  };
}

export async function GET() {
  if (!hasSupabaseServerCredentials()) {
    return Response.json({ poolClosings: [], databaseEnabled: false });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return Response.json({ poolClosings: [], databaseEnabled: false });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("pool_closings")
    .select("id, first_name, last_name, phone, email, address, closing_date, notes, status")
    .gte("closing_date", today)
    .neq("status", "cancelled")
    .order("closing_date", { ascending: true });

  if (error) {
    return Response.json({ poolClosings: [], databaseEnabled: true });
  }

  return Response.json({ poolClosings: data.map(mapRowToRecord), databaseEnabled: true });
}

export async function POST(request: Request) {
  if (!hasSupabaseServerCredentials()) {
    return Response.json(
      {
        error:
          "Supabase is not configured. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY.",
      },
      { status: 503 },
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is unavailable." }, { status: 503 });
  }

  const body = await request.json();
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const address = String(body.address || "").trim();
  const closingDate = String(body.closingDate || "").trim();
  const notes = String(body.notes || "").trim();

  if (!firstName || !lastName || !phone || !address || !closingDate) {
    return Response.json(
      { error: "First name, last name, phone, address, and closing date are required." },
      { status: 400 },
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("pool_closings")
    .insert({
      first_name: firstName,
      last_name: lastName,
      phone,
      email: email || null,
      address,
      closing_date: closingDate,
      notes: notes || null,
      status: "scheduled",
    })
    .select(
      "id, first_name, last_name, phone, email, address, closing_date, notes, status, created_at",
    )
    .single();

  if (error || !data) {
    const message = error?.message || "Could not save the pool closing reservation.";

    if (message.toLowerCase().includes("row-level security")) {
      return Response.json(
        {
          error:
            "Supabase blocked the INSERT (RLS). Fix: disable RLS for the pool_closings table or configure SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 },
      );
    }

    return Response.json(
      { error: process.env.NODE_ENV === "production" ? "Could not save the reservation." : message },
      { status: 500 },
    );
  }

  const record = mapRowToRecord(data);
  const whatsappUrl = buildWhatsAppUrl(
    buildPoolClosingWhatsAppMessage({
      firstName: record.firstName,
      lastName: record.lastName,
      phone: record.phone,
      email: record.email,
      address: record.address,
      closingDate: record.closingDate,
      notes: record.notes,
    }),
  );

  return Response.json({ poolClosing: record, whatsappUrl }, { status: 201 });
}

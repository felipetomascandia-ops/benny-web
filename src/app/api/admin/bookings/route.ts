import { getSupabaseServerClient, hasSupabaseServerCredentials } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!hasSupabaseServerCredentials()) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return Response.json({ error: "Supabase is unavailable." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, customer_name, phone, email, address, project_details, reservation_date, reservation_time, status, created_at",
    )
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Could not load bookings."
            : error.message || "Could not load bookings.",
      },
      { status: 500 },
    );
  }

  return Response.json({ bookings: data || [] });
}

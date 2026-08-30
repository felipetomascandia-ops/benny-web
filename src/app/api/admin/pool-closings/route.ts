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
    .from("pool_closings")
    .select(
      "id, first_name, last_name, phone, email, address, closing_date, notes, status, created_at",
    )
    .order("closing_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Could not load pool closings."
            : error.message || "Could not load pool closings.",
      },
      { status: 500 },
    );
  }

  return Response.json({ poolClosings: data || [] });
}

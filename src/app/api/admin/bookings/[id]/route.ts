import { getSupabaseServerClient, hasSupabaseServerCredentials } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseServerCredentials()) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return Response.json({ error: "Supabase is unavailable." }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "cancelled").trim();

  if (!id) {
    return Response.json({ error: "Invalid id." }, { status: 400 });
  }

  if (!["reserved", "cancelled"].includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error || !data) {
    return Response.json({ error: "Could not update booking." }, { status: 500 });
  }

  return Response.json({ booking: data });
}

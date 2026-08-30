import { getSupabaseServerClient, hasSupabaseServerCredentials } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_STATUSES = ["scheduled", "completed", "cancelled"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseServerCredentials()) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is unavailable." }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return Response.json({ error: "ID is required." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "").trim() as AllowedStatus;

  if (!ALLOWED_STATUSES.includes(status)) {
    return Response.json(
      { error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}.` },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("pool_closings")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();

  if (error || !data) {
    return Response.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Could not update pool closing."
            : error?.message || "Could not update pool closing.",
      },
      { status: 500 },
    );
  }

  return Response.json({ poolClosing: data });
}

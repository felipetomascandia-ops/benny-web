import { NextResponse } from "next/server";
import {
  getSupabaseAdminClient,
  getSupabaseServerClient,
  hasSupabaseAdminCredentials,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasSupabaseAdminCredentials()) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 503 }
    );
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const supabaseServer = getSupabaseServerClient();
  if (!supabaseAdmin || !supabaseServer) {
    return Response.json({ error: "Supabase client unavailable." }, { status: 503 });
  }

  try {
    const { id } = await params;
    const { firstName, lastName, phone, address, email } = await request.json();

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
        full_name: `${firstName} ${lastName}`,
      },
    });

    if (error) {
      console.error("updateUserById error:", error);
      return Response.json(
        { error: process.env.NODE_ENV === "production" ? "Failed to update user." : error.message },
        { status: 500 }
      );
    }

    const { error: profileError } = await supabaseServer
      .from("profiles")
      .update({
        email,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        phone: phone || null,
        address: address || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (profileError) {
      console.error("profiles update error:", profileError);
    }

    return Response.json({ user: data.user, message: "User updated successfully." });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id] unexpected error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasSupabaseAdminCredentials()) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 503 }
    );
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const supabaseServer = getSupabaseServerClient();
  if (!supabaseAdmin || !supabaseServer) {
    return Response.json({ error: "Supabase client unavailable." }, { status: 503 });
  }

  try {
    const { id } = await params;

    const { error: profileErr } = await supabaseServer
      .from("profiles")
      .delete()
      .eq("id", id);
    if (profileErr) console.error("profiles delete warning:", profileErr);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      console.error("deleteUser error:", error);
      return Response.json(
        { error: process.env.NODE_ENV === "production" ? "Failed to delete user." : error.message },
        { status: 500 }
      );
    }

    return Response.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("DELETE /api/admin/users/[id] unexpected error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

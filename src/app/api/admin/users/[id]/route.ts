import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseAdminCredentials } from "@/lib/supabase";

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

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return Response.json({ error: "Supabase admin client unavailable." }, { status: 503 });
  }

  try {
    const { id } = await params;
    const { firstName, lastName, phone, address, email } = await request.json();

    const { data, error } = await supabase.auth.admin.updateUserById(id, {
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

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return Response.json({ error: "Supabase admin client unavailable." }, { status: 503 });
  }

  try {
    const { id } = await params;

    const { error } = await supabase.auth.admin.deleteUser(id);

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

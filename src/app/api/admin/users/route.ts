import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseAdminCredentials } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!hasSupabaseAdminCredentials()) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured. This is required to manage users." },
      { status: 503 }
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return Response.json({ error: "Supabase admin client unavailable." }, { status: 503 });
  }

  try {
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("listUsers error:", error);
      return Response.json(
        {
          error:
            process.env.NODE_ENV === "production"
              ? "Database error finding users."
              : error.message || "Database error finding users.",
        },
        { status: 500 }
      );
    }

    return Response.json({ users: data.users || [] });
  } catch (err) {
    console.error("GET /api/admin/users unexpected error:", err);
    return Response.json({ error: "Database error finding users." }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const { email, firstName, lastName, phone, address, password } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return Response.json(
        { error: "Email, Password, First Name and Last Name are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
        full_name: `${firstName} ${lastName}`,
      },
    });

    if (error) {
      console.error("createUser error:", error);
      return Response.json(
        { error: process.env.NODE_ENV === "production" ? "Failed to create user." : error.message },
        { status: 500 }
      );
    }

    return Response.json({ user: data.user, message: "User created successfully. They will need to verify their email." });
  } catch (err) {
    console.error("POST /api/admin/users unexpected error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

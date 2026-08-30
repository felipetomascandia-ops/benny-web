import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseAdminCredentials } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!hasSupabaseAdminCredentials()) {
    return Response.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is NOT CONFIGURED in Vercel Environment Variables. Go to Vercel → Your Project → Settings → Environment Variables and add SUPABASE_SERVICE_ROLE_KEY with the service_role key from Supabase Project Settings → API. Then REDEPLOY.",
      },
      { status: 503 }
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return Response.json({ error: "Supabase admin client unavailable." }, { status: 503 });
  }

  try {
    let result = await supabase.auth.admin.listUsers({ perPage: 1000 });
    let error = result.error;
    let data = result.data;

    if (error) {
      console.error("listUsers (perPage:1000) error:", JSON.stringify(error));
      const fallback = await supabase.auth.admin.listUsers();
      if (fallback.error && !fallback.data?.users) {
        return Response.json(
          {
            error:
              "Supabase Auth Admin error: " +
              (error.message || "Database error finding users") +
              " (code: " +
              (error.code || "none") +
              "). Verify your SUPABASE_SERVICE_ROLE_KEY is the FULL service_role key from Supabase Dashboard → Project Settings → API (it should start with sb_secret_ and be several hundred characters long).",
            _debug: { name: error.name, code: error.code, status: error.status },
          },
          { status: 500 }
        );
      }
      error = fallback.error;
      data = fallback.data;
    }

    return Response.json({ users: data.users || [] });
  } catch (err: any) {
    console.error("GET /api/admin/users unexpected error:", err);
    return Response.json(
      {
        error:
          "Unexpected error: " +
          (err?.message || "Database error finding users") +
          ". Check Vercel function logs for details.",
      },
      { status: 500 }
    );
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

import { NextResponse } from "next/server";
import {
  getSupabaseAdminClient,
  getSupabaseServerClient,
  hasSupabaseServerCredentials,
  hasSupabaseAdminCredentials,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
};

function profileToAdminUser(p: ProfileRow) {
  return {
    id: p.id,
    email: p.email || "",
    user_metadata: {
      first_name: p.first_name || undefined,
      last_name: p.last_name || undefined,
      phone: p.phone || undefined,
      address: p.address || undefined,
      full_name: p.full_name || undefined,
    },
    created_at: p.created_at,
    last_sign_in_at: p.last_sign_in_at,
    email_confirmed_at: p.email_confirmed_at,
  };
}

export async function GET() {
  if (!hasSupabaseServerCredentials()) {
    return Response.json(
      { error: "Supabase is not configured in Vercel Environment Variables (SUPABASE_URL + server key)." },
      { status: 503 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return Response.json({ error: "Supabase server client unavailable." }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, first_name, last_name, full_name, phone, address, email_confirmed_at, last_sign_in_at, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET profiles error:", JSON.stringify(error));
      return Response.json(
        {
          error:
            "Database error finding users: " +
            error.message +
            ". Did you run the schema.sql in Supabase SQL Editor? Expected a public.profiles table. Open: https://supabase.com/dashboard/project/hvstiubggtgzaeuxhxhy/sql/new and run the full script from supabase/schema.sql.",
          _hint: "Ejecuta TODO el contenido de supabase/schema.sql en el SQL Editor de Supabase.",
        },
        { status: 500 }
      );
    }

    const users = (data as ProfileRow[])
      .filter((p) => p.email)
      .map(profileToAdminUser);

    return Response.json({ users });
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
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured (needed to create users)." },
      { status: 503 }
    );
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const supabaseServer = getSupabaseServerClient();
  if (!supabaseAdmin || !supabaseServer) {
    return Response.json({ error: "Supabase client unavailable." }, { status: 503 });
  }

  try {
    const { email, firstName, lastName, phone, address, password } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return Response.json(
        { error: "Email, Password, First Name and Last Name are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
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

    const uid = data.user?.id;
    if (uid) {
      await supabaseServer
        .from("profiles")
        .upsert({
          id: uid,
          email,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          phone: phone || null,
          address: address || null,
          email_confirmed_at: data.user?.email_confirmed_at || null,
          last_sign_in_at: data.user?.last_sign_in_at || null,
          updated_at: new Date().toISOString(),
        })
        .then((res) => res.error && console.error("profiles upsert after createUser:", res.error));
    }

    return Response.json({ user: data.user, message: "User created successfully. They will need to verify their email." });
  } catch (err) {
    console.error("POST /api/admin/users unexpected error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

/**
 * Endpoint for managing specific users (Edit/Delete).
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const { id } = params;
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data.user, message: "User updated successfully." });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const { id } = params;

    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

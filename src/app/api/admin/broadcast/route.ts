import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { resend, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME } from "@/lib/resend";

/**
 * Endpoint for sending global emails to all VIP users.
 */
export async function POST(request: Request) {
  try {
    const { subject, content } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // 1. Get all users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No users found to send emails to." }, { status: 404 });
    }

    // 2. Send emails in batches or all at once using Resend
    // For large lists, it's better to use a loop or batch API
    const emails = users.map(user => user.email).filter(Boolean) as string[];

    if (emails.length === 0) {
      return NextResponse.json({ error: "No valid email addresses found." }, { status: 404 });
    }

    const { data, error: sendError } = await resend.emails.send({
      from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: emails,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 20px;">${subject}</h1>
          <div style="color: #475569; line-height: 1.6; font-size: 16px;">
            ${content.replace(/\n/g, '<br/>')}
          </div>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} ${DEFAULT_FROM_NAME}. All rights reserved.
          </p>
        </div>
      `,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Broadcast sent successfully to ${emails.length} users.`,
      recipientCount: emails.length,
      data
    });

  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json(
      { error: "An error occurred while sending the broadcast." },
      { status: 500 }
    );
  }
}

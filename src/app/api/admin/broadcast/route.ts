import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { resend, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME } from "@/lib/resend";
import { companyConfig } from "@/lib/site-config";

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
    const emails = users.map(user => user.email).filter(Boolean) as string[];

    if (emails.length === 0) {
      return NextResponse.json({ error: "No valid email addresses found." }, { status: 404 });
    }

    const logoUrl = `${companyConfig.websiteUrl}/logo.png`;

    const { data, error: sendError } = await resend.emails.send({
      from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: emails,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              .body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
              .header { background-color: #0f172a; padding: 40px 20px; text-align: center; }
              .logo { height: 50px; width: auto; filter: brightness(0) invert(1); }
              .content { padding: 40px 30px; }
              .title { color: #0f172a; font-size: 28px; font-weight: 800; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: -0.025em; line-height: 1.2; }
              .text { color: #334155; line-height: 1.8; font-size: 16px; margin-bottom: 30px; }
              .button-container { text-align: center; margin-top: 20px; }
              .button { background-color: #3b82f6; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; display: inline-block; }
              .footer { background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
              .footer-text { color: #64748b; font-size: 12px; margin: 5px 0; }
              .social-link { color: #3b82f6; text-decoration: none; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="body">
              <div class="container">
                <div class="header">
                  <img src="${logoUrl}" alt="${companyConfig.name}" class="logo">
                </div>
                <div class="content">
                  <h1 class="title">${subject}</h1>
                  <div class="text">
                    ${content.replace(/\n/g, '<br/>')}
                  </div>
                  <div class="button-container">
                    <a href="${companyConfig.websiteUrl}" class="button">Visit Our Website</a>
                  </div>
                </div>
                <div class="footer">
                  <p class="footer-text"><strong>${companyConfig.name}</strong></p>
                  <p class="footer-text">${companyConfig.serviceArea}</p>
                  <p class="footer-text">
                    <a href="${companyConfig.instagramUrl}" class="social-link">Instagram</a> &bull; 
                    <a href="${companyConfig.facebookUrl}" class="social-link">Facebook</a>
                  </p>
                  <p class="footer-text" style="margin-top: 20px;">
                    &copy; ${new Date().getFullYear()} ${companyConfig.name}. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
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

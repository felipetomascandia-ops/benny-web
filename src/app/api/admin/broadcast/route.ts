import { NextResponse } from "next/server";
import { getSupabaseAdminClient, hasSupabaseAdminCredentials } from "@/lib/supabase";
import { resend, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME } from "@/lib/resend";
import { companyConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    const { subject, content, imageUrls } = await request.json();

    if (!subject || !content) {
      return Response.json(
        { error: "Subject and content are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("broadcast listUsers error:", error);
      return Response.json(
        { error: process.env.NODE_ENV === "production" ? "Could not load users." : error.message },
        { status: 500 }
      );
    }

    const users = data.users || [];

    if (users.length === 0) {
      return Response.json({ error: "No users found to send emails to." }, { status: 404 });
    }

    const emails = users.map(user => user.email).filter(Boolean) as string[];

    if (emails.length === 0) {
      return Response.json({ error: "No valid email addresses found." }, { status: 404 });
    }

    const logoUrl = `${companyConfig.websiteUrl}/logo.png`;

    const { data: resendData, error: sendError } = await resend.emails.send({
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
                  ${imageUrls && imageUrls.length > 0 ? imageUrls.map((url: string) => `
                    <div style="margin: 20px 0; border-radius: 16px; overflow: hidden;">
                      <img src="${url}" alt="Special Offer" style="width: 100%; height: auto; display: block;">
                    </div>
                  `).join('') : ''}
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
      return Response.json(
        { error: process.env.NODE_ENV === "production" ? "Failed to send broadcast." : sendError.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: `Broadcast sent successfully to ${emails.length} users.`,
      recipientCount: emails.length,
      data: resendData,
    });

  } catch (error) {
    console.error("Broadcast error:", error);
    return Response.json(
      { error: "An error occurred while sending the broadcast." },
      { status: 500 }
    );
  }
}

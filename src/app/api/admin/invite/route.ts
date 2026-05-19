import { NextResponse } from "next/server";
import { resend, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME } from "@/lib/resend";
import { companyConfig } from "@/lib/site-config";

/**
 * Endpoint for sending registration invitations to potential VIP users.
 */
export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const registerUrl = `${companyConfig.websiteUrl}/register`;
    const logoUrl = `${companyConfig.websiteUrl}/logo.png`;

    const { data, error: sendError } = await resend.emails.send({
      from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: [email],
      subject: `Exclusive Invitation: Join the USA Pools VIP Club`,
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
              .content { padding: 40px 30px; text-align: center; }
              .title { color: #0f172a; font-size: 28px; font-weight: 800; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: -0.025em; line-height: 1.2; }
              .text { color: #334155; line-height: 1.8; font-size: 16px; margin-bottom: 30px; }
              .button-container { text-align: center; margin-top: 20px; }
              .button { background-color: #3b82f6; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; display: inline-block; }
              .footer { background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
              .footer-text { color: #64748b; font-size: 12px; margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="body">
              <div class="container">
                <div class="header">
                  <img src="${logoUrl}" alt="${companyConfig.name}" class="logo">
                </div>
                <div class="content">
                  <h1 class="title">You're Invited!</h1>
                  <p class="text">
                    Hello ${firstName || "there"},<br/><br/>
                    We're excited to invite you to join the <strong>USA Pools VIP Club</strong>. 
                    As a member, you'll get access to exclusive maintenance deals, priority scheduling, and premium discounts for all our pool services in Pennsylvania.
                  </p>
                  <div class="button-container">
                    <a href="${registerUrl}" class="button">Create Your VIP Account</a>
                  </div>
                  <p class="text" style="margin-top: 30px; font-size: 14px; color: #64748b;">
                    If you didn't expect this invitation, you can safely ignore this email.
                  </p>
                </div>
                <div class="footer">
                  <p class="footer-text"><strong>${companyConfig.name}</strong></p>
                  <p class="footer-text">${companyConfig.serviceArea}</p>
                  <p class="footer-text">
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
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Invitation sent successfully!" });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

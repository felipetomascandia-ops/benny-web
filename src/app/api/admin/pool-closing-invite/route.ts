import { NextResponse } from "next/server";
import { resend, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME } from "@/lib/resend";
import { companyConfig } from "@/lib/site-config";

function buildClosingScheduleUrl(params: { email?: string; firstName?: string; lastName?: string; phone?: string; address?: string }) {
  const base = `${companyConfig.websiteUrl}/schedule-closing`;
  const query = new URLSearchParams();
  if (params.email) query.set("email", params.email);
  if (params.firstName) query.set("firstName", params.firstName);
  if (params.lastName) query.set("lastName", params.lastName);
  if (params.phone) query.set("phone", params.phone);
  if (params.address) query.set("address", params.address);
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recipients = Array.isArray(body.recipients) ? body.recipients : [];
    const globalCustom = body.customMessage || "";

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient is required." },
        { status: 400 },
      );
    }

    const logoUrl = `${companyConfig.websiteUrl}/logo.png`;
    const results: { email: string; status: "success" | "error"; message?: string }[] = [];

    for (const recipient of recipients) {
      const email = String(recipient.email || "").trim();
      if (!email) continue;

      const firstName = String(recipient.firstName || "").trim();
      const lastName = String(recipient.lastName || "").trim();
      const phone = String(recipient.phone || "").trim();
      const address = String(recipient.address || "").trim();

      const scheduleUrl = buildClosingScheduleUrl({
        email,
        firstName,
        lastName,
        phone,
        address,
      });

      const displayName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Valued Customer";

      try {
        const { error: sendError } = await resend.emails.send({
          from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
          to: [email],
          subject: `Schedule Your Pool Closing - ${companyConfig.shortName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  .body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f8fc; margin: 0; padding: 40px 0; }
                  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                  .header { background: linear-gradient(135deg, #0077be 0%, #00a8e8 100%); padding: 40px 20px; text-align: center; }
                  .logo { height: 50px; width: auto; filter: brightness(0) invert(1); }
                  .content { padding: 40px 32px; }
                  .title { color: #0f172a; font-size: 26px; font-weight: 800; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: -0.02em; line-height: 1.2; }
                  .text { color: #334155; line-height: 1.8; font-size: 15px; margin: 0 0 20px 0; }
                  .highlight { background: #f0f9ff; border-left: 4px solid #0077be; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 24px 0; }
                  .highlight p { color: #0c4a6e; font-weight: 600; margin: 0; font-size: 14px; line-height: 1.6; }
                  .button-container { text-align: center; margin: 28px 0 12px 0; }
                  .button { background: linear-gradient(135deg, #0077be 0%, #00a8e8 100%); color: #ffffff; padding: 18px 40px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; box-shadow: 0 10px 20px -5px rgba(0, 119, 190, 0.4); }
                  .custom { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; margin: 24px 0; }
                  .custom-title { color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 10px 0; }
                  .custom-text { color: #334155; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap; }
                  .footer { background-color: #f8fafc; padding: 28px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
                  .footer-text { color: #64748b; font-size: 12px; margin: 4px 0; }
                  .footer-contact { color: #0077be; font-weight: 700; font-size: 13px; margin-top: 8px; }
                </style>
              </head>
              <body>
                <div class="body">
                  <div class="container">
                    <div class="header">
                      <img src="${logoUrl}" alt="${companyConfig.name}" class="logo">
                    </div>
                    <div class="content">
                      <h1 class="title">Schedule Your Pool Closing</h1>
                      <p class="text">
                        Hello <strong>${displayName}</strong>,<br/><br/>
                        It's that time of year again! Winter is approaching, and it's time to prepare your pool for the cold season.
                        Our team at <strong>${companyConfig.name}</strong> is ready to provide you with a professional pool closing service.
                      </p>
                      <div class="highlight">
                        <p>Secure your preferred date now. Simply click the button below, fill in your details, and choose the date that works best for you.</p>
                      </div>
                      ${globalCustom ? `<div class="custom"><p class="custom-title">A Message From Our Team</p><p class="custom-text">${globalCustom}</p></div>` : ""}
                      <div class="button-container">
                        <a href="${scheduleUrl}" class="button">Schedule Pool Closing</a>
                      </div>
                      <p class="text" style="margin-top: 28px; font-size: 13px; color: #64748b;">
                        If you have any questions, feel free to call us at <strong>${companyConfig.phoneDisplay}</strong> or reply to this email.<br/><br/>
                        If you don't need a pool closing this season, you can safely ignore this message.
                      </p>
                    </div>
                    <div class="footer">
                      <p class="footer-text"><strong>${companyConfig.name}</strong></p>
                      <p class="footer-contact">${companyConfig.phoneDisplay}</p>
                      <p class="footer-text">${companyConfig.serviceArea}</p>
                      <p class="footer-text">&copy; ${new Date().getFullYear()} ${companyConfig.name}. All rights reserved.</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        if (sendError) {
          results.push({ email, status: "error", message: sendError.message });
        } else {
          results.push({ email, status: "success" });
        }
      } catch (err: any) {
        results.push({ email, status: "error", message: err?.message || "Unknown error" });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      message: `Sent ${successCount} invitation(s). ${errorCount > 0 ? `${errorCount} failed.` : ""}`,
      successCount,
      errorCount,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

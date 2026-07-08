import { getSupabaseServerClient, getContractsBucketName, hasSupabaseServerCredentials } from "@/lib/supabase";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { companyConfig } from "@/lib/site-config";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import { resend, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME } from "@/lib/resend";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

type CreateContractRequest = {
  customerName: string;
  customerAddress: string;
  contractTitle: string;
  periodStart: string;
  periodEnd: string;
  frequency: string;
  customFrequency: string;
  services: string[];
  additionalNotes: string;
  price: number;
  saveToBucket?: boolean;
  sendToEmail?: string;
};

function cleanText(text: string | null | undefined): string {
  return (text || "").toString().trim();
}

function formatMoney(amount: number | null | undefined): string {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

async function generateContractPdf(data: CreateContractRequest) {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Create pages
  let currentPage = pdfDoc.addPage([612, 792]);
  let { width, height } = currentPage.getSize();
  const margin = 50;
  let yPos = height - margin;

  // Helper function to check if we need a new page
  function checkAndAddPage(requiredSpace: number) {
    if (yPos - requiredSpace < margin + 20) {
      currentPage = pdfDoc.addPage([612, 792]);
      yPos = height - margin;
    }
  }

  // Helper function to draw wrapped text
  function drawWrappedText(text: string, startX: number, startY: number, maxWidth: number, fontSize: number, lineHeight: number) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const testWidth = helveticaFont.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    let y = startY;
    for (const line of lines) {
      // Check if we need a new page before drawing this line
      if (y - lineHeight < margin + 20) {
        currentPage = pdfDoc.addPage([612, 792]);
        y = height - margin;
      }

      currentPage.drawText(line, {
        x: startX,
        y: y,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
    }

    return y;
  }

  // Company header
  currentPage.drawText(companyConfig.name, {
    x: margin,
    y: yPos,
    size: 26,
    font: helveticaBold,
    color: rgb(0.05, 0.38, 0.94),
  });

  yPos -= 20;

  currentPage.drawText(`${companyConfig.email} · ${companyConfig.phoneDisplay}`, {
    x: margin,
    y: yPos,
    size: 10,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Date
  yPos -= 40;
  currentPage.drawText(format(new Date(), "MMMM d, yyyy"), {
    x: width - margin - 150,
    y: yPos,
    size: 10,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Title
  yPos -= 45;
  currentPage.drawText("POOL SERVICE AGREEMENT", {
    x: width / 2 - 90,
    y: yPos,
    size: 20,
    font: helveticaBold,
    color: rgb(0.05, 0.38, 0.94),
  });

  // Divider
  yPos -= 15;
  currentPage.drawLine({
    start: { x: margin, y: yPos },
    end: { x: width - margin, y: yPos },
    color: rgb(0.05, 0.38, 0.94),
    thickness: 2,
  });

  yPos -= 35;

  // Contract title
  currentPage.drawText("Agreement Title:", {
    x: margin,
    y: yPos,
    size: 13,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentPage.drawText(data.contractTitle, {
    x: margin + 120,
    y: yPos,
    size: 13,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  yPos -= 28;

  // Customer info
  currentPage.drawText("Customer Name:", {
    x: margin,
    y: yPos,
    size: 13,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentPage.drawText(data.customerName, {
    x: margin + 120,
    y: yPos,
    size: 13,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  yPos -= 28;

  currentPage.drawText("Customer Address:", {
    x: margin,
    y: yPos,
    size: 13,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentPage.drawText(data.customerAddress, {
    x: margin + 140,
    y: yPos,
    size: 13,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  yPos -= 28;

  // Period
  currentPage.drawText("Contract Period:", {
    x: margin,
    y: yPos,
    size: 13,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentPage.drawText(`${data.periodStart} - ${data.periodEnd}`, {
    x: margin + 130,
    y: yPos,
    size: 13,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  yPos -= 45;

  // Section: Service Frequency
  currentPage.drawText("1. SERVICE FREQUENCY", {
    x: margin,
    y: yPos,
    size: 15,
    font: helveticaBold,
    color: rgb(0.05, 0.38, 0.94),
  });

  yPos -= 30;

  const frequencyOptions = [
    { label: "Weekly", value: "weekly" },
    { label: "Bi-weekly (Every 2 Weeks)", value: "biweekly" },
    { label: "Custom Frequency:", value: "custom" },
  ];

  for (const option of frequencyOptions) {
    const isChecked = data.frequency === option.value;
    const checkboxX = margin;
    const checkboxY = yPos;
    const checkboxSize = 13;

    currentPage.drawRectangle({
      x: checkboxX,
      y: checkboxY - checkboxSize,
      width: checkboxSize,
      height: checkboxSize,
      borderColor: rgb(0.1, 0.1, 0.1),
      borderWidth: 1.2,
    });

    if (isChecked) {
      currentPage.drawLine({
        start: { x: checkboxX + 2, y: checkboxY - 6 },
        end: { x: checkboxX + 5, y: checkboxY - 10 },
        color: rgb(0, 0, 0),
        thickness: 1.8,
      });
      currentPage.drawLine({
        start: { x: checkboxX + 5, y: checkboxY - 10 },
        end: { x: checkboxX + 11, y: checkboxY - 3 },
        color: rgb(0, 0, 0),
        thickness: 1.8,
      });
    }

    currentPage.drawText(option.label, {
      x: checkboxX + checkboxSize + 10,
      y: checkboxY - 9,
      size: 12,
      font: helveticaFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    if (option.value === "custom") {
      currentPage.drawText(data.customFrequency, {
        x: checkboxX + checkboxSize + 125,
        y: checkboxY - 9,
        size: 12,
        font: helveticaFont,
        color: rgb(0.1, 0.1, 0.1),
      });
    }

    yPos -= 28;
  }

  yPos -= 20;

  // Section: Included Services
  currentPage.drawText("2. INCLUDED SERVICES", {
    x: margin,
    y: yPos,
    size: 15,
    font: helveticaBold,
    color: rgb(0.05, 0.38, 0.94),
  });

  yPos -= 30;

  const allServices = [
    { label: "Professional Pool Cleaning", value: "pool-cleaning" },
    { label: "Water Chemical Testing & Balancing", value: "chemical-testing" },
    { label: "Complete Pool Vacuuming", value: "pool-vacuuming" },
    { label: "All Required Chemicals Provided by Company", value: "we-provide-chemicals" },
    { label: "Pool Opening & Closing (Seasonal)", value: "pool-opening-closing" },
  ];

  for (const service of allServices) {
    const isChecked = data.services.includes(service.value);
    const checkboxX = margin;
    const checkboxY = yPos;
    const checkboxSize = 13;

    currentPage.drawRectangle({
      x: checkboxX,
      y: checkboxY - checkboxSize,
      width: checkboxSize,
      height: checkboxSize,
      borderColor: rgb(0.1, 0.1, 0.1),
      borderWidth: 1.2,
    });

    if (isChecked) {
      currentPage.drawLine({
        start: { x: checkboxX + 2, y: checkboxY - 6 },
        end: { x: checkboxX + 5, y: checkboxY - 10 },
        color: rgb(0, 0, 0),
        thickness: 1.8,
      });
      currentPage.drawLine({
        start: { x: checkboxX + 5, y: checkboxY - 10 },
        end: { x: checkboxX + 11, y: checkboxY - 3 },
        color: rgb(0, 0, 0),
        thickness: 1.8,
      });
    }

    currentPage.drawText(service.label, {
      x: checkboxX + checkboxSize + 10,
      y: checkboxY - 9,
      size: 12,
      font: helveticaFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    yPos -= 28;
  }

  // Additional notes
  if (data.additionalNotes.trim()) {
    yPos -= 15;

    currentPage.drawText("Additional Notes:", {
      x: margin,
      y: yPos,
      size: 13,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    yPos -= 28;
    yPos = drawWrappedText(data.additionalNotes, margin, yPos, width - margin * 2, 11, 18);
  }

  yPos -= 30;

  // Section: Pricing
  currentPage.drawText("3. PRICING & PAYMENT TERMS", {
    x: margin,
    y: yPos,
    size: 15,
    font: helveticaBold,
    color: rgb(0.05, 0.38, 0.94),
  });

  yPos -= 30;

  currentPage.drawText("Total Contract Price:", {
    x: margin,
    y: yPos,
    size: 13,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentPage.drawText(formatMoney(data.price), {
    x: margin + 160,
    y: yPos,
    size: 20,
    font: helveticaBold,
    color: rgb(0.05, 0.38, 0.94),
  });

  // Check if we need a new page before terms
  checkAndAddPage(250);

  // Section: Terms and Conditions
  currentPage.drawText("4. TERMS AND CONDITIONS", {
    x: margin,
    y: yPos,
    size: 15,
    font: helveticaBold,
    color: rgb(0.05, 0.38, 0.94),
  });

  yPos -= 30;

  const terms = [
    "• Deposit Policy: A 100% non-refundable deposit is required to secure services. Once paid, deposits are not returned under any circumstances.",
    "• Included in Price: All quoted prices include professional pool services, all necessary chemicals, and regular maintenance visits as specified in this agreement.",
    "• Cancellation Policy: Customer must provide 7 days' written notice to cancel or reschedule a service visit.",
    "• Access to Property: Customer agrees to provide safe and unrestricted access to the pool and equipment during agreed-upon service hours.",
    "• Liability: Company is not responsible for damage caused by pre-existing pool conditions, equipment failure, or acts of nature.",
    "• Payment Terms: All balances must be paid in full before or on the date of each service visit unless otherwise agreed in writing.",
  ];

  for (const term of terms) {
    yPos = drawWrappedText(term, margin, yPos, width - margin * 2, 10.5, 17);
  }

  // Check if we need a new page before signatures
  checkAndAddPage(120);

  // Signatures
  currentPage.drawLine({
    start: { x: margin, y: yPos },
    end: { x: margin + 220, y: yPos },
    color: rgb(0.3, 0.3, 0.3),
    thickness: 1.5,
  });

  currentPage.drawText("Customer Signature", {
    x: margin,
    y: yPos - 18,
    size: 11,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  currentPage.drawText("Printed Name:", {
    x: margin,
    y: yPos - 36,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  currentPage.drawLine({
    start: { x: margin + 75, y: yPos - 33 },
    end: { x: margin + 220, y: yPos - 33 },
    color: rgb(0.3, 0.3, 0.3),
    thickness: 1,
  });

  currentPage.drawText("Date:", {
    x: margin,
    y: yPos - 54,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  currentPage.drawLine({
    start: { x: margin + 40, y: yPos - 51 },
    end: { x: margin + 220, y: yPos - 51 },
    color: rgb(0.3, 0.3, 0.3),
    thickness: 1,
  });

  currentPage.drawLine({
    start: { x: width - margin - 220, y: yPos },
    end: { x: width - margin, y: yPos },
    color: rgb(0.3, 0.3, 0.3),
    thickness: 1.5,
  });

  currentPage.drawText(`${companyConfig.name} Signature`, {
    x: width - margin - 220,
    y: yPos - 18,
    size: 11,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  currentPage.drawText("Printed Name:", {
    x: width - margin - 220,
    y: yPos - 36,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  currentPage.drawText(companyConfig.ownerName, {
    x: width - margin - 220 + 75,
    y: yPos - 36,
    size: 10,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  currentPage.drawText("Date:", {
    x: width - margin - 220,
    y: yPos - 54,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  currentPage.drawLine({
    start: { x: width - margin - 220 + 40, y: yPos - 51 },
    end: { x: width - margin, y: yPos - 51 },
    color: rgb(0.3, 0.3, 0.3),
    thickness: 1,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function buildContractEmailText(input: CreateContractRequest, publicUrl?: string) {
  return [
    `Hello ${cleanText(input.customerName)},`,
    "",
    `Your contract from ${companyConfig.shortName} is ready.`,
    "",
    `Contract Title: ${cleanText(input.contractTitle)}`,
    `Period: ${cleanText(input.periodStart)} - ${cleanText(input.periodEnd)}`,
    `Total Contract Price: ${formatMoney(input.price)}`,
    "",
    publicUrl ? `Hosted PDF link: ${publicUrl}` : "The PDF is attached to this email.",
    "",
    `Questions? Reply to this email or contact ${companyConfig.name} at ${companyConfig.phoneDisplay}.`,
  ].join("\n");
}

function buildContractEmailHtml(input: CreateContractRequest, publicUrl?: string) {
  const logoUrl = `${companyConfig.websiteUrl}/logo.png`;
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          .body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          .header { background-color: #0f172a; padding: 40px 20px; text-align: center; }
          .logo { height: 50px; width: auto; filter: brightness(0) invert(1); }
          .content { padding: 40px 30px; text-align: left; }
          .title { color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 20px; }
          .text { color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 14px; }
          .details { background: #f8fbff; border: 1px solid #dbeafe; border-radius: 18px; padding: 18px; margin: 20px 0; }
          .detail-item { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; }
          .detail-label { font-weight: 700; color: #2563eb; text-transform: uppercase; font-size: 11px; letter-spacing: 0.16em; }
          .detail-value { color: #0f172a; font-weight: 700; }
          .footer { background-color: #f8fafc; padding: 24px; text-align: center; color: #64748b; font-size: 12px; }
          .footer-text { margin: 0; }
          a { color: #2563eb; text-decoration: none; }
        </style>
      </head>
      <body class="body">
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="${companyConfig.name}" class="logo" />
          </div>
          <div class="content">
            <p class="text">Hello ${cleanText(input.customerName)},</p>
            <p class="text">Your contract is ready. We attached the PDF for your review.</p>
            <div class="details">
              <div class="detail-item">
                <span class="detail-label">Contract Title</span>
                <span class="detail-value">${cleanText(input.contractTitle)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Period</span>
                <span class="detail-value">${cleanText(input.periodStart)} - ${cleanText(input.periodEnd)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Price</span>
                <span class="detail-value">${formatMoney(input.price)}</span>
              </div>
            </div>
            ${
              publicUrl
                ? `<p class="text">You can also view the hosted PDF here:<br /><a href="${publicUrl}">${publicUrl}</a></p>`
                : ""
            }
            <p class="text">
              Questions? Reply to this email or contact ${companyConfig.name} at ${companyConfig.phoneDisplay}.
            </p>
          </div>
          <div class="footer">
            <p class="footer-text">
              &copy; ${currentYear} ${companyConfig.name}. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function uploadContractToStorage(input: CreateContractRequest, pdfBytes: Uint8Array, fileName: string) {
  if (!hasSupabaseServerCredentials()) {
    return {
      error:
        "Supabase is not configured. To upload PDFs, set server-side Supabase credentials and create a public Storage bucket for contracts.",
      status: 503,
    };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase is unavailable.", status: 503 };
  }

  const bucket = getContractsBucketName();
  const storagePath = `contracts/${fileName.replace(".pdf", "")}-${randomUUID()}.pdf`;
  const fileBuffer = Buffer.from(pdfBytes);

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, fileBuffer, {
    cacheControl: "3600",
    contentType: "application/pdf",
    upsert: false,
  });

  if (uploadError) {
    return {
      error:
        process.env.NODE_ENV === "production"
          ? "PDF upload failed. Verify your Supabase bucket configuration."
          : uploadError.message,
      status: 500,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return { publicUrl, storagePath };
}

async function sendContractEmail(input: CreateContractRequest, pdfBytes: Uint8Array, fileName: string, publicUrl?: string) {
  const recipient = cleanText(input.sendToEmail);
  if (!recipient) {
    return { error: "A destination email is required.", status: 400 };
  }

  const { data, error: sendError } = await resend.emails.send({
    from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
    to: [recipient],
    replyTo: companyConfig.email,
    subject: `Your contract from ${companyConfig.shortName}`,
    text: buildContractEmailText(input, publicUrl),
    html: buildContractEmailHtml(input, publicUrl),
    attachments: [
      {
        filename: fileName,
        content: Buffer.from(pdfBytes).toString("base64"),
      },
    ],
  });

  if (sendError) {
    return {
      error: sendError.message || "Resend could not deliver the email.",
      status: 502,
    };
  }

  return { success: true };
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "generate";

  try {
    const raw = (await request.json()) as Partial<CreateContractRequest>;
    const data: CreateContractRequest = {
      customerName: raw.customerName || "",
      customerAddress: raw.customerAddress || "",
      contractTitle: raw.contractTitle || "Summer Full Season",
      periodStart: raw.periodStart || "",
      periodEnd: raw.periodEnd || "",
      frequency: raw.frequency || "weekly",
      customFrequency: raw.customFrequency || "",
      services: raw.services || [],
      additionalNotes: raw.additionalNotes || "",
      price: Number(raw.price) || 0,
      saveToBucket: raw.saveToBucket,
      sendToEmail: raw.sendToEmail,
    };

    const pdfBytes = await generateContractPdf(data);
    const fileName = `${cleanText(data.customerName).replace(/\s+/g, "_")}_Contract_${format(new Date(), "yyyyMMdd")}.pdf`;

    if (mode === "download") {
      const pdfArrayBuffer = new ArrayBuffer(pdfBytes.length);
      new Uint8Array(pdfArrayBuffer).set(pdfBytes);

      return new Response(pdfArrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
        },
      });
    }

    if (mode === "email") {
      let publicUrl: string | undefined;
      if (data.saveToBucket) {
        const uploadResult = await uploadContractToStorage(data, pdfBytes, fileName);
        if (!("error" in uploadResult)) {
          publicUrl = uploadResult.publicUrl;
        }
      }

      const emailResult = await sendContractEmail(data, pdfBytes, fileName, publicUrl);
      if ("error" in emailResult) {
        return Response.json({ error: emailResult.error }, { status: emailResult.status });
      }

      return Response.json(
        {
          message: `Contract sent to ${cleanText(data.sendToEmail)}.`,
          publicUrl,
        },
        { status: 200 }
      );
    }

    // Default "generate" mode for preview
    let publicUrl: string | null = null;
    if (data.saveToBucket) {
      const uploadResult = await uploadContractToStorage(data, pdfBytes, fileName);
      if (!("error" in uploadResult)) {
        publicUrl = uploadResult.publicUrl;
      }
    }

    const base64Pdf = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json({
      pdfBase64: base64Pdf,
      fileName,
      publicUrl,
    });
  } catch (error) {
    console.error("Contract PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate contract PDF. Please try again." },
      { status: 500 }
    );
  }
}

import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";

import { companyConfig } from "@/lib/site-config";
import { getInvoicesBucketName, getSupabaseServerClient, hasSupabaseServerCredentials } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

type InvoiceInput = {
  estimateNumber: string;
  estimateDate: string;
  companyEmail: string;
  companyPhone: string;
  clientFirstName: string;
  clientLastName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  estimateAmount: string;
  notes: string;
  sendToEmail: string;
};

type PdfFonts = {
  regular: PDFFont;
  bold: PDFFont;
};

type PageContext = {
  page: PDFPage;
  cursorY: number;
};

type UploadResult =
  | {
      publicUrl: string;
      storagePath: string;
    }
  | {
      error: string;
      status: number;
    };

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 42;
const FOOTER_Y = 36;
const TABLE_COLUMNS = {
  descriptionX: MARGIN_X + 14,
  qtyX: 382,
  unitX: 438,
  totalX: 540,
};

const COLORS = {
  ink: rgb(0.07, 0.11, 0.18),
  muted: rgb(0.4, 0.46, 0.54),
  line: rgb(0.87, 0.9, 0.94),
  panel: rgb(0.97, 0.98, 1),
  accent: rgb(0.08, 0.45, 0.82),
  accentDark: rgb(0.03, 0.16, 0.31),
  accentSoft: rgb(0.9, 0.95, 1),
  white: rgb(1, 1, 1),
  slateSoft: rgb(0.95, 0.96, 0.98),
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function safeNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatClientName(input: InvoiceInput) {
  return `${cleanText(input.clientFirstName)} ${cleanText(input.clientLastName)}`.trim() || "Valued Client";
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number) {
  const normalized = cleanText(text).replace(/\s+/g, " ");
  if (!normalized) {
    return ["-"];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
      continue;
    }

    let fragment = "";
    for (const letter of word) {
      const nextFragment = `${fragment}${letter}`;
      if (font.widthOfTextAtSize(nextFragment, size) > maxWidth && fragment) {
        lines.push(fragment);
        fragment = letter;
      } else {
        fragment = nextFragment;
      }
    }

    currentLine = fragment;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawRightAlignedText(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  font: PDFFont,
  size: number,
  color = COLORS.ink,
) {
  page.drawText(text, {
    x: rightX - font.widthOfTextAtSize(text, size),
    y,
    size,
    font,
    color,
  });
}

function drawWrappedLines(
  page: PDFPage,
  lines: string[],
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  lineHeight: number,
  color = COLORS.ink,
) {
  let cursorY = y;
  for (const line of lines) {
    page.drawText(line, {
      x,
      y: cursorY,
      size,
      font,
      color,
    });
    cursorY -= lineHeight;
  }
}

function drawInfoCard(
  page: PDFPage,
  fonts: PdfFonts,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    lines: string[];
  },
) {
  page.drawRectangle({
    x: options.x,
    y: options.y - options.height,
    width: options.width,
    height: options.height,
    color: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  page.drawText(options.title.toUpperCase(), {
    x: options.x + 16,
    y: options.y - 20,
    size: 8,
    font: fonts.bold,
    color: COLORS.accent,
  });

  let lineY = options.y - 40;
  for (const line of options.lines.filter(Boolean)) {
    const wrapped = wrapText(line, options.width - 32, fonts.regular, 10);
    for (const segment of wrapped) {
      page.drawText(segment, {
        x: options.x + 16,
        y: lineY,
        size: 10,
        font: fonts.regular,
        color: COLORS.ink,
      });
      lineY -= 13;
    }
  }
}

async function loadEmbeddedLogo(pdfDoc: PDFDocument) {
  const candidates = ["logo.png", "logo.jpg", "logo.jpeg", "logo.ico"];

  for (const filename of candidates) {
    try {
      const fileBuffer = await readFile(path.join(process.cwd(), "public", filename));
      if (filename.endsWith(".png")) {
        return pdfDoc.embedPng(fileBuffer);
      }
      if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
        return pdfDoc.embedJpg(fileBuffer);
      }
    } catch (error) {
      console.warn(`Could not load ${filename} for estimate PDF.`, error);
    }
  }

  return null;
}

function drawHeader(page: PDFPage, fonts: PdfFonts, input: InvoiceInput, logoImage: PDFImage | null, totalAmount: number) {
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 168,
    width: PAGE_WIDTH,
    height: 168,
    color: COLORS.accentDark,
  });

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 178,
    width: PAGE_WIDTH,
    height: 10,
    color: COLORS.accent,
  });

  page.drawText(companyConfig.name, {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 58,
    size: 22,
    font: fonts.bold,
    color: COLORS.white,
  });

  page.drawText("Custom pool construction, renovation, and maintenance estimates", {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 80,
    size: 10,
    font: fonts.regular,
    color: rgb(0.86, 0.91, 0.97),
  });

  const companyLines = [input.companyPhone, input.companyEmail, companyConfig.websiteUrl, companyConfig.serviceArea].filter(Boolean);
  let companyY = PAGE_HEIGHT - 104;
  for (const line of companyLines) {
    page.drawText(line, {
      x: MARGIN_X,
      y: companyY,
      size: 9,
      font: fonts.regular,
      color: rgb(0.78, 0.84, 0.9),
    });
    companyY -= 12;
  }

  if (logoImage) {
    const targetWidth = 120;
    const targetHeight = (logoImage.height / logoImage.width) * targetWidth;
    page.drawImage(logoImage, {
      x: PAGE_WIDTH - MARGIN_X - targetWidth,
      y: PAGE_HEIGHT - 82 - targetHeight / 2,
      width: targetWidth,
      height: targetHeight,
    });
  } else {
    drawRightAlignedText(page, companyConfig.shortName.toUpperCase(), PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 60, fonts.bold, 18, COLORS.white);
  }

  page.drawText("ESTIMATE", {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 198,
    size: 24,
    font: fonts.bold,
    color: COLORS.ink,
  });

  page.drawText("Prepared exclusively for the client listed below", {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 216,
    size: 10,
    font: fonts.regular,
    color: COLORS.muted,
  });

  page.drawRectangle({
    x: PAGE_WIDTH - 212,
    y: PAGE_HEIGHT - 250,
    width: 170,
    height: 72,
    color: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  page.drawText("ESTIMATED TOTAL", {
    x: PAGE_WIDTH - 196,
    y: PAGE_HEIGHT - 206,
    size: 8,
    font: fonts.bold,
    color: COLORS.accent,
  });

  drawRightAlignedText(page, formatMoney(totalAmount), PAGE_WIDTH - 58, PAGE_HEIGHT - 226, fonts.bold, 18, COLORS.ink);
}

function drawFooter(page: PDFPage, fonts: PdfFonts) {
  page.drawLine({
    start: { x: MARGIN_X, y: FOOTER_Y + 18 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: FOOTER_Y + 18 },
    thickness: 1,
    color: COLORS.line,
  });

  page.drawText(`Thank you for choosing ${companyConfig.name}.`, {
    x: MARGIN_X,
    y: FOOTER_Y + 4,
    size: 9,
    font: fonts.bold,
    color: COLORS.ink,
  });

  drawRightAlignedText(
    page,
    `${companyConfig.phoneDisplay}  |  ${companyConfig.email}  |  ${companyConfig.websiteUrl}`,
    PAGE_WIDTH - MARGIN_X,
    FOOTER_Y + 4,
    fonts.regular,
    8,
    COLORS.muted,
  );
}

function createPage(
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  input: InvoiceInput,
  logoImage: PDFImage | null,
  totalAmount: number,
) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page, fonts, input, logoImage, totalAmount);
  drawFooter(page, fonts);

  return {
    page,
    cursorY: PAGE_HEIGHT - 286,
  } satisfies PageContext;
}

function drawSectionLabel(page: PDFPage, fonts: PdfFonts, x: number, y: number, label: string) {
  page.drawText(label.toUpperCase(), {
    x,
    y,
    size: 8,
    font: fonts.bold,
    color: COLORS.accent,
  });
}

function drawTableHeader(context: PageContext, fonts: PdfFonts) {
  context.page.drawRectangle({
    x: MARGIN_X,
    y: context.cursorY - 8,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: 28,
    color: COLORS.accent,
  });

  context.page.drawText("Description", {
    x: TABLE_COLUMNS.descriptionX,
    y: context.cursorY + 3,
    size: 9,
    font: fonts.bold,
    color: COLORS.white,
  });

  context.page.drawText("Qty", {
    x: TABLE_COLUMNS.qtyX,
    y: context.cursorY + 3,
    size: 9,
    font: fonts.bold,
    color: COLORS.white,
  });

  context.page.drawText("Unit Price", {
    x: TABLE_COLUMNS.unitX,
    y: context.cursorY + 3,
    size: 9,
    font: fonts.bold,
    color: COLORS.white,
  });

  drawRightAlignedText(context.page, "Amount", TABLE_COLUMNS.totalX, context.cursorY + 3, fonts.bold, 9, COLORS.white);
  context.cursorY -= 28;
}

function buildItems(inputItems: InvoiceInput["items"]) {
  return inputItems
    .map((item) => ({
      ...item,
      description: cleanText(item.description),
      quantity: Number.isFinite(item.quantity) ? item.quantity : 0,
      unitPrice: Number.isFinite(item.unitPrice) ? item.unitPrice : 0,
    }))
    .filter((item) => item.description || item.quantity || item.unitPrice);
}

async function generatePdfBytes(input: InvoiceInput) {
  const pdfDoc = await PDFDocument.create();
  const fonts: PdfFonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };
  const logoImage = await loadEmbeddedLogo(pdfDoc);
  const totalAmount = safeNumber(input.estimateAmount);
  const sanitizedItems = buildItems(input.items);

  let context = createPage(pdfDoc, fonts, input, logoImage, totalAmount);

  drawInfoCard(context.page, fonts, {
    x: MARGIN_X,
    y: context.cursorY,
    width: 248,
    height: 104,
    title: "Prepared For",
    lines: [formatClientName(input), input.clientAddress, input.clientEmail, input.clientPhone],
  });

  drawInfoCard(context.page, fonts, {
    x: 312,
    y: context.cursorY,
    width: PAGE_WIDTH - 312 - MARGIN_X,
    height: 104,
    title: "Estimate Details",
    lines: [
      `Estimate #: ${input.estimateNumber}`,
      `Date Issued: ${input.estimateDate}`,
      `Estimate Total: ${formatMoney(totalAmount)}`,
      "Final pricing may vary after on-site inspection.",
    ],
  });

  context.cursorY -= 136;

  drawSectionLabel(context.page, fonts, MARGIN_X, context.cursorY, "Project Scope");
  context.cursorY -= 18;
  drawTableHeader(context, fonts);

  const descriptionWidth = 250;

  sanitizedItems.forEach((item, index) => {
    const itemTotal = item.quantity * item.unitPrice;
    const descriptionLines = wrapText(item.description || "-", descriptionWidth, fonts.regular, 10);
    const rowHeight = Math.max(36, descriptionLines.length * 12 + 14);

    if (context.cursorY - rowHeight < FOOTER_Y + 120) {
      context = createPage(pdfDoc, fonts, input, logoImage, totalAmount);
      drawSectionLabel(context.page, fonts, MARGIN_X, context.cursorY, "Project Scope");
      context.cursorY -= 18;
      drawTableHeader(context, fonts);
    }

    context.page.drawRectangle({
      x: MARGIN_X,
      y: context.cursorY - rowHeight + 6,
      width: PAGE_WIDTH - MARGIN_X * 2,
      height: rowHeight,
      color: index % 2 === 0 ? COLORS.white : COLORS.slateSoft,
      borderColor: COLORS.line,
      borderWidth: 0.5,
    });

    drawWrappedLines(context.page, descriptionLines, TABLE_COLUMNS.descriptionX, context.cursorY - 12, fonts.regular, 10, 12, COLORS.ink);
    context.page.drawText(String(item.quantity), {
      x: TABLE_COLUMNS.qtyX,
      y: context.cursorY - 12,
      size: 10,
      font: fonts.bold,
      color: COLORS.ink,
    });
    drawRightAlignedText(context.page, formatMoney(item.unitPrice), 500, context.cursorY - 12, fonts.regular, 10);
    drawRightAlignedText(context.page, formatMoney(itemTotal), TABLE_COLUMNS.totalX, context.cursorY - 12, fonts.bold, 10);

    context.cursorY -= rowHeight;
  });

  context.cursorY -= 24;

  if (context.cursorY < FOOTER_Y + 170) {
    context = createPage(pdfDoc, fonts, input, logoImage, totalAmount);
  }

  const totalsCardX = PAGE_WIDTH - 238;
  context.page.drawRectangle({
    x: totalsCardX,
    y: context.cursorY - 70,
    width: 196,
    height: 86,
    color: COLORS.panel,
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  context.page.drawText("Subtotal", {
    x: totalsCardX + 18,
    y: context.cursorY - 14,
    size: 10,
    font: fonts.regular,
    color: COLORS.muted,
  });
  drawRightAlignedText(context.page, formatMoney(totalAmount), totalsCardX + 178, context.cursorY - 14, fonts.regular, 10);

  context.page.drawLine({
    start: { x: totalsCardX + 18, y: context.cursorY - 28 },
    end: { x: totalsCardX + 178, y: context.cursorY - 28 },
    thickness: 1,
    color: COLORS.line,
  });

  context.page.drawText("Total Estimate", {
    x: totalsCardX + 18,
    y: context.cursorY - 48,
    size: 10,
    font: fonts.bold,
    color: COLORS.accent,
  });
  drawRightAlignedText(context.page, formatMoney(totalAmount), totalsCardX + 178, context.cursorY - 50, fonts.bold, 16, COLORS.accentDark);

  if (input.notes) {
    const notesWidth = totalsCardX - MARGIN_X - 24;
    const noteLines = wrapText(input.notes, notesWidth - 28, fonts.regular, 10);
    const notesHeight = Math.max(86, noteLines.length * 12 + 34);

    context.page.drawRectangle({
      x: MARGIN_X,
      y: context.cursorY - notesHeight,
      width: notesWidth,
      height: notesHeight,
      color: COLORS.white,
      borderColor: COLORS.line,
      borderWidth: 1,
    });

    drawSectionLabel(context.page, fonts, MARGIN_X + 16, context.cursorY - 18, "Notes");
    drawWrappedLines(context.page, noteLines, MARGIN_X + 16, context.cursorY - 38, fonts.regular, 10, 12, COLORS.muted);
  }

  context.page.drawText("This estimate is based on the project details currently available and may be refined after final measurements or on-site evaluation.", {
    x: MARGIN_X,
    y: FOOTER_Y + 32,
    size: 8,
    font: fonts.regular,
    color: COLORS.muted,
  });

  return pdfDoc.save();
}

function getEmailTransportConfig() {
  const host = cleanText(process.env.SMTP_HOST);
  const port = Number(process.env.SMTP_PORT || "587");
  const user = cleanText(process.env.SMTP_USER);
  const pass = cleanText(process.env.SMTP_PASS);
  const fromEmail = cleanText(process.env.SMTP_FROM_EMAIL);
  const fromName = cleanText(process.env.SMTP_FROM_NAME) || companyConfig.name;
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  if (!host || !port || !user || !pass || !fromEmail) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    fromEmail,
    fromName,
    replyTo: cleanText(process.env.SMTP_REPLY_TO) || companyConfig.email,
  };
}

function buildEstimateEmailHtml(input: InvoiceInput, totalAmount: number, publicUrl?: string) {
  const clientName = formatClientName(input);
  const lines = buildItems(input.items)
    .slice(0, 5)
    .map((item) => {
      const amount = formatMoney(item.quantity * item.unitPrice);
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e6edf5;color:#0f172a;">${item.description || "-"}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e6edf5;color:#64748b;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e6edf5;color:#0f172a;text-align:right;">${amount}</td>
      </tr>`;
    })
    .join("");

  return `
    <div style="background:#f3f7fb;padding:32px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dbe5f0;">
        <div style="background:linear-gradient(135deg,#0b2747,#0f5eb8);padding:28px 32px;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.86;">Professional Estimate</div>
          <div style="font-size:28px;font-weight:700;margin-top:8px;">${companyConfig.name}</div>
          <div style="font-size:14px;opacity:0.9;margin-top:6px;">Custom pool construction, remodeling, and premium maintenance.</div>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 14px;font-size:15px;">Hello ${clientName},</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#334155;">
            Your estimate <strong>${input.estimateNumber}</strong> is ready. We attached the PDF to this email for easy review.
          </p>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:26px;">
            <div style="flex:1;min-width:200px;background:#f8fbff;border:1px solid #dbeafe;border-radius:18px;padding:18px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#2563eb;font-weight:700;">Date Issued</div>
              <div style="font-size:16px;font-weight:700;margin-top:6px;">${input.estimateDate}</div>
            </div>
            <div style="flex:1;min-width:200px;background:#f8fbff;border:1px solid #dbeafe;border-radius:18px;padding:18px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#2563eb;font-weight:700;">Estimated Total</div>
              <div style="font-size:16px;font-weight:700;margin-top:6px;">${formatMoney(totalAmount)}</div>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr>
                <th style="text-align:left;padding-bottom:10px;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#2563eb;">Scope Item</th>
                <th style="text-align:center;padding-bottom:10px;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#2563eb;">Qty</th>
                <th style="text-align:right;padding-bottom:10px;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#2563eb;">Amount</th>
              </tr>
            </thead>
            <tbody>${lines}</tbody>
          </table>
          ${
            publicUrl
              ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#334155;">
                  You can also view the hosted PDF here:<br />
                  <a href="${publicUrl}" style="color:#2563eb;text-decoration:none;">${publicUrl}</a>
                </p>`
              : ""
          }
          <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
            Questions? Reply to this email, call <strong>${input.companyPhone}</strong>, or contact us on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  `;
}

function buildEstimateEmailText(input: InvoiceInput, totalAmount: number, publicUrl?: string) {
  return [
    `Hello ${formatClientName(input)},`,
    "",
    `Your estimate ${input.estimateNumber} is ready.`,
    `Date issued: ${input.estimateDate}`,
    `Estimated total: ${formatMoney(totalAmount)}`,
    "",
    publicUrl ? `Hosted PDF link: ${publicUrl}` : "The PDF is attached to this email.",
    "",
    `Questions? Reply to this email or contact ${companyConfig.name} at ${input.companyPhone}.`,
  ].join("\n");
}

async function uploadPdfToStorage(input: InvoiceInput, pdfBytes: Uint8Array): Promise<UploadResult> {
  if (!hasSupabaseServerCredentials()) {
    return {
      error:
        "Supabase is not configured. To upload PDFs, set server-side Supabase credentials and create a public Storage bucket for invoices.",
      status: 503,
    };
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { error: "Supabase is unavailable.", status: 503 };
  }

  const bucket = getInvoicesBucketName();
  const storagePath = `invoices/${input.estimateNumber}-${randomUUID()}.pdf`;
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

async function sendEstimateEmail(input: InvoiceInput, pdfBytes: Uint8Array, publicUrl?: string) {
  const transportConfig = getEmailTransportConfig();
  if (!transportConfig) {
    return {
      error:
        "Email delivery is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL in your server environment.",
      status: 503,
    };
  }

  const recipient = cleanText(input.sendToEmail) || cleanText(input.clientEmail);
  if (!recipient) {
    return { error: "A destination email is required.", status: 400 };
  }

  const transporter = nodemailer.createTransport({
    host: transportConfig.host,
    port: transportConfig.port,
    secure: transportConfig.secure,
    auth: transportConfig.auth,
  });

  const totalAmount = safeNumber(input.estimateAmount);

  await transporter.sendMail({
    from: `"${transportConfig.fromName}" <${transportConfig.fromEmail}>`,
    to: recipient,
    replyTo: transportConfig.replyTo,
    subject: `Your estimate ${input.estimateNumber} from ${companyConfig.shortName}`,
    text: buildEstimateEmailText(input, totalAmount, publicUrl),
    html: buildEstimateEmailHtml(input, totalAmount, publicUrl),
    attachments: [
      {
        filename: `${input.estimateNumber}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ],
  });

  return { success: true };
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "upload";
  const body = (await request.json().catch(() => ({}))) as Partial<InvoiceInput>;

  const input: InvoiceInput = {
    estimateNumber: cleanText(body.estimateNumber),
    estimateDate: cleanText(body.estimateDate),
    companyEmail: cleanText(body.companyEmail) || companyConfig.email,
    companyPhone: cleanText(body.companyPhone) || companyConfig.phoneDisplay,
    clientFirstName: cleanText(body.clientFirstName),
    clientLastName: cleanText(body.clientLastName),
    clientPhone: cleanText(body.clientPhone),
    clientEmail: cleanText(body.clientEmail),
    clientAddress: cleanText(body.clientAddress),
    items: Array.isArray(body.items) ? body.items : [],
    estimateAmount: cleanText(body.estimateAmount),
    notes: cleanText(body.notes),
    sendToEmail: cleanText(body.sendToEmail),
  };

  if (
    !input.estimateNumber ||
    !input.estimateDate ||
    !input.clientFirstName ||
    !input.clientLastName ||
    !input.clientPhone ||
    !input.clientEmail ||
    !input.clientAddress ||
    !input.estimateAmount
  ) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    const pdfBytes = await generatePdfBytes(input);

    if (mode === "download") {
      const pdfArrayBuffer = new ArrayBuffer(pdfBytes.length);
      new Uint8Array(pdfArrayBuffer).set(pdfBytes);

      return new Response(pdfArrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${input.estimateNumber}.pdf"`,
        },
      });
    }

    if (mode === "email") {
      const uploadResult = await uploadPdfToStorage(input, pdfBytes);
      const publicUrl = "error" in uploadResult ? undefined : uploadResult.publicUrl;
      const emailResult = await sendEstimateEmail(input, pdfBytes, publicUrl);

      if ("error" in emailResult) {
        return Response.json({ error: emailResult.error }, { status: emailResult.status });
      }

      return Response.json(
        {
          message: `Estimate sent to ${cleanText(input.sendToEmail) || input.clientEmail}.`,
          publicUrl,
        },
        { status: 200 },
      );
    }

    const uploadResult = await uploadPdfToStorage(input, pdfBytes);
    if ("error" in uploadResult) {
      return Response.json({ error: uploadResult.error }, { status: uploadResult.status });
    }

    return Response.json(uploadResult, { status: 201 });
  } catch (error) {
    console.error("Estimate PDF route failed.", error);
    return Response.json({ error: "Could not process the estimate request." }, { status: 500 });
  }
}

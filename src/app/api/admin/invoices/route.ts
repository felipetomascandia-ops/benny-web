import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";

import { companyConfig } from "@/lib/site-config";
import { getInvoicesBucketName, getSupabaseServerClient, hasSupabaseServerCredentials } from "@/lib/supabase";
import { resend, DEFAULT_FROM_EMAIL, DEFAULT_FROM_NAME } from "@/lib/resend";

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
  validUntil: string;
  companyEmail: string;
  companyPhone: string;
  clientFirstName: string;
  clientLastName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  estimateAmount: string;
  depositPercentage: string;
  preparedBy: string;
  acceptanceName: string;
  acceptanceDate: string;
  notes: string;
  terms: string;
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
const SAFE_BOTTOM = FOOTER_Y + 78;
const TABLE_COLUMNS = {
  descriptionX: MARGIN_X + 14,
  qtyX: 378,
  unitRightX: 494,
  totalRightX: 552,
};

const COLORS = {
  ink: rgb(0.07, 0.11, 0.18),
  muted: rgb(0.4, 0.46, 0.54),
  line: rgb(0.87, 0.9, 0.94),
  panel: rgb(0.97, 0.98, 1),
  accent: rgb(0.08, 0.45, 0.82),
  accentDark: rgb(0.03, 0.16, 0.31),
  white: rgb(1, 1, 1),
  slateSoft: rgb(0.95, 0.96, 0.98),
  successSoft: rgb(0.93, 0.98, 0.95),
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function safeNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampPercentage(value: string) {
  const parsed = safeNumber(value);
  return Math.min(100, Math.max(0, parsed));
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
    backgroundColor?: ReturnType<typeof rgb>;
  },
) {
  page.drawRectangle({
    x: options.x,
    y: options.y - options.height,
    width: options.width,
    height: options.height,
    color: options.backgroundColor || COLORS.white,
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
    y: PAGE_HEIGHT - 176,
    width: PAGE_WIDTH,
    height: 176,
    color: COLORS.accentDark,
  });

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 188,
    width: PAGE_WIDTH,
    height: 12,
    color: COLORS.accent,
  });

  page.drawText(companyConfig.name, {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 58,
    size: 22,
    font: fonts.bold,
    color: COLORS.white,
  });

  page.drawText("Luxury pool estimates with a premium presentation and clear approval terms", {
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
    const targetWidth = 128;
    const targetHeight = (logoImage.height / logoImage.width) * targetWidth;
    page.drawImage(logoImage, {
      x: PAGE_WIDTH - MARGIN_X - targetWidth,
      y: PAGE_HEIGHT - 86 - targetHeight / 2,
      width: targetWidth,
      height: targetHeight,
    });
  } else {
    drawRightAlignedText(page, companyConfig.shortName.toUpperCase(), PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 62, fonts.bold, 18, COLORS.white);
  }

  page.drawText("ESTIMATE", {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 206,
    size: 26,
    font: fonts.bold,
    color: COLORS.ink,
  });

  page.drawText("Prepared exclusively for the client listed below", {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 226,
    size: 10,
    font: fonts.regular,
    color: COLORS.muted,
  });

  page.drawRectangle({
    x: PAGE_WIDTH - 216,
    y: PAGE_HEIGHT - 264,
    width: 174,
    height: 78,
    color: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  page.drawText("ESTIMATED TOTAL", {
    x: PAGE_WIDTH - 198,
    y: PAGE_HEIGHT - 218,
    size: 8,
    font: fonts.bold,
    color: COLORS.accent,
  });

  drawRightAlignedText(page, formatMoney(totalAmount), PAGE_WIDTH - 58, PAGE_HEIGHT - 240, fonts.bold, 18, COLORS.ink);
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
    cursorY: PAGE_HEIGHT - 300,
  } satisfies PageContext;
}

function ensurePageSpace(
  context: PageContext,
  minimumHeight: number,
  pdfDoc: PDFDocument,
  fonts: PdfFonts,
  input: InvoiceInput,
  logoImage: PDFImage | null,
  totalAmount: number,
) {
  if (context.cursorY - minimumHeight >= SAFE_BOTTOM) {
    return context;
  }

  return createPage(pdfDoc, fonts, input, logoImage, totalAmount);
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

  drawRightAlignedText(context.page, "Unit Price", TABLE_COLUMNS.unitRightX, context.cursorY + 3, fonts.bold, 9, COLORS.white);
  drawRightAlignedText(context.page, "Amount", TABLE_COLUMNS.totalRightX, context.cursorY + 3, fonts.bold, 9, COLORS.white);

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
  const depositPercentage = clampPercentage(input.depositPercentage);
  const depositAmount = totalAmount * (depositPercentage / 100);
  const balanceAfterDeposit = totalAmount - depositAmount;
  const sanitizedItems = buildItems(input.items);

  let context = createPage(pdfDoc, fonts, input, logoImage, totalAmount);

  drawInfoCard(context.page, fonts, {
    x: MARGIN_X,
    y: context.cursorY,
    width: 250,
    height: 114,
    title: "Prepared For",
    lines: [formatClientName(input), input.clientAddress, input.clientEmail, input.clientPhone],
  });

  drawInfoCard(context.page, fonts, {
    x: 310,
    y: context.cursorY,
    width: PAGE_WIDTH - 310 - MARGIN_X,
    height: 114,
    title: "Estimate Details",
    lines: [
      `Estimate #: ${input.estimateNumber}`,
      `Date Issued: ${input.estimateDate}`,
      `Valid Until: ${input.validUntil}`,
      `Prepared By: ${input.preparedBy}`,
    ],
  });

  context.cursorY -= 148;

  drawSectionLabel(context.page, fonts, MARGIN_X, context.cursorY, "Project Scope");
  context.cursorY -= 18;
  drawTableHeader(context, fonts);

  const descriptionWidth = 248;

  sanitizedItems.forEach((item, index) => {
    const itemTotal = item.quantity * item.unitPrice;
    const descriptionLines = wrapText(item.description || "-", descriptionWidth, fonts.regular, 10);
    const rowHeight = Math.max(38, descriptionLines.length * 12 + 16);

    context = ensurePageSpace(context, rowHeight + 30, pdfDoc, fonts, input, logoImage, totalAmount);
    if (context.cursorY === PAGE_HEIGHT - 300) {
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
    drawRightAlignedText(context.page, formatMoney(item.unitPrice), TABLE_COLUMNS.unitRightX, context.cursorY - 12, fonts.regular, 10);
    drawRightAlignedText(context.page, formatMoney(itemTotal), TABLE_COLUMNS.totalRightX, context.cursorY - 12, fonts.bold, 10);

    context.cursorY -= rowHeight;
  });

  context.cursorY -= 24;
  context = ensurePageSpace(context, 200, pdfDoc, fonts, input, logoImage, totalAmount);

  const notesLines = wrapText(input.notes, 250, fonts.regular, 10);
  const termsLines = wrapText(input.terms, PAGE_WIDTH - MARGIN_X * 2 - 32, fonts.regular, 10);
  const notesHeight = Math.max(98, notesLines.length * 12 + 42);
  const paymentHeight = 132;

  drawInfoCard(context.page, fonts, {
    x: MARGIN_X,
    y: context.cursorY,
    width: 288,
    height: notesHeight,
    title: "Client Notes",
    lines: notesLines,
  });

  drawInfoCard(context.page, fonts, {
    x: 344,
    y: context.cursorY,
    width: PAGE_WIDTH - 344 - MARGIN_X,
    height: paymentHeight,
    title: "Deposit & Payment",
    lines: [
      `Estimated Total: ${formatMoney(totalAmount)}`,
      `Deposit Required: ${depositPercentage}%`,
      `Deposit Amount: ${formatMoney(depositAmount)}`,
      `Remaining Balance: ${formatMoney(balanceAfterDeposit)}`,
    ],
    backgroundColor: COLORS.successSoft,
  });

  context.cursorY -= Math.max(notesHeight, paymentHeight) + 22;
  context = ensurePageSpace(context, termsLines.length * 12 + 180, pdfDoc, fonts, input, logoImage, totalAmount);

  const termsHeight = Math.max(122, termsLines.length * 12 + 42);
  drawInfoCard(context.page, fonts, {
    x: MARGIN_X,
    y: context.cursorY,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: termsHeight,
    title: "Terms & Validity",
    lines: [
      `This estimate remains valid through ${input.validUntil}.`,
      ...termsLines,
    ],
  });

  context.cursorY -= termsHeight + 18;
  context = ensurePageSpace(context, 156, pdfDoc, fonts, input, logoImage, totalAmount);

  context.page.drawRectangle({
    x: MARGIN_X,
    y: context.cursorY - 124,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: 124,
    color: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  drawSectionLabel(context.page, fonts, MARGIN_X + 16, context.cursorY - 18, "Acceptance");

  context.page.drawText("Client acceptance authorizes USA Pools Services LLC to proceed under this estimate and schedule work according to the agreed scope.", {
    x: MARGIN_X + 16,
    y: context.cursorY - 38,
    size: 10,
    font: fonts.regular,
    color: COLORS.muted,
  });

  context.page.drawLine({
    start: { x: MARGIN_X + 16, y: context.cursorY - 78 },
    end: { x: MARGIN_X + 220, y: context.cursorY - 78 },
    thickness: 1,
    color: COLORS.line,
  });
  context.page.drawText(cleanText(input.acceptanceName) || "Client Signature / Printed Name", {
    x: MARGIN_X + 16,
    y: context.cursorY - 92,
    size: 9,
    font: fonts.regular,
    color: COLORS.muted,
  });

  context.page.drawLine({
    start: { x: MARGIN_X + 284, y: context.cursorY - 78 },
    end: { x: MARGIN_X + 430, y: context.cursorY - 78 },
    thickness: 1,
    color: COLORS.line,
  });
  context.page.drawText(cleanText(input.acceptanceDate) || "Acceptance Date", {
    x: MARGIN_X + 284,
    y: context.cursorY - 92,
    size: 9,
    font: fonts.regular,
    color: COLORS.muted,
  });

  context.page.drawText(`Prepared by: ${input.preparedBy}`, {
    x: MARGIN_X + 16,
    y: context.cursorY - 110,
    size: 9,
    font: fonts.bold,
    color: COLORS.ink,
  });

  context.page.drawText("This estimate may be refined after final measurements or an on-site evaluation.", {
    x: MARGIN_X,
    y: FOOTER_Y + 32,
    size: 8,
    font: fonts.regular,
    color: COLORS.muted,
  });

  return pdfDoc.save();
}

function buildEstimateEmailHtml(input: InvoiceInput, totalAmount: number, depositAmount: number, publicUrl?: string) {
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
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.86;">Premium Estimate</div>
          <div style="font-size:28px;font-weight:700;margin-top:8px;">${companyConfig.name}</div>
          <div style="font-size:14px;opacity:0.9;margin-top:6px;">Custom pool construction, remodeling, and premium maintenance.</div>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 14px;font-size:15px;">Hello ${clientName},</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#334155;">
            Your estimate <strong>${input.estimateNumber}</strong> is ready. We attached the PDF for review and approval.
          </p>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:26px;">
            <div style="flex:1;min-width:200px;background:#f8fbff;border:1px solid #dbeafe;border-radius:18px;padding:18px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#2563eb;font-weight:700;">Date Issued</div>
              <div style="font-size:16px;font-weight:700;margin-top:6px;">${input.estimateDate}</div>
            </div>
            <div style="flex:1;min-width:200px;background:#f8fbff;border:1px solid #dbeafe;border-radius:18px;padding:18px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#2563eb;font-weight:700;">Valid Until</div>
              <div style="font-size:16px;font-weight:700;margin-top:6px;">${input.validUntil}</div>
            </div>
            <div style="flex:1;min-width:200px;background:#f2fbf6;border:1px solid #cdebd9;border-radius:18px;padding:18px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#15803d;font-weight:700;">Deposit Required</div>
              <div style="font-size:16px;font-weight:700;margin-top:6px;">${formatMoney(depositAmount)}</div>
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
          <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155;">
            Estimated total: <strong>${formatMoney(totalAmount)}</strong><br />
            Prepared by: <strong>${input.preparedBy}</strong>
          </p>
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

function buildEstimateEmailText(input: InvoiceInput, totalAmount: number, depositAmount: number, publicUrl?: string) {
  return [
    `Hello ${formatClientName(input)},`,
    "",
    `Your estimate ${input.estimateNumber} is ready.`,
    `Date issued: ${input.estimateDate}`,
    `Valid until: ${input.validUntil}`,
    `Estimated total: ${formatMoney(totalAmount)}`,
    `Deposit required: ${formatMoney(depositAmount)}`,
    "",
    publicUrl ? `Hosted PDF link: ${publicUrl}` : "The PDF is attached to this email.",
    "",
    `Prepared by: ${input.preparedBy}`,
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
  const recipient = cleanText(input.sendToEmail) || cleanText(input.clientEmail);
  if (!recipient) {
    return { error: "A destination email is required.", status: 400 };
  }

  const totalAmount = safeNumber(input.estimateAmount);
  const depositAmount = totalAmount * (clampPercentage(input.depositPercentage) / 100);

  const { data, error: sendError } = await resend.emails.send({
    from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
    to: [recipient],
    replyTo: companyConfig.email,
    subject: `Your estimate ${input.estimateNumber} from ${companyConfig.shortName}`,
    text: buildEstimateEmailText(input, totalAmount, depositAmount, publicUrl),
    html: buildEstimateEmailHtml(input, totalAmount, depositAmount, publicUrl),
    attachments: [
      {
        filename: `${input.estimateNumber}.pdf`,
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
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "upload";
  const body = (await request.json().catch(() => ({}))) as Partial<InvoiceInput>;

  const input: InvoiceInput = {
    estimateNumber: cleanText(body.estimateNumber),
    estimateDate: cleanText(body.estimateDate),
    validUntil: cleanText(body.validUntil),
    companyEmail: cleanText(body.companyEmail) || companyConfig.email,
    companyPhone: cleanText(body.companyPhone) || companyConfig.phoneDisplay,
    clientFirstName: cleanText(body.clientFirstName),
    clientLastName: cleanText(body.clientLastName),
    clientPhone: cleanText(body.clientPhone),
    clientEmail: cleanText(body.clientEmail),
    clientAddress: cleanText(body.clientAddress),
    items: Array.isArray(body.items) ? body.items : [],
    estimateAmount: cleanText(body.estimateAmount),
    depositPercentage: cleanText(body.depositPercentage) || "30",
    preparedBy: cleanText(body.preparedBy) || `${companyConfig.shortName} Sales Team`,
    acceptanceName: cleanText(body.acceptanceName),
    acceptanceDate: cleanText(body.acceptanceDate),
    notes: cleanText(body.notes),
    terms:
      cleanText(body.terms) ||
      "Work scheduling begins after estimate approval and receipt of the required deposit. Final material selections, access conditions, and site findings may adjust final scope or pricing.",
    sendToEmail: cleanText(body.sendToEmail),
  };

  if (
    !input.estimateNumber ||
    !input.estimateDate ||
    !input.validUntil ||
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
          "Content-Disposition": `inline; filename="${input.estimateNumber}.pdf"`,
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

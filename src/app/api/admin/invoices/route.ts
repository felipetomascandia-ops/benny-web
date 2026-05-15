import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function safeNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function generatePdfBytes(input: InvoiceInput, request: Request) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 50;
  let cursorY = 740;

  // Header Background (Professional look)
  page.drawRectangle({
    x: 0,
    y: 700,
    width: 612,
    height: 92,
    color: rgb(0.96, 0.98, 1.0),
  });

  // Company Info (Left aligned)
  page.drawText(companyConfig.name, {
    x: marginX,
    y: cursorY,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  cursorY -= 18;

  const companyDetails = [
    cleanText(input.companyEmail),
    cleanText(input.companyPhone),
    companyConfig.serviceArea
  ].filter(Boolean);

  for (const detail of companyDetails) {
    page.drawText(detail, {
      x: marginX,
      y: cursorY,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });
    cursorY -= 12;
  }

  // Logo (Right aligned)
  try {
    const logoUrl = "https://www.image2url.com/r2/default/images/1778803824178-e306ad2f-f557-4331-8968-558b2100e31c.png";
    const logoResponse = await fetch(logoUrl);
    
    if (logoResponse.ok) {
      const logoArrayBuffer = await logoResponse.arrayBuffer();
      const logoBuffer = Buffer.from(logoArrayBuffer);
      
      // Try to embed as PNG first, then fallback to JPG
      let embedded;
      try {
        embedded = await pdfDoc.embedPng(logoBuffer);
      } catch (pngError) {
        console.warn("Not a valid PNG, trying JPG...");
        embedded = await pdfDoc.embedJpg(logoBuffer);
      }

      const logoWidth = 140;
      const logoHeight = (embedded.height / embedded.width) * logoWidth;
      
      page.drawImage(embedded, {
        x: 612 - marginX - logoWidth,
        y: 785 - logoHeight, 
        width: logoWidth,
        height: logoHeight,
      });
    } else {
      throw new Error("Failed to fetch logo from external URL");
    }
  } catch (e) {
    console.error("CRITICAL: Failed to embed logo in PDF from URL. Error:", e);
    // Fallback text
    page.drawText("USA POOLS SERVICES LLC", {
      x: 400,
      y: 760,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.4, 0.8),
    });
    
    page.drawText("Professional Pool Solutions", {
      x: 400,
      y: 748,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  cursorY = 660;

  // Estimate Title
  page.drawText("ESTIMATE", {
    x: marginX,
    y: cursorY,
    size: 24,
    font: fontBold,
    color: rgb(0.1, 0.4, 0.8),
  });

  // Estimate Info
  const estInfoY = cursorY;
  page.drawText("Estimate #:", { x: 400, y: estInfoY, size: 10, font: fontBold });
  page.drawText(cleanText(input.estimateNumber), { x: 470, y: estInfoY, size: 10, font: fontRegular });
  
  page.drawText("Date:", { x: 400, y: estInfoY - 15, size: 10, font: fontBold });
  page.drawText(cleanText(input.estimateDate), { x: 470, y: estInfoY - 15, size: 10, font: fontRegular });

  cursorY -= 60;

  // Bill To Section
  page.drawText("BILL TO", {
    x: marginX,
    y: cursorY,
    size: 9,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.5),
  });
  cursorY -= 18;

  const clientName = `${cleanText(input.clientFirstName)} ${cleanText(input.clientLastName)}`.trim();
  page.drawText(clientName, { x: marginX, y: cursorY, size: 11, font: fontBold });
  cursorY -= 14;

  const clientLines = [
    cleanText(input.clientAddress),
    cleanText(input.clientEmail),
    cleanText(input.clientPhone),
  ].filter(Boolean);

  for (const line of clientLines) {
    page.drawText(line, {
      x: marginX,
      y: cursorY,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    cursorY -= 14;
  }

  cursorY -= 30;

  // Table Header
  page.drawRectangle({
    x: marginX,
    y: cursorY - 5,
    width: 612 - (marginX * 2),
    height: 25,
    color: rgb(0.1, 0.4, 0.8),
  });

  const tableHeaders = ["Description", "Qty", "Unit Price", "Total"];
  const colX = [marginX + 10, 400, 460, 530];

  page.drawText("Description", { x: colX[0], y: cursorY + 7, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Qty", { x: colX[1], y: cursorY + 7, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Price", { x: colX[2], y: cursorY + 7, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Total", { x: colX[3], y: cursorY + 7, size: 9, font: fontBold, color: rgb(1, 1, 1) });

  cursorY -= 25;

  // Table Items
  for (const item of input.items) {
    const itemTotal = item.quantity * item.unitPrice;
    
    // Description (with wrapping)
    const desc = cleanText(item.description) || "-";
    const descWidth = 330;
    const descLines: string[] = [];
    let current = "";
    for (const word of desc.split(" ")) {
      const test = current ? `${current} ${word}` : word;
      if (fontRegular.widthOfTextAtSize(test, 9) > descWidth) {
        descLines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    descLines.push(current);

    const rowHeight = Math.max(20, descLines.length * 12);
    
    // Check if we need a new page (simplified)
    if (cursorY < 100) break; 

    let lineY = cursorY - 12;
    for (const line of descLines) {
      page.drawText(line, { x: colX[0], y: lineY, size: 9, font: fontRegular });
      lineY -= 12;
    }

    page.drawText(item.quantity.toString(), { x: colX[1], y: cursorY - 12, size: 9, font: fontRegular });
    page.drawText(`$${item.unitPrice.toLocaleString()}`, { x: colX[2], y: cursorY - 12, size: 9, font: fontRegular });
    page.drawText(`$${itemTotal.toLocaleString()}`, { x: colX[3], y: cursorY - 12, size: 9, font: fontBold });

    // Row Line
    page.drawLine({
      start: { x: marginX, y: cursorY - rowHeight },
      end: { x: 612 - marginX, y: cursorY - rowHeight },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });

    cursorY -= rowHeight;
  }

  // Totals Section
  cursorY -= 40;
  const totalAmount = safeNumber(input.estimateAmount);
  
  page.drawText("SUBTOTAL", { x: 400, y: cursorY, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(`$${totalAmount.toLocaleString()}`, { x: 530, y: cursorY, size: 9, font: fontRegular });
  
  cursorY -= 20;
  page.drawRectangle({
    x: 390,
    y: cursorY - 10,
    width: 172,
    height: 30,
    color: rgb(0.95, 0.97, 1.0),
  });
  
  page.drawText("TOTAL", { x: 400, y: cursorY, size: 11, font: fontBold, color: rgb(0.1, 0.4, 0.8) });
  page.drawText(`$${totalAmount.toLocaleString()}`, { x: 500, y: cursorY, size: 14, font: fontBold, color: rgb(0.1, 0.4, 0.8) });

  // Notes
  if (input.notes) {
    cursorY -= 80;
    page.drawText("NOTES", { x: marginX, y: cursorY, size: 9, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
    cursorY -= 15;
    
    const notes = cleanText(input.notes);
    const noteLines: string[] = [];
    let currentNote = "";
    for (const word of notes.split(" ")) {
      const test = currentNote ? `${currentNote} ${word}` : word;
      if (fontRegular.widthOfTextAtSize(test, 9) > 500) {
        noteLines.push(currentNote);
        currentNote = word;
      } else {
        currentNote = test;
      }
    }
    noteLines.push(currentNote);

    for (const line of noteLines.slice(0, 5)) {
      page.drawText(line, { x: marginX, y: cursorY, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      cursorY -= 12;
    }
  }

  // Footer
  page.drawText(`Thank you for choosing ${companyConfig.name}!`, {
    x: marginX,
    y: 60,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.4, 0.8),
  });
  
  page.drawText(`USA Pools Services LLC • Pennsylvania • www.usapoolsservices.com`, {
    x: marginX,
    y: 45,
    size: 8,
    font: fontRegular,
    color: rgb(0.6, 0.6, 0.6),
  });

  return pdfDoc.save();
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

  const pdfBytes = await generatePdfBytes(input, request);

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

  if (!hasSupabaseServerCredentials()) {
    return Response.json(
      {
        error:
          "Supabase is not configured. To upload PDFs, set server-side Supabase credentials and create a public Storage bucket for invoices.",
      },
      { status: 503 },
    );
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return Response.json({ error: "Supabase is unavailable." }, { status: 503 });
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
    return Response.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "PDF upload failed. Verify your Supabase bucket configuration."
            : uploadError.message,
      },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return Response.json({ publicUrl, storagePath }, { status: 201 });
}

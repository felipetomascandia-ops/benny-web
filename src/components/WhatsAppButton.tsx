"use client";

import { MessageCircleMore } from "lucide-react";

import { buildWhatsAppUrl, companyConfig } from "@/lib/site-config";

export default function WhatsAppButton() {
  const whatsappUrl = buildWhatsAppUrl(
    "Hello! I am interested in your pool services in Pennsylvania.",
  );

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(37,211,102,0.35)] transition hover:scale-[1.03] hover:bg-[#1ebe5b] md:bottom-8 md:right-8"
      aria-label="Contact on WhatsApp"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
        <MessageCircleMore className="h-6 w-6" />
      </span>
      <span className="hidden pr-1 sm:block">
        <span className="block text-[11px] uppercase tracking-[0.24em] text-white/80">
          WhatsApp
        </span>
        <span className="block text-sm font-semibold">{companyConfig.phoneDisplay}</span>
      </span>
    </a>
  );
}

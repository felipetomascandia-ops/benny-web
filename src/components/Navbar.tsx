"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

import { companyConfig } from "@/lib/site-config";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#services" },
    { name: "Reviews", href: "#reviews" },
    { name: "Book a Visit", href: "#booking" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50">
      <div className="container-shell pt-4">
        <div className="glass-panel flex min-h-[76px] items-center justify-between rounded-full px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="overflow-hidden rounded-2xl bg-white p-1 shadow-[0_10px_24px_rgba(255,255,255,0.1)]">
                <Image
                  src={companyConfig.logoPath}
                  alt={companyConfig.name}
                  width={78}
                  height={52}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-slate-300">
                  Pennsylvania
                </p>
                <span className="text-sm font-semibold text-white md:text-base">
                  USA Pools Services LLC
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-200 transition hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/14"
            >
              <Phone className="h-4 w-4 text-sky-300" />
              {companyConfig.phoneDisplay}
            </a>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
              aria-label="Open menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="container-shell md:hidden">
          <div className="glass-panel mt-3 rounded-[28px] px-4 py-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-2xl px-3 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/8"
              >
                {link.name}
              </Link>
            ))}
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Request a quote
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

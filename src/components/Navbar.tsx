"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";

import { companyConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#services" },
    { name: "Reviews", href: "#reviews" },
    { name: "Book a Visit", href: "#booking" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 transition-all duration-300">
      <div className="container-shell pt-4">
        <div className={cn(
          "flex min-h-[76px] items-center justify-between rounded-full px-5 md:px-8 transition-all duration-300 border",
          isScrolled 
            ? "bg-slate-900/95 backdrop-blur-md border-slate-800 shadow-2xl py-2" 
            : "bg-white/10 backdrop-blur-sm border-white/20 py-3"
        )}>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className={cn(
                "overflow-hidden rounded-2xl p-1 shadow-lg transition-all duration-300 bg-white"
              )}>
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
                <p className={cn(
                  "text-[11px] uppercase tracking-[0.35em] transition-colors",
                  isScrolled ? "text-slate-400" : "text-slate-200"
                )}>
                  Pennsylvania
                </p>
                <span className="text-sm font-semibold md:text-base text-white">
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
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-400 text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#contact"
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                isScrolled 
                  ? "border-slate-700 bg-slate-800 text-white hover:bg-slate-700" 
                  : "border-white/15 bg-white/8 text-white hover:bg-white/14"
              )}
            >
              <Phone className={cn("h-4 w-4", isScrolled ? "text-blue-400" : "text-sky-300")} />
              {companyConfig.phoneDisplay}
            </a>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 border-white/15 bg-white/10 text-white"
              )}
              aria-label="Open menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="container-shell md:hidden">
          <div className={cn(
            "mt-3 rounded-[28px] px-4 py-5 border shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-2",
            isScrolled 
              ? "bg-white border-slate-200" 
              : "bg-slate-900/90 backdrop-blur-xl border-white/10"
          )}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                  isScrolled 
                    ? "text-slate-700 hover:bg-slate-50" 
                    : "text-slate-100 hover:bg-white/8"
                )}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              Request a quote
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

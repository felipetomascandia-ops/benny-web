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
    <nav className="fixed inset-x-0 top-0 z-50 transition-all duration-500">
      <div className="container-shell pt-6">
        <div className={cn(
          "flex min-h-[80px] items-center justify-between rounded-full px-6 md:px-10 transition-all duration-500 border",
          isScrolled 
            ? "bg-white/90 backdrop-blur-lg border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-2" 
            : "bg-transparent border-transparent py-4"
        )}>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-4 group">
              <div className={cn(
                "overflow-hidden rounded-2xl p-1.5 transition-all duration-500 shadow-sm",
                isScrolled ? "bg-slate-900" : "bg-white"
              )}>
                <Image
                  src={companyConfig.logoPath}
                  alt={companyConfig.name}
                  width={80}
                  height={55}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.4em] transition-colors duration-500",
                  isScrolled ? "text-blue-600" : "text-blue-400"
                )}>
                  Pennsylvania
                </p>
                <span className={cn(
                  "text-base font-bold tracking-tight transition-colors duration-500",
                  isScrolled ? "text-slate-900" : "text-white"
                )}>
                  USA Pools Services LLC
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-105",
                  isScrolled ? "text-slate-600 hover:text-blue-600" : "text-white/80 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <a
              href="#contact"
              className={cn(
                "inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition-all duration-500 shadow-sm",
                isScrolled 
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200" 
                  : "bg-white text-slate-900 hover:bg-blue-50"
              )}
            >
              <Phone className="h-4 w-4" />
              {companyConfig.phoneDisplay}
            </a>
          </div>

          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500",
                isScrolled 
                  ? "border-slate-200 bg-white text-slate-900" 
                  : "border-white/20 bg-white/10 text-white backdrop-blur-md"
              )}
              aria-label="Open menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="container-shell lg:hidden">
          <div className={cn(
            "mt-4 rounded-[32px] px-6 py-8 border shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95",
            isScrolled 
              ? "bg-white border-slate-100" 
              : "bg-slate-900/95 backdrop-blur-2xl border-white/10"
          )}>
            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block rounded-2xl px-4 py-4 text-base font-bold transition-all",
                    isScrolled 
                      ? "text-slate-900 hover:bg-slate-50" 
                      : "text-white hover:bg-white/10"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-100/10">
                <a
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-4 text-base font-bold text-white transition-all hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                >
                  Request a Free Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

import Image from "next/image";
import { ArrowUpRight, Globe2, Mail, MessageCircle, Phone, Waves } from "lucide-react";
import Link from "next/link";

import { buildWhatsAppUrl, companyConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="bg-slate-950 py-16 text-white">
      <div className="container-shell">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.65fr_0.65fr]">
          <div>
            <Link href="/" className="mb-6 flex items-center gap-3">
              <div className="overflow-hidden rounded-2xl bg-white p-1 shadow-[0_10px_24px_rgba(255,255,255,0.08)]">
                <Image
                  src={companyConfig.logoPath}
                  alt={companyConfig.name}
                  width={88}
                  height={58}
                  className="h-11 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  {companyConfig.name}
                </p>
                <p className="text-lg font-semibold text-white">
                  Premium Pool Construction In Pennsylvania
                </p>
              </div>
            </Link>
            <p className="max-w-xl text-sm leading-7 text-slate-400 md:text-base">
              The footer now looks more premium and intentional, with cleaner
              spacing, stronger calls to action, and clear paths to contact your
              company across channels.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppUrl("Hello USA Pools Services LLC, I want a quote.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                WhatsApp
              </a>
              <a
                href={`mailto:${companyConfig.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
              >
                <Mail className="h-4 w-4 text-sky-300" />
                Email
              </a>
              <a
                href={`tel:${companyConfig.phoneDigits}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
              >
                <Phone className="h-4 w-4 text-sky-300" />
                Call Us
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              Navigation
            </h4>
            <ul className="space-y-4 text-sm text-slate-300">
              <li><Link href="#" className="transition hover:text-white">Home</Link></li>
              <li><Link href="#services" className="transition hover:text-white">Services</Link></li>
              <li><Link href="#reviews" className="transition hover:text-white">Reviews</Link></li>
              <li><Link href="#contact" className="transition hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              Social links
            </h4>
            <div className="space-y-3">
              <a
                href={companyConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
              >
                <span className="inline-flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-sky-300" />
                  Instagram
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </a>
              <a
                href={companyConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
              >
                <span className="inline-flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-sky-300" />
                  Facebook
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} USA Pools Services LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

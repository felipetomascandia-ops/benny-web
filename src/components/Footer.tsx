import Image from "next/image";
import { Globe2, Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import Link from "next/link";

import { companyConfig } from "@/lib/site-config";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-24 pb-12 text-slate-900">
      <div className="container-shell">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr]">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100 transition-transform group-hover:scale-105 duration-500">
                <Image
                  src={companyConfig.logoPath}
                  alt={companyConfig.name}
                  width={88}
                  height={58}
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
                  Pennsylvania
                </p>
                <p className="text-xl font-bold tracking-tight text-slate-900">
                  USA Pools Services LLC
                </p>
              </div>
            </Link>
            
            <p className="max-w-sm text-base leading-relaxed text-slate-500">
              Crafting luxury outdoor experiences across Pennsylvania with premium construction, 
              innovative design, and dedicated maintenance programs.
            </p>

            <div className="flex gap-4">
              <a
                href={companyConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <Globe2 className="w-5 h-5" />
              </a>
              <a
                href={companyConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Navigation
            </h4>
            <ul className="space-y-4">
              {["Home", "Portfolio", "Services", "Reviews", "Contact"].map((item) => (
                <li key={item}>
                  <Link 
                    href={item === "Home" ? "#" : `#${item.toLowerCase()}`} 
                    className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Contact
            </h4>
            <ul className="space-y-6">
              <li>
                <a href={`tel:${companyConfig.phoneDigits}`} className="group flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Call us</p>
                    <p className="text-sm font-bold text-slate-700">{companyConfig.phoneDisplay}</p>
                  </div>
                </a>
              </li>
              <li>
                <a href={`mailto:${companyConfig.email}`} className="group flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Email</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{companyConfig.email}</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Service Area
            </h4>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">{companyConfig.serviceArea}</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Available for custom projects and premium maintenance across the state.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © {currentYear} {companyConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

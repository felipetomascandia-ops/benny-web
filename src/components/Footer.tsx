import Image from "next/image";
import { Globe2, Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import Link from "next/link";

import { companyConfig } from "@/lib/site-config";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border pt-24 pb-12 text-foreground">
      <div className="container-shell">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr]">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#0f172a] p-1.5 shadow-xl border border-slate-100 dark:border-white/10 transition-transform group-hover:scale-105 duration-500">
                <Image
                  src={companyConfig.logoPath}
                  alt={companyConfig.name}
                  width={88}
                  height={58}
                  className="h-12 w-auto object-contain dark:brightness-200 dark:contrast-125 dark:mix-blend-lighten"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500">
                  Pennsylvania
                </p>
                <p className="text-xl font-bold tracking-tight text-foreground">
                  USA Pools Services LLC
                </p>
              </div>
            </Link>
            
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              Crafting luxury outdoor experiences across Pennsylvania with premium construction, 
              innovative design, and dedicated maintenance programs.
            </p>

            <div className="flex gap-4">
              <a
                href={companyConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300"
              >
                <Globe2 className="w-5 h-5" />
              </a>
              <a
                href={companyConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Navigation
            </h4>
            <ul className="space-y-4">
              {["Home", "Portfolio", "Services", "Reviews", "Contact"].map((item) => (
                <li key={item}>
                  <Link 
                    href={item === "Home" ? "#" : `#${item.toLowerCase()}`} 
                    className="text-sm font-semibold text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Contact
            </h4>
            <ul className="space-y-6">
              <li>
                <a href={`tel:${companyConfig.phoneDigits}`} className="group flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-0.5">Call us</p>
                    <p className="text-sm font-bold text-foreground">{companyConfig.phoneDisplay}</p>
                  </div>
                </a>
              </li>
              <li>
                <a href={`mailto:${companyConfig.email}`} className="group flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-0.5">Email</p>
                    <p className="text-sm font-bold text-foreground truncate">{companyConfig.email}</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Service Area
            </h4>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{companyConfig.serviceArea}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Available for custom projects and premium maintenance across the state.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            © {currentYear} {companyConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/admin" className="text-xs font-bold text-muted-foreground hover:text-blue-500 uppercase tracking-widest transition-colors">
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

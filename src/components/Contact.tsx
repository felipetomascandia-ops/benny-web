"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import BookingScheduler from "@/components/BookingScheduler";
import { buildContactWhatsAppMessage, buildWhatsAppUrl, companyConfig } from "@/lib/site-config";

export default function Contact() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    projectDetails: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  function updateField(name: keyof typeof formData, value: string) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = buildContactWhatsAppMessage(formData);
    const whatsappUrl = buildWhatsAppUrl(message);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setFeedback("WhatsApp opened with a ready-to-send message.");
  }

  return (
    <section id="contact" className="bg-transparent py-24">
      <div className="container-shell">
        <div className="bg-card overflow-hidden rounded-[48px] border border-border shadow-2xl">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-muted/30 p-8 text-foreground md:p-12 border-r border-border">
              <p className="text-sm font-bold uppercase tracking-[0.32em] text-blue-500">
                Contact us
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Ready to transform your lifestyle?
              </h2>
              <p className="mt-6 text-base leading-7 text-muted-foreground md:text-lg">
                Let's discuss your project and bring your dream pool to life. We are here to help you with every detail.
              </p>

              <div className="mt-10 grid gap-4">
                <a
                  href={buildWhatsAppUrl("Hello USA Pools Services LLC, I want a quote.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-[28px] border border-border bg-card px-6 py-5 transition hover:bg-muted/50 group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366] group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">Direct response line</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </a>

                <div className="grid gap-4 sm:grid-cols-2">
                  <a
                    href={`tel:${companyConfig.phoneDigits}`}
                    className="rounded-[28px] border border-border bg-card px-6 py-6 transition hover:bg-muted/50 group shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                      <Phone className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-foreground uppercase tracking-widest">Phone</p>
                    <p className="mt-1 text-sm text-muted-foreground">{companyConfig.phoneDisplay}</p>
                  </a>
                  <a
                    href={`mailto:${companyConfig.email}`}
                    className="rounded-[28px] border border-border bg-card px-6 py-6 transition hover:bg-muted/50 group shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-foreground uppercase tracking-widest">Email</p>
                    <p className="mt-1 text-sm text-muted-foreground truncate">{companyConfig.email}</p>
                  </a>
                </div>

                <div className="rounded-[28px] border border-border bg-card px-6 py-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-4">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-foreground uppercase tracking-widest">Service area</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {companyConfig.serviceArea}. Premium pool solutions for luxury homeowners.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  <a
                    href={companyConfig.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground uppercase tracking-widest transition hover:bg-muted/50 shadow-sm"
                  >
                    Instagram
                  </a>
                  <a
                    href={companyConfig.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground uppercase tracking-widest transition hover:bg-muted/50 shadow-sm"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-10">
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-500">
                  Request a quote
                </p>
                <h3 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                  Tell us about your project
                </h3>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">First name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(event) => updateField("firstName", event.target.value)}
                      required
                      className="w-full bg-muted/20 border border-border rounded-2xl px-5 py-4 text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(event) => updateField("lastName", event.target.value)}
                      required
                      className="w-full bg-muted/20 border border-border rounded-2xl px-5 py-4 text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      required
                      className="w-full bg-muted/20 border border-border rounded-2xl px-5 py-4 text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="+1 (267) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      required
                      className="w-full bg-muted/20 border border-border rounded-2xl px-5 py-4 text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Project details</label>
                  <textarea
                    rows={4}
                    value={formData.projectDetails}
                    onChange={(event) => updateField("projectDetails", event.target.value)}
                    required
                    className="w-full bg-muted/20 border border-border rounded-2xl px-5 py-4 text-foreground outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    placeholder="Tell us about your pool project..."
                  />
                </div>
                {feedback && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-sm font-bold text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5" />
                    {feedback}
                  </div>
                )}
                <button
                  type="submit"
                  className="water-button w-full h-14"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Send Quote Request
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <BookingScheduler />
        </div>
      </div>
    </section>
  );
}

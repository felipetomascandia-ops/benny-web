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
    <section id="contact" className="bg-[#f4f8fc] py-24">
      <div className="container-shell">
        <div className="soft-card overflow-hidden">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-slate-950 p-8 text-white md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-300">
                Contact us
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                A more premium contact section that helps convert.
              </h2>
              <p className="mt-6 text-base leading-7 text-slate-300 md:text-lg">
                I reorganized this area so it feels more trustworthy and direct,
                with clear action buttons for WhatsApp, calls, social media, and
                the contact form.
              </p>

              <div className="mt-8 grid gap-4">
                <a
                  href={buildWhatsAppUrl("Hello USA Pools Services LLC, I want a quote.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/7 px-5 py-4 transition hover:bg-white/12"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/20 text-[#25D366]">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">WhatsApp</p>
                      <p className="text-sm text-slate-300">Immediate response channel</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-sky-300" />
                </a>

                <div className="grid gap-4 sm:grid-cols-2">
                  <a
                    href={`tel:${companyConfig.phoneDigits}`}
                    className="rounded-[24px] border border-white/10 bg-white/7 px-5 py-5 transition hover:bg-white/12"
                  >
                    <Phone className="h-5 w-5 text-sky-300" />
                    <p className="mt-4 text-sm font-semibold text-white">Phone</p>
                    <p className="mt-1 text-sm text-slate-300">{companyConfig.phoneDisplay}</p>
                  </a>
                  <a
                    href={`mailto:${companyConfig.email}`}
                    className="rounded-[24px] border border-white/10 bg-white/7 px-5 py-5 transition hover:bg-white/12"
                  >
                    <Mail className="h-5 w-5 text-sky-300" />
                    <p className="mt-4 text-sm font-semibold text-white">Email</p>
                    <p className="mt-1 text-sm text-slate-300">{companyConfig.email}</p>
                  </a>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/7 px-5 py-5">
                  <MapPin className="h-5 w-5 text-sky-300" />
                  <p className="mt-4 text-sm font-semibold text-white">Service area</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {companyConfig.serviceArea}. Serving homeowners looking for construction,
                    remodeling, cleaning and pool repair services.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={companyConfig.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
                  >
                    <Globe2 className="h-4 w-4 text-sky-300" />
                    Instagram
                  </a>
                  <a
                    href={companyConfig.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
                  >
                    <Globe2 className="h-4 w-4 text-sky-300" />
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-10">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
                  Request a quote
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Tell us about your project
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  This form now matches the rest of the site visually and feels
                  much more aligned with a professional contractor brand.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">First name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(event) => updateField("firstName", event.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Last name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(event) => updateField("lastName", event.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                    />
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Project details</label>
                  <textarea
                    rows={5}
                    value={formData.projectDetails}
                    onChange={(event) => updateField("projectDetails", event.target.value)}
                    required
                    className="w-full rounded-[24px] border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                    placeholder="Tell us if you need a new pool, remodel, repair, cleaning service, or a full backyard transformation."
                  />
                </div>
                {feedback && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                    {feedback}
                  </div>
                )}
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Send className="h-4 w-4" />
                  Send request
                </button>
              </form>

              <BookingScheduler />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Droplets, Hammer, ShieldCheck, Sparkles, Wrench } from "lucide-react";

const services = [
  {
    title: "Custom Pool Construction",
    description:
      "From concept to final detailing, we build elegant pools designed around your home and lifestyle.",
    icon: Sparkles,
  },
  {
    title: "Maintenance Programs",
    description:
      "Scheduled cleanings, water balancing, and equipment supervision to keep everything pristine.",
    icon: Droplets,
  },
  {
    title: "Renovations And Upgrades",
    description:
      "Tile, coping, plaster, lighting, and surface improvements that modernize older pools beautifully.",
    icon: Wrench,
  },
  {
    title: "Repairs And Protection",
    description:
      "Diagnostics, safety checks, and proactive service to protect your investment year-round.",
    icon: ShieldCheck,
  },
];

const process = [
  "Consultation and design planning",
  "Clear proposal with scope and timing",
  "Construction or upgrade execution",
  "Final walkthrough and ongoing support",
];

export default function Services() {
  return (
    <section id="services" className="bg-transparent py-24 text-slate-900">
      <div className="container-shell">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-blue-600">
              Professional services
            </p>
            <h2 className="section-heading !text-slate-900">
              A more refined pool experience from start to finish.
            </h2>
            <p className="section-copy mt-6 max-w-xl !text-slate-600">
              The site now communicates quality through layout, spacing,
              contrast, and trust elements. These services are presented in a
              cleaner, higher-end format to help convert visitors better.
            </p>

            <div className="bg-white border border-slate-100 shadow-sm mt-10 p-8 rounded-[32px]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Hammer className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Our process
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    Built to feel organized, premium, and reliable
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {process.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-4"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      0{index + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-700 md:text-base">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="bg-white border border-slate-100 group p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl rounded-[32px] shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

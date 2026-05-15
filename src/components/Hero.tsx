"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, PhoneCall, Star } from "lucide-react";

const trustPoints = [
  "Custom pools and remodels built for Pennsylvania homes",
  "Fast response for estimates, repairs, and premium maintenance",
  "Design, construction, and finishing with one professional team",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 text-white md:pb-24 md:pt-40">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://www.image2url.com/r2/default/images/1778803824178-e306ad2f-f557-4331-8968-558b2100e31c.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#08111f]/60 via-[#0b1730]/40 to-[#0b1730]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,17,31,0.4)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0b1730] to-transparent" />

      <div className="container-shell relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur"
            >
              <Star className="h-4 w-4 fill-sky-300 text-sky-300" />
              Luxury pool construction and outdoor upgrades in Pennsylvania
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
            >
              Premium pool design that makes your property feel like a resort.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-xl"
            >
              USA Pools Services LLC creates sophisticated residential pools,
              remodels, and maintenance programs with a polished process,
              fast communication, and craftsmanship you can trust.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <a
                href="#booking"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-7 py-4 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(14,165,233,0.35)] transition hover:bg-sky-400"
              >
                Book a site visit
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#reviews"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                View client reviews
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-10 grid gap-3 md:max-w-2xl"
            >
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur"
                >
                  <BadgeCheck className="h-5 w-5 shrink-0 text-sky-300" />
                  <p className="text-sm text-slate-100 md:text-base">{point}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="glass-panel rounded-[32px] p-6 md:p-8"
          >
            <div className="rounded-[28px] border border-white/10 bg-slate-950/30 p-6">
              <p className="text-xs uppercase tracking-[0.32em] text-sky-300">
                Why homeowners choose us
              </p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                  <p className="text-4xl font-semibold text-white">10+</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Years delivering backyard projects with high-end finishes and durable systems.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                    <p className="text-3xl font-semibold text-white">5.0</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Client satisfaction focused experience
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                    <p className="text-3xl font-semibold text-white">PA</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Serving homeowners across Pennsylvania
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] bg-white px-5 py-5 text-slate-950 shadow-[0_18px_50px_rgba(255,255,255,0.12)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Fast contact
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      WhatsApp, phone, Instagram and Facebook ready
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Built to convert visitors into real leads with clear calls to action and trust-first design.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

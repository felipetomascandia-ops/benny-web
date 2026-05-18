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
    <section className="relative overflow-hidden pb-24 pt-32 text-white md:pb-32 md:pt-48 min-h-[90vh] flex items-center">
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('/background.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/40 to-slate-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.3)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0b1730]/40 to-transparent" />

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
              className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-7xl lg:text-8xl"
            >
              Premium pool design that makes your property feel like a resort.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl md:text-2xl"
            >
              USA Pools Services LLC creates sophisticated residential pools,
              remodels, and maintenance programs with a polished process,
              fast communication, and craftsmanship you can trust.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-12 flex flex-wrap gap-6"
            >
              <a
                href="#contact"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-blue-600 px-10 py-5 text-lg font-bold text-white transition-all hover:bg-blue-700 hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
              >
                <span className="relative z-10">Get a Free Quote</span>
                <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 to-blue-500 transition-transform duration-500 group-hover:scale-110" />
              </a>
              <a
                href="#portfolio"
                className="inline-flex items-center gap-3 rounded-full border-2 border-white/30 bg-white/10 px-10 py-5 text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:text-slate-900"
              >
                View Portfolio
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

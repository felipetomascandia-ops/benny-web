"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Palette, CheckCircle2 } from "lucide-react";

const finishes = [
  {
    title: "Diamond Brite Finishes",
    description: "Experience the ultimate in pool finishes with Diamond Brite's blend of quartz and polymer-modified cement.",
    image: "/colours/colours1.png",
    benefits: ["Exposed aggregate", "Stain resistant", "Durable quartz", "Vibrant colors"]
  },
  {
    title: "River Rok Finishes",
    description: "Natural pebble finishes that provide a stunning, rustic aesthetic and unmatched longevity.",
    image: "/colours/colours2.png",
    benefits: ["Natural river stones", "Slip resistant", "Smooth texture", "Nature-inspired"]
  }
];

export default function FinishColors() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden" id="finishes">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container-shell relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
          >
            <Palette className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Premium Finishes</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6"
          >
            Choose Your <span className="text-blue-500 text-glow-blue">Perfect Color</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg font-medium"
          >
            Explore our curated selection of high-end stone finishes to give your pool a unique, luxurious look that lasts a lifetime.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {finishes.map((finish, index) => (
            <motion.div
              key={finish.title}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="group relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/10 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-[#0f172a] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl h-full flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={finish.image}
                    alt={finish.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                </div>
                
                <div className="p-8 flex-grow">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-blue-500 transition-colors">
                    {finish.title}
                  </h3>
                  <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                    {finish.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {finish.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const brands = [
  { name: "Hayward", logo: "/marcas/hayward.png" },
  { name: "Pentair", logo: "/marcas/pentairpool.png" },
  { name: "Jandy", logo: "/marcas/jandy.png" },
  { name: "Diamond Brite", logo: "/marcas/diamongbrite.png" },
  { name: "River Rok", logo: "/marcas/riverrok.png" },
];

export default function Brands() {
  return (
    <section className="py-24 bg-background dark:bg-[#020617] border-y border-border/50 dark:border-white/[0.05] relative overflow-hidden">
      {/* Decorative premium elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container-shell relative z-10">
        <div className="text-center mb-20">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-black text-blue-500 uppercase tracking-[0.8em] mb-4"
          >
            Our Partners
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase"
          >
            Trusted by <span className="text-blue-500">Industry Leaders</span>
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "80px" }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-1 bg-blue-500 mx-auto mt-6 rounded-full"
          />
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-16 md:gap-x-24">
          {brands.map((brand, index) => (
            <motion.div 
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="relative w-36 h-12 md:w-52 md:h-16 group flex items-center justify-center"
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 dark:brightness-150 dark:contrast-125 dark:mix-blend-lighten"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

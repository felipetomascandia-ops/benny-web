"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PoolMaterial {
  id: string;
  name: string;
  color: string;
  waterColor: string;
  description: string;
}

const materials: PoolMaterial[] = [
  {
    id: "super-blue",
    name: "Super Blue",
    color: "#e0f2fe",
    waterColor: "rgba(56, 189, 248, 0.4)",
    description: "A bright, crisp blue that makes the water sparkle under the sun."
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    color: "#1e3a8a",
    waterColor: "rgba(30, 58, 138, 0.6)",
    description: "Deep and elegant, perfect for a sophisticated, mirror-like finish."
  },
  {
    id: "tahoe-blue",
    name: "Tahoe Blue",
    color: "#0369a1",
    waterColor: "rgba(3, 105, 161, 0.5)",
    description: "A classic mountain lake blue that feels natural and refreshing."
  },
  {
    id: "aqua-quartz",
    name: "Aqua Quartz",
    color: "#99f6e4",
    waterColor: "rgba(45, 212, 191, 0.4)",
    description: "Soft turquoise tones for a tropical, Caribbean beach feel."
  },
  {
    id: "french-gray",
    name: "French Gray",
    color: "#94a3b8",
    waterColor: "rgba(148, 163, 184, 0.4)",
    description: "Modern and sleek, giving the water a cool, natural light blue tint."
  },
  {
    id: "onyx",
    name: "Onyx",
    color: "#1e293b",
    waterColor: "rgba(15, 23, 42, 0.7)",
    description: "Dramatic and bold, creating stunning reflections of your backyard."
  },
  {
    id: "verde",
    name: "Verde",
    color: "#134e4a",
    waterColor: "rgba(20, 184, 166, 0.5)",
    description: "Lush green tones that blend perfectly with garden landscapes."
  },
  {
    id: "mojave-beige",
    name: "Mojave Beige",
    color: "#d6d3d1",
    waterColor: "rgba(20, 184, 166, 0.3)",
    description: "Warm sandy tones that create an inviting, natural lagoon look."
  }
];

export default function PoolVisualizer() {
  const [selected, setSelected] = useState(materials[0]);

  return (
    <section className="py-24 bg-white overflow-hidden" id="visualizer">
      <div className="container-shell">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 mb-4"
          >
            Experience your Dream
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Pool Color Visualizer
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Select different finishes to see how the water color transforms. 
            Find the perfect match for your backyard oasis.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Visualizer Display */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl bg-slate-100 border-8 border-white">
              {/* Pool Background (Concrete/Plaster) */}
              <motion.div 
                animate={{ backgroundColor: selected.color }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 transition-colors duration-700"
                style={{
                  backgroundImage: `url("https://www.transparenttextures.com/patterns/concrete-wall.png")`,
                  backgroundBlendMode: "overlay"
                }}
              />
              
              {/* Water Layer */}
              <motion.div 
                animate={{ backgroundColor: selected.waterColor }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-10 opacity-80"
                style={{
                  backgroundImage: `url("https://www.transparenttextures.com/patterns/water.png")`,
                  backgroundSize: "400px"
                }}
              >
                {/* Water Ripple Animation */}
                <div className="absolute inset-0 opacity-30 animate-pulse bg-[url('https://www.transparenttextures.com/patterns/water.png')] bg-repeat" />
              </motion.div>

              {/* Pool Walls/Perspective */}
              <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_40px_100px_rgba(0,0,0,0.2)]" />
              
              {/* Sunlight Reflection Overlay */}
              <div className="absolute inset-0 z-30 opacity-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-white/10" />
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8">
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                Available Finishes
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {materials.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={cn(
                      "relative group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300",
                      selected.id === item.id 
                        ? "bg-white shadow-md ring-2 ring-blue-500" 
                        : "hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <div 
                      className="w-12 h-12 rounded-full shadow-inner border border-slate-200 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className={cn(
                      "text-xs font-bold text-center transition-colors",
                      selected.id === item.id ? "text-blue-600" : "text-slate-500"
                    )}>
                      {item.name}
                    </span>
                    {selected.id === item.id && (
                      <motion.div 
                        layoutId="active-check"
                        className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1 shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={selected.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mt-10 p-6 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200"
                >
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 mt-0.5 shrink-0 text-blue-200" />
                    <div>
                      <h4 className="font-bold mb-1">{selected.name}</h4>
                      <p className="text-sm text-blue-100 leading-relaxed">
                        {selected.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
              <p className="text-sm text-slate-500 mb-4 italic">
                *Final water color may vary based on depth, landscaping, and sunlight.
              </p>
              <button 
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  contactSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Request this finish
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

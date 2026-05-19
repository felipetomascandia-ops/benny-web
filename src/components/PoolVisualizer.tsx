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
    id: "light-blue",
    name: "Light Blue",
    color: "#7dd3fc",
    waterColor: "rgba(125, 211, 252, 0.45)",
    description: "A bright, crystal clear blue that makes your pool look like a tropical paradise."
  },
  {
    id: "medium-blue",
    name: "Medium Blue",
    color: "#3b82f6",
    waterColor: "rgba(59, 130, 246, 0.55)",
    description: "The classic swimming pool blue, balanced and vibrant under direct sunlight."
  },
  {
    id: "dark-blue",
    name: "Dark Blue",
    color: "#1d4ed8",
    waterColor: "rgba(29, 78, 216, 0.65)",
    description: "Deep and luxurious tones that create stunning reflections and a resort-like feel."
  },
  {
    id: "light-gray",
    name: "Light Gray",
    color: "#cbd5e1",
    waterColor: "rgba(186, 230, 253, 0.5)",
    description: "Modern and sophisticated, giving the water a natural, light mountain-stream tint."
  },
  {
    id: "blue-gray",
    name: "Blue Gray",
    color: "#64748b",
    waterColor: "rgba(71, 85, 105, 0.6)",
    description: "A trendy, deep slate blue that blends perfectly with contemporary backyard designs."
  },
  {
    id: "dark-gray",
    name: "Dark Gray",
    color: "#334155",
    waterColor: "rgba(15, 23, 42, 0.75)",
    description: "Dramatic and bold, creating a mirror-effect that captures the sky and surrounding landscape."
  },
  {
    id: "light-green",
    name: "Light Green",
    color: "#a7f3d0",
    waterColor: "rgba(167, 243, 208, 0.4)",
    description: "Soft Caribbean green tones for a natural lagoon aesthetic."
  },
  {
    id: "green",
    name: "Green",
    color: "#10b981",
    waterColor: "rgba(16, 185, 129, 0.5)",
    description: "Rich emerald water that feels refreshing and perfectly integrated with nature."
  },
  {
    id: "deep-dark-green",
    name: "Deep Dark Green",
    color: "#064e3b",
    waterColor: "rgba(2, 44, 34, 0.7)",
    description: "Deep forest green for a natural, pond-like luxury finish with incredible depth."
  }
];

export default function PoolVisualizer() {
  const [selected, setSelected] = useState(materials[0]);

  return (
    <section className="py-24 bg-transparent overflow-hidden" id="visualizer">
      <div className="container-shell">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-black uppercase tracking-[0.4em] text-blue-500 mb-4"
          >
            Experience your Dream
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-foreground mb-6"
          >
            Pool Color Visualizer
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Select different finishes to see how the water color transforms. 
            Find the perfect match for your backyard oasis.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Visualizer Display */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-2xl bg-card border-8 border-card group">
              {/* Pool Background (Concrete/Plaster) */}
              <motion.div 
                animate={{ backgroundColor: selected.color }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 transition-colors duration-700"
                style={{
                  backgroundImage: `url("https://www.transparenttextures.com/patterns/p6.png")`,
                  backgroundSize: "200px",
                  backgroundBlendMode: "multiply"
                }}
              />
              
              {/* Water Layer with Realistic Animated Ripple/Caustics */}
              <motion.div 
                animate={{ backgroundColor: selected.waterColor }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-10 opacity-80"
              >
                {/* Real-time Animated Wave 1 (Caustics) */}
                <motion.div 
                  animate={{ 
                    backgroundPosition: ["0% 0%", "100% 100%"],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none"
                  style={{
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/water.png")`,
                    backgroundSize: "400px",
                    filter: "contrast(1.2) brightness(1.1)"
                  }}
                />
                
                {/* Real-time Animated Wave 2 (Distortion/Depth) */}
                <motion.div 
                  animate={{ 
                    backgroundPosition: ["100% 0%", "0% 100%"],
                    scale: [1.1, 1, 1.1]
                  }}
                  transition={{ 
                    duration: 14, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/water.png")`,
                    backgroundSize: "600px",
                    filter: "blur(1px)"
                  }}
                />

                {/* Shimmer / Sparkle Layer */}
                <motion.div 
                  animate={{ 
                    opacity: [0.1, 0.4, 0.1],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_0%,transparent_70%)] mix-blend-overlay"
                />
              </motion.div>

              {/* Pool Depth Gradient (Darker at bottom) */}
              <div className="absolute inset-0 z-15 bg-gradient-to-b from-black/0 via-black/5 to-black/30 pointer-events-none" />

              {/* Pool Perspective & Internal Shadows (Realistic 3D look) */}
              <div className="absolute inset-0 z-25 pointer-events-none shadow-[inset_0_40px_100px_rgba(0,0,0,0.4),inset_0_-20px_80px_rgba(0,0,0,0.3)]" />
              
              {/* Sunlight Reflection (Lens Flare Effect) */}
              <div className="absolute inset-0 z-30 opacity-50 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4)_0%,transparent_50%)]" />
              
              {/* Surface Refraction Shimmer */}
              <motion.div 
                animate={{ 
                  backgroundPosition: ["0% 0%", "100% 0%"],
                  opacity: [0.05, 0.1, 0.05]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 z-35 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6.png')] bg-[length:300px] mix-blend-soft-light"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8">
            <div className="bg-card rounded-[2.5rem] p-8 border border-border">
              <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
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
                        ? "bg-muted shadow-md ring-2 ring-blue-500" 
                        : "hover:bg-muted/50 hover:shadow-sm"
                    )}
                  >
                    <div 
                      className="w-12 h-12 rounded-full shadow-inner border border-border group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className={cn(
                      "text-xs font-black uppercase tracking-widest text-center transition-colors",
                      selected.id === item.id ? "text-blue-500" : "text-muted-foreground"
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
                  className="mt-10 p-6 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/20"
                >
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 mt-0.5 shrink-0 text-white/70" />
                    <div>
                      <h4 className="font-black uppercase tracking-widest mb-1">{selected.name}</h4>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {selected.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-8 border-2 border-dashed border-border rounded-[2.5rem] text-center">
              <p className="text-sm text-muted-foreground mb-6 italic">
                *Final water color may vary based on depth, landscaping, and sunlight.
              </p>
              <button 
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  contactSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="water-button w-full"
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

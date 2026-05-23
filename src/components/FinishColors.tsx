"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, CheckCircle2, Maximize2, X } from "lucide-react";

const finishes = [
  {
    title: "Diamond Brite Premium",
    description: "Explore our premium Diamond Brite colors, designed to provide a smooth, comfortable texture and stunning visual depth with polymer-modified cement.",
    image: "/colours/colours2.png",
    benefits: ["Smooth texture", "Slip resistant", "Color consistency", "UV stable pigments"],
    detailedContent: {
      whatIs: "Diamond Brite Premium is a high-performance, polymer-modified cementitious pool finish designed to deliver exceptional beauty, durability, and comfort. It combines the strength of specially formulated cement with premium quartz aggregates and advanced polymers, creating a finish that stands the test of time while providing a stunning visual appearance.",
      howWorks: {
        composition: [
          "Polymer-Modified Cement Base: The foundation of Diamond Brite Premium is a high-quality, white Portland cement blended with proprietary acrylic polymers. These polymers significantly enhance the finish's flexibility, adhesion, and resistance to cracking.",
          "Premium Quartz Aggregates: Fine, uniformly graded quartz sand and aggregates are carefully selected for their smooth texture and consistent color. These aggregates create the characteristic comfortable feel underfoot.",
          "UV-Stable Pigments: Advanced, light-fast pigments are integrated throughout the material to ensure long-lasting color vibrancy, even with prolonged exposure to harsh sunlight."
        ],
        application: [
          "Surface Preparation: The pool shell is thoroughly cleaned, etched, and primed to ensure optimal adhesion of the Diamond Brite material.",
          "Mixing: The Diamond Brite Premium material is mixed with water to precise specifications, ensuring consistent texture and workability.",
          "Application: The material is hand-troweled onto the pool surface in multiple thin layers, allowing skilled technicians to achieve a uniform, smooth finish.",
          "Curing: The finish is carefully cured over several days to achieve maximum strength and durability.",
          "Acid Wash & Startup: A gentle acid wash removes any surface haze, followed by a proper pool startup process to balance water chemistry and protect the new finish."
        ]
      },
      keyBenefits: [
        { title: "Exceptional Smoothness & Comfort", desc: "Diamond Brite Premium is renowned for its silky-smooth texture that feels comfortable underfoot, making it ideal for families with children and anyone who enjoys spending time in the pool." },
        { title: "Slip-Resistant Surface", desc: "Despite its smooth feel, Diamond Brite Premium provides excellent traction, reducing the risk of slips and falls around the pool area. The texture is carefully calibrated to balance comfort and safety." },
        { title: "Consistent Color & Appearance", desc: "The premium quartz aggregates and UV-stable pigments ensure uniform color distribution throughout the finish. You won't see unsightly patches or color variations, just a beautiful, consistent appearance." },
        { title: "UV Stability & Fade Resistance", desc: "Advanced pigment technology protects against fading caused by prolonged sun exposure. Your pool will maintain its vibrant color for years to come, even in the harshest climates." },
        { title: "Durability & Longevity", desc: "The polymer-modified cement base provides exceptional resistance to cracking, chemical attack, staining, and wear and tear from regular use." },
        { title: "Easy Maintenance", desc: "Diamond Brite Premium's non-porous surface resists algae growth and makes cleaning easier. Regular brushing and proper water chemistry maintenance are all that's needed." }
      ],
      idealFor: "Residential pools of all sizes, families with children and pets, pool owners seeking a luxurious premium appearance, and those looking for a low-maintenance, long-lasting finish."
    }
  },
  {
    title: "River Rok Natural",
    description: "Natural pebble finishes that provide a stunning, rustic aesthetic and unmatched longevity with a unique textured feel.",
    image: "/colours/colours3.png",
    benefits: ["Natural river stones", "Non-slip surface", "Rustic aesthetic", "Nature-inspired"],
    detailedContent: {
      whatIs: "River Rok Natural is a premium pebble pool finish that brings the beauty of nature into your backyard. It features real, naturally polished river stones embedded in a high-strength cementitious matrix, creating a stunning, rustic aesthetic that mimics the look and feel of a natural riverbed.",
      howWorks: {
        composition: [
          "Natural River Stones: The star of the show is genuine river pebbles that have been naturally smoothed and polished by water over thousands of years. These stones come in a variety of sizes, shapes, and colors, creating a unique, organic appearance.",
          "High-Strength Cement Matrix: The river stones are held in place by a specially formulated, white Portland cement-based matrix that provides exceptional strength and durability.",
          "Advanced Bonding Agents: Proprietary additives ensure the stones are securely bonded to the matrix and the pool shell, preventing stone loss and ensuring long-term performance."
        ],
        application: [
          "Surface Preparation: The pool shell is thoroughly cleaned, inspected, and prepared to create the ideal surface for the River Rok finish.",
          "Material Mixing: The River Rok Natural material, consisting of river stones and cementitious matrix, is mixed to precise specifications.",
          "Application: The material is applied to the pool surface by skilled technicians who carefully spread and compact it to ensure uniform coverage and proper stone embedding.",
          "Exposing the Stones: After the material has partially cured, the surface is carefully washed to expose the beautiful river stones, creating the signature River Rok texture.",
          "Final Curing: The finish is allowed to cure completely, developing maximum strength and durability.",
          "Pool Startup: The pool is filled, and the water chemistry is carefully balanced to protect and enhance your new River Rok finish."
        ]
      },
      keyBenefits: [
        { title: "Natural, Rustic Aesthetic", desc: "River Rok Natural brings the beauty of nature to your pool. The genuine river stones create a unique, organic appearance that cannot be replicated with synthetic materials. Each finish is truly one-of-a-kind." },
        { title: "Exceptional Non-Slip Surface", desc: "The textured surface created by the river stones provides excellent traction, making River Rok Natural one of the safest pool finishes available. You can feel confident walking around the pool, even when the surface is wet." },
        { title: "Unmatched Durability", desc: "River stones are incredibly hard and durable, having withstood the forces of nature for thousands of years. When embedded in a high-strength cement matrix, they create a pool finish that can last decades with proper care." },
        { title: "Nature-Inspired Beauty", desc: "The natural colors and textures of the river stones create a serene, relaxing atmosphere that evokes the feeling of being in a natural river or lake. It's the perfect choice for homeowners who want to create a peaceful, nature-inspired backyard oasis." },
        { title: "Cool Underfoot", desc: "River Rok Natural stays cooler underfoot than many other pool finishes, making it comfortable to walk on even on hot sunny days. The natural stones help dissipate heat, keeping the surface pleasant to the touch." },
        { title: "Resistance to Staining and Wear", desc: "The dense, hard surface of the river stones resists staining from minerals, algae, and organic materials. It also stands up well to regular use, maintaining its beautiful appearance for years." }
      ],
      idealFor: "Homeowners seeking a natural, organic look, those who prioritize safety and non-slip surfaces, anyone wanting to create a nature-inspired backyard oasis, and pool owners looking for an extremely durable, long-lasting finish."
    }
  }
];

interface FinishColorsProps {
  onModalChange?: (isOpen: boolean) => void;
}

export default function FinishColors({ onModalChange }: FinishColorsProps) {
  const [selectedFinish, setSelectedFinish] = useState<typeof finishes[0] | null>(null);

  const handleClose = () => {
    setSelectedFinish(null);
    onModalChange?.(false);
  };

  const handleSelectFinish = (finish: typeof finishes[0]) => {
    setSelectedFinish(finish);
    onModalChange?.(true);
  };

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
                <div 
                  className="relative aspect-[16/10] overflow-hidden cursor-zoom-in"
                  onClick={() => handleSelectFinish(finish)}
                >
                  <Image
                    src={finish.image}
                    alt={finish.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60" />
                  
                  {/* Zoom Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-blue-500/20 backdrop-blur-md p-4 rounded-full border border-blue-500/50">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
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

      {/* Detailed Finish Modal */}
      <AnimatePresence>
        {selectedFinish && (
          <div className="fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-md cursor-pointer"
              onClick={handleClose}
            />
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-[9998] overflow-y-auto">
              <div className="min-h-full flex items-center justify-center p-4 md:p-12">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 30 }}
                  className="relative w-full max-w-7xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#0f172a]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Image Side */}
                    <div className="relative min-h-[400px] lg:min-h-full">
                      <Image
                        src={selectedFinish.image}
                        alt={selectedFinish.title}
                        fill
                        className="object-contain bg-black/20"
                        priority
                      />
                    </div>
                    
                    {/* Content Side */}
                    <div className="p-8 lg:p-10 overflow-y-auto max-h-[85vh]">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight text-blue-500">
                          {selectedFinish.title}
                        </h2>
                        <button
                          onClick={handleClose}
                          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      
                      <div className="space-y-8">
                        {/* What Is It */}
                        <div>
                          <h3 className="text-xl font-bold text-white mb-3">What is {selectedFinish.title}?</h3>
                          <p className="text-slate-300 leading-relaxed">
                            {selectedFinish.detailedContent.whatIs}
                          </p>
                        </div>
                        
                        {/* How It Works - Composition */}
                        <div>
                          <h3 className="text-xl font-bold text-white mb-3">Material Composition</h3>
                          <ul className="space-y-3">
                            {selectedFinish.detailedContent.howWorks.composition.map((item, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="text-blue-500 font-bold mt-1 shrink-0">•</span>
                                <p className="text-slate-300 leading-relaxed">{item}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* How It Works - Application */}
                        <div>
                          <h3 className="text-xl font-bold text-white mb-3">Application Process</h3>
                          <ol className="space-y-3">
                            {selectedFinish.detailedContent.howWorks.application.map((step, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="text-blue-500 font-bold mt-1 shrink-0">{i + 1}.</span>
                                <p className="text-slate-300 leading-relaxed">{step}</p>
                              </li>
                            ))}
                          </ol>
                        </div>
                        
                        {/* Key Benefits */}
                        <div>
                          <h3 className="text-xl font-bold text-white mb-4">Key Benefits</h3>
                          <div className="space-y-4">
                            {selectedFinish.detailedContent.keyBenefits.map((benefit, i) => (
                              <div key={i} className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                                <h4 className="font-bold text-white mb-2">{benefit.title}</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">{benefit.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Ideal For */}
                        <div className="bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 rounded-r-2xl p-5">
                          <h3 className="text-xl font-bold text-white mb-2">Ideal For</h3>
                          <p className="text-slate-300 leading-relaxed">
                            {selectedFinish.detailedContent.idealFor}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

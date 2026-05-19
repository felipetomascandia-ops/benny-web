"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

const works = [
  { id: 1, src: "/works/work1.png", title: "Luxury Pool Renovation" },
  { id: 2, src: "/works/work2.png", title: "Premium Tiling Work" },
  { id: 3, src: "/works/work3.png", title: "Custom Spa Installation" },
  { id: 4, src: "/works/work4.png", title: "Pool Deck Restoration" },
  { id: 5, src: "/works/work5.png", title: "Water Feature Design" },
  { id: 6, src: "/works/work6.png", title: "Modern Lighting Setup" },
  { id: 7, src: "/works/work7.png", title: "Backyard Oasis" },
  { id: 9, src: "/works/work9.png", title: "Complete System Upgrade" },
  { id: 10, src: "/works/work10.png", title: "Modern Pool Design" },
  { id: 11, src: "/works/work11.png", title: "Premium Pool Maintenance" },
  { id: 12, src: "/works/work12.png", title: "Luxury Spa Design" },
  { id: 13, src: "/works/work13.png", title: "Custom Stone Work" },
  { id: 14, src: "/works/work14.png", title: "Professional Cleaning" },
  { id: 15, src: "/works/work15.png", title: "High-End Pool Finish" },
  { id: 16, src: "/works/work16.png", title: "Equipment Installation" },
  { id: 17, src: "/works/work17.png", title: "Pool Chemistry Control" },
  { id: 18, src: "/works/work18.png", title: "Summer Season Prep" },
  { id: 19, src: "/works/work19.png", title: "Luxury Pool Deck" },
  { id: 20, src: "/works/work20.png", title: "Premium Backyard Spa" },
];

const beforeAfter = {
  before: "/works/work8-before.png",
  after: "/works/work8-after.png",
};

export default function Portfolio() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const isResizing = useRef(false);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % works.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % works.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + works.length) % works.length);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isResizing.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <section className="py-24 bg-muted/30" id="portfolio">
      <div className="container-shell">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Latest Work</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Experience the transformation. From maintenance to complete renovations, we deliver excellence in every project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Before/After Section (2/5 of grid) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-sm font-bold uppercase tracking-wider">
              The Transformation
            </div>
            <h3 className="text-2xl font-bold text-foreground">Before & After</h3>
            <p className="text-muted-foreground">
              Drag the slider to see how we transform old pools into modern masterpieces.
            </p>
            
            <div 
              className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden cursor-ew-resize select-none border-8 border-card shadow-2xl bg-card"
              onMouseMove={handleMove}
              onTouchMove={handleMove}
              onMouseDown={() => isResizing.current = true}
              onMouseUp={() => isResizing.current = false}
              onMouseLeave={() => isResizing.current = false}
              onTouchStart={() => isResizing.current = true}
              onTouchEnd={() => isResizing.current = false}
            >
              <Image src={beforeAfter.after} alt="After" fill className="object-cover transition-transform duration-700" />
              <div 
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <Image src={beforeAfter.before} alt="Before" fill className="object-cover transition-transform duration-700" />
              </div>
              
              {/* Slider Line */}
              <div 
                className="absolute inset-y-0 w-1.5 bg-white shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-500">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-4 bg-blue-500 rounded-full animate-pulse" />
                    <div className="w-1.5 h-4 bg-blue-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-xl text-white text-xs font-black rounded-xl uppercase border border-white/10 tracking-widest">Before</div>
              <div className="absolute bottom-6 right-6 px-4 py-2 bg-blue-600/80 backdrop-blur-xl text-white text-xs font-black rounded-xl uppercase border border-white/10 tracking-widest">After</div>
            </div>
          </div>

          {/* Carousel Section (3/5 of grid) */}
          <div className="lg:col-span-3">
            <div className="relative aspect-[16/10] md:aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl group border border-border bg-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={works[currentIndex].src}
                    alt={works[currentIndex].title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-10 left-10 text-white">
                    <p className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-2">Project Portfolio</p>
                    <h4 className="text-3xl font-bold">{works[currentIndex].title}</h4>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <button 
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/20"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/20"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Indicators */}
              <div className="absolute top-10 right-10 flex gap-2">
                {works.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-4 gap-4">
               {works.slice(0, 4).map((work, idx) => (
                 <button 
                  key={work.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative aspect-video rounded-2xl overflow-hidden transition-all duration-300 border-2 ${idx === currentIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                 >
                   <Image src={work.src} alt={work.title} fill className="object-cover" />
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

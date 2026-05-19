"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircleMore, Sparkles } from "lucide-react";
import { buildWhatsAppUrl, companyConfig } from "@/lib/site-config";

export default function WhatsAppButton() {
  const [showBubble, setShowBubble] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const whatsappUrl = buildWhatsAppUrl(
    "Hello! I am interested in your pool services in Pennsylvania.",
  );

  useEffect(() => {
    // Mostrar la burbuja después de 3 segundos si no ha sido descartada
    const timer = setTimeout(() => {
      if (!isDismissed) setShowBubble(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isDismissed]);

  const messages = [
    "Ready to dive into luxury? Let's build your dream pool together!",
    "Quality that speaks for itself. Message us for a premium quote today!",
    "Expert craftsmanship for your Pennsylvania home. We're online!",
    "Transform your backyard into a five-star resort. Ask me how!"
  ];

  // Seleccionar un mensaje aleatorio cada vez que se carga
  const [randomMessage] = useState(() => messages[Math.floor(Math.random() * messages.length)]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end md:bottom-8 md:right-8">
      {/* Water Drop Mascot and Bubble */}
      <AnimatePresence>
        {showBubble && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 relative"
          >
            {/* Speech Bubble */}
            <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 max-w-[240px] relative">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDismissed(true);
                  setShowBubble(false);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
              
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {randomMessage}
                </p>
              </div>

              {/* Bubble Tail */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" />
            </div>

            {/* Mascot Image */}
            <motion.div
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute -bottom-6 right-2 w-14 h-14 pointer-events-none"
            >
              <Image 
                src="/gotita.png" 
                alt="Water Drop Mascot" 
                width={56} 
                height={56} 
                className="object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(37,211,102,0.35)] transition hover:scale-[1.03] hover:bg-[#1ebe5b] relative overflow-hidden group"
        aria-label="Contact on WhatsApp"
        onMouseEnter={() => setShowBubble(true)}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
          <MessageCircleMore className="h-6 w-6" />
        </span>
        <span className="hidden pr-1 sm:block">
          <span className="block text-[11px] uppercase tracking-[0.24em] text-white/80">
            WhatsApp
          </span>
          <span className="block text-sm font-semibold">{companyConfig.phoneDisplay}</span>
        </span>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
      </a>
    </div>
  );
}

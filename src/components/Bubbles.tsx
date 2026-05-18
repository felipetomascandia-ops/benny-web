"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Bubbles() {
  const [isVisible, setIsVisible] = useState(true);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generar burbujas iniciales
    const newBubbles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 50 + 15,
      delay: Math.random() * 0.8,
      duration: Math.random() * 2 + 1.5,
    }));
    setBubbles(newBubbles);

    // Desaparecer el componente después de que las burbujas suban y "exploten"
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden bg-blue-500/10 backdrop-blur-[2px]"
        >
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              initial={{ y: "110vh", x: `${bubble.x}vw`, scale: 0.5, opacity: 0 }}
              animate={{
                y: "-20vh",
                opacity: [0, 1, 1, 0.8, 0],
                scale: [0.5, 1, 1, 1.5, 2.5], // El aumento final de escala simula la explosión
              }}
              transition={{
                duration: bubble.duration,
                delay: bubble.delay,
                ease: "easeOut",
              }}
              className="absolute rounded-full border-2 border-white/40 bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              style={{
                width: bubble.size,
                height: bubble.size,
              }}
            >
              {/* Brillo interno de la burbuja */}
              <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-white/40 rounded-full blur-[2px]" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

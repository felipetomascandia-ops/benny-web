"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/client";

export default function JobNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true to hide initially
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      // Only show if NOT authenticated
      if (!session) {
        const timer = setTimeout(() => {
          setShowNotification(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) setShowNotification(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (isAuthenticated) return null;

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed bottom-32 right-6 z-[60] max-w-sm"
        >
          <div className="bg-[#0f172a] rounded-3xl shadow-2xl border border-white/10 p-5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
            <button 
              onClick={() => setShowNotification(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 fill-blue-500/20" />
              </div>
              <div>
                <h4 className="font-black text-white pr-4 uppercase tracking-tight">Want Exclusive Offers?</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Join our VIP Club now to receive special discounts and maintenance deals.
                </p>
                <Link 
                  href="/register"
                  className="mt-4 text-sm font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 flex items-center gap-1 group/btn"
                >
                  Register Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

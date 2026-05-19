"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0f172a] rounded-[32px] border border-white/10 p-12 text-center shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
          Auth <span className="text-rose-500">Error</span>
        </h1>
        
        <p className="text-slate-400 font-medium mb-10">
          Something went wrong during the authentication process. This could be due to an expired link or a connection issue.
        </p>

        <Link
          href="/login"
          className="water-button w-full flex items-center justify-center gap-3 h-14"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Login
        </Link>
      </motion.div>
    </div>
  );
}

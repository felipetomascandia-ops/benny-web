"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, ArrowRight, LoaderCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/client";
import { companyConfig } from "@/lib/site-config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${companyConfig.websiteUrl}/reset-password`,
    });

    if (error) {
      setFeedback({ type: "error", message: error.message });
      setIsLoading(false);
      return;
    }

    setFeedback({
      type: "success",
      message: "We've sent you an email with instructions to reset your password.",
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-6">
            <div className="overflow-hidden rounded-2xl bg-[#0f172a] p-1.5 shadow-xl border border-white/10 transition-transform group-hover:scale-105">
              <Image
                src={companyConfig.logoPath}
                alt={companyConfig.name}
                width={60}
                height={40}
                className="h-8 w-auto object-contain brightness-200 contrast-125 mix-blend-lighten"
              />
            </div>
            <span className="text-lg font-black text-white tracking-tight uppercase">USA Pools</span>
          </Link>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Recover <span className="text-blue-500">Access</span>
          </h1>
          <p className="mt-2 text-slate-400 font-medium">
            Enter your email and we'll send you a recovery link.
          </p>
        </div>

        <div className="bg-[#0f172a] rounded-[32px] border border-white/5 p-8 shadow-2xl">
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-blue-500" /> Email Address
              </label>
              <input
                required
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                  feedback.type === "success" 
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                }`}
              >
                {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                {feedback.message}
              </motion.div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="water-button w-full h-14"
            >
              {isLoading ? <LoaderCircle className="w-6 h-6 animate-spin" /> : (
                <>Send Link <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Remembered your password?{" "}
            <Link href="/login" className="text-blue-500 font-black hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

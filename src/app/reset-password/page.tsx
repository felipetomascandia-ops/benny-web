"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, ArrowRight, LoaderCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/client";
import { companyConfig } from "@/lib/site-config";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setFeedback({ type: "error", message: error.message });
      setIsLoading(false);
      return;
    }

    setFeedback({
      type: "success",
      message: "Your password has been updated successfully.",
    });
    setIsLoading(false);
    
    setTimeout(() => {
      router.push("/login");
    }, 2000);
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
            New <span className="text-blue-500">Password</span>
          </h1>
          <p className="mt-2 text-slate-400 font-medium">
            Choose your new access password.
          </p>
        </div>

        <div className="bg-[#0f172a] rounded-[32px] border border-white/5 p-8 shadow-2xl">
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-blue-500" /> New Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-blue-500" /> Confirm Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                <>Update Password <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

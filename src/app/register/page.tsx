"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, ArrowRight, LoaderCircle, CheckCircle2, Globe2, MapPin } from "lucide-react";
import { createClient } from "@/lib/client";
import { companyConfig } from "@/lib/site-config";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          full_name: `${formData.firstName} ${formData.lastName}`,
        },
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : companyConfig.websiteUrl}/auth/callback`,
      },
    });

    if (error) {
      setFeedback({ type: "error", message: error.message });
      setIsLoading(false);
      return;
    }

    setFeedback({
      type: "success",
      message: "Registration almost complete! Please check your email to verify your account and activate your discounts.",
    });
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : companyConfig.websiteUrl;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
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
        className="w-full max-w-xl z-10"
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
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Join the <span className="text-blue-500">VIP Club</span>
          </h1>
          <p className="mt-2 text-slate-400 font-medium">
            Register to receive exclusive offers and maintenance discounts.
          </p>
        </div>

        <div className="bg-[#0f172a] rounded-[32px] border border-white/5 p-8 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <User className="w-3 h-3 text-blue-500" /> First Name
                </label>
                <input
                  required
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <User className="w-3 h-3 text-blue-500" /> Last Name
                </label>
                <input
                  required
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-blue-500" /> Email Address
              </label>
              <input
                required
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-blue-500" /> Phone Number
              </label>
              <input
                required
                type="tel"
                placeholder="+1 (267) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-blue-500" /> Home Address
              </label>
              <input
                required
                placeholder="123 Pool St, Pennsylvania"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-blue-500" /> Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                {feedback.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                {feedback.message}
              </motion.div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="water-button w-full h-14"
            >
              {isLoading ? <LoaderCircle className="w-6 h-6 animate-spin" /> : (
                <>Create My VIP Account <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f172a] px-4 text-slate-500 font-bold tracking-widest">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
            >
              <Globe2 className="w-5 h-5 text-blue-500" /> Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 font-black hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, LoaderCircle, Globe2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/client";
import { companyConfig } from "@/lib/site-config";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${companyConfig.websiteUrl}/auth/callback`,
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
        className="w-full max-md z-10"
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
            VIP <span className="text-blue-500">Access</span>
          </h1>
          <p className="mt-2 text-slate-400 font-medium">
            Log in to your account to view your benefits.
          </p>
        </div>

        <div className="bg-[#0f172a] rounded-[32px] border border-white/5 p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-blue-500" /> Password
                </label>
                <Link href="/forgot-password" size="sm" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl text-sm font-bold flex items-center gap-3 bg-rose-500/10 text-rose-500 border border-rose-500/20"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="water-button w-full h-14"
            >
              {isLoading ? <LoaderCircle className="w-6 h-6 animate-spin" /> : (
                <>Log In <ArrowRight className="ml-2 w-5 h-5" /></>
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
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-500 font-black hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Moon, Sun, LogIn, UserPlus, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { companyConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";

const navLinks = [
  { name: "Home", href: "/#" },
  { name: "Portfolio", href: "/#portfolio" },
  { name: "Services", href: "/#services" },
  { name: "Reviews", href: "/#reviews" },
  { name: "Book a Visit", href: "/#booking" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    // Check initial theme - default to dark
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      if (!savedTheme) localStorage.setItem("theme", "dark");
    }

    // Check user session
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!mounted) return null;

  return (
    <nav className={cn(
      "fixed inset-x-0 top-0 z-50 transition-all duration-500",
      isScrolled ? "py-3" : "py-6"
    )}>
      <div className="container-shell">
        <div className={cn(
          "flex min-h-[80px] items-center justify-between rounded-full px-6 md:px-10 transition-all duration-500 border",
          isScrolled 
            ? "bg-card/90 backdrop-blur-xl border-border shadow-[0_12px_40px_rgba(0,0,0,0.12)] py-2" 
            : "bg-card/60 backdrop-blur-md border-border/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-2"
        )}>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-4 group">
              <div className={cn(
                "overflow-hidden rounded-2xl p-1.5 transition-all duration-500 shadow-sm bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/10"
              )}>
                <Image
                  src={companyConfig.logoPath}
                  alt={companyConfig.name}
                  width={80}
                  height={55}
                  className="h-10 w-auto object-contain dark:brightness-200 dark:contrast-125 dark:mix-blend-lighten"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] transition-colors duration-500 text-blue-500">
                  Pennsylvania
                </p>
                <span className="text-base font-bold tracking-tight transition-colors duration-500 text-foreground">
                  USA Pools Services LLC
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-6 xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-105 text-muted-foreground hover:text-blue-500 whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 xl:flex">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-muted shrink-0"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <div className="h-8 w-px bg-border/50 mx-2" />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Welcome back,</span>
                  <span className="text-sm font-bold text-foreground">
                    {user.user_metadata?.full_name || user.user_metadata?.first_name || 'VIP Member'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200/20 bg-rose-500/10 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-blue-500 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>

                <Link
                  href="/register"
                  className="water-button gap-2.5 px-6 py-3 whitespace-nowrap shrink-0"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-5 xl:hidden">
            <button
              onClick={toggleTheme}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 border-border bg-card text-foreground"
              aria-label="Open menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="container-shell xl:hidden">
          <div className="mt-4 rounded-[32px] px-6 py-8 border shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95 bg-card border-border">
            <div className="space-y-4">
              {user && (
                <div className="mb-6 flex items-center gap-4 rounded-2xl bg-blue-500/10 p-4 border border-blue-500/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white font-bold">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Welcome back,</p>
                    <p className="text-base font-bold text-foreground">
                      {user.user_metadata?.full_name || user.user_metadata?.first_name || 'VIP Member'}
                    </p>
                  </div>
                </div>
              )}
              
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-2xl px-4 py-4 text-base font-bold transition-all text-foreground hover:bg-muted"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-6 grid grid-cols-2 gap-4 border-t border-border">
                {user ? (
                  <button
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-rose-200/20 bg-rose-500/10 py-4 text-sm font-black uppercase tracking-widest text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 py-4 text-sm font-black uppercase tracking-widest text-foreground"
                    >
                      <LogIn className="h-4 w-4" /> Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="water-button py-4 text-sm"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
              <a
                href={`tel:${companyConfig.phoneDigits}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500/10 py-4 text-sm font-black uppercase tracking-widest text-blue-500 border border-blue-500/20"
              >
                <Phone className="h-4 w-4" /> {companyConfig.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

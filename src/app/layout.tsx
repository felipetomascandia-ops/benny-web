import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "USA Pools Services LLC | Luxury Pool Builders In Pennsylvania",
  description:
    "Custom pool construction, remodeling, maintenance, and premium backyard transformations in Pennsylvania. Built for trust, elegance, and fast contact.",
  icons: {
    icon: "/logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", "font-sans", geist.variable)}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}

import Image from "next/image";
import { Sparkles, MessageCircle } from "lucide-react";
import Link from "next/link";
import { buildWhatsAppUrl } from "@/lib/site-config";

export default function Offers() {
  const regularOffers = [
    {
      id: 1,
      src: "/oferta1a.png",
      alt: "Special Offer 1 - USA Pools Services",
    },
    {
      id: 2,
      src: "/oferta2.png",
      alt: "Special Offer 2 - USA Pools Services",
    },
  ];

  const financingOffer = {
    id: 3,
    src: "/best-ofert.png",
    alt: "Pool Financing Offer - USA Pools Services",
  };

  const financingWhatsAppUrl = buildWhatsAppUrl("Hello! I'm interested in pool financing options.");

  return (
    <section id="offers" className="py-24 bg-gradient-to-b from-card/50 to-background">
      <div className="container-shell">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4">
            Limited Time
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Special Offers
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't miss out on these exclusive deals to transform your backyard.
          </p>
        </div>

        {/* First row: 2 offers */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {regularOffers.map((offer) => (
            <div
              key={offer.id}
              className="group relative overflow-hidden rounded-[32px] border border-border bg-card shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            > 
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-white text-xs font-black uppercase tracking-widest shadow-lg">
                <Sparkles className="w-4 h-4" />
                Hot Offer
              </div>
              
              <Image
                src={offer.src}
                alt={offer.alt}
                width={800}
                height={600}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </div>
          ))}
        </div>

        {/* Second row: centered financing offer */}
        <div className="flex justify-center">
          <div className="group relative w-full md:w-2/3 overflow-hidden rounded-[32px] border border-border bg-card shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"> 
            <Image
              src={financingOffer.src}
              alt={financingOffer.alt}
              width={800}
              height={600}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="p-4 border-t border-border bg-white">
              <Link
                href={financingWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-full bg-emerald-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-emerald-400 hover:-translate-y-1 hover:shadow-emerald-500/40"
              >
                <MessageCircle className="h-5 w-5" />
                Contact for Pool Financing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

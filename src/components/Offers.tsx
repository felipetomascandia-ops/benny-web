import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function Offers() {
  const offers = [
    {
      id: 1,
      src: "/oferta1.png",
      alt: "Special Offer 1 - USA Pools Services",
    },
    {
      id: 2,
      src: "/oferta2.png",
      alt: "Special Offer 2 - USA Pools Services",
    },
  ];

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

        <div className="grid md:grid-cols-2 gap-8">
          {offers.map((offer) => (
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
      </div>
    </section>
  );
}

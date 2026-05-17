"use client";

import Image from "next/image";

const brands = [
  { name: "Hayward", logo: "/marcas/hayward.png" },
  { name: "Pentair", logo: "/marcas/pentairpool.png" },
  { name: "Jandy", logo: "/marcas/jandy.png" },
  { name: "Diamond Brite", logo: "/marcas/diamongbrite.png" },
  { name: "River Rok", logo: "/marcas/riverrok.png" },
];

export default function Brands() {
  return (
    <section className="py-12 bg-white border-y border-slate-50">
      <div className="container-shell">
        <div className="text-center mb-8">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Our Partners</p>
          <h2 className="text-2xl font-bold text-slate-900">Trusted by Industry Leading Brands</h2>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
          {brands.map((brand) => (
            <div key={brand.name} className="relative w-32 h-16 md:w-40 md:h-20 grayscale hover:grayscale-0 transition-all duration-300">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

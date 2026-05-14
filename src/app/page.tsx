import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Reviews from "@/components/Reviews";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main id="top" className="min-h-screen overflow-x-clip">
      <Navbar />
      <Hero />
      <Services />
      <Reviews />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}

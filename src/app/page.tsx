"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import Reviews from "@/components/Reviews";
import PoolVisualizer from "@/components/PoolVisualizer";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Bubbles from "@/components/Bubbles";
import JobNotification from "@/components/JobNotification";
import { motion, Variants } from "framer-motion";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export default function Home() {
  return (
    <main id="top" className="min-h-screen overflow-x-clip bg-background relative">
      <Bubbles />
      <Navbar />
      <JobNotification />
      <div className="relative z-10">
        <Hero />
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}>
          <Brands />
        </motion.div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}>
          <Portfolio />
        </motion.div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}>
          <Services />
        </motion.div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}>
          <PoolVisualizer />
        </motion.div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}>
          <Reviews />
        </motion.div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}>
          <Contact />
        </motion.div>
        
        <Footer />
      </div>
      <WhatsAppButton />
    </main>
  );
}

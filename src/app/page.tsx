"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Offers from "@/components/Offers";
import Brands from "@/components/Brands";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import Reviews from "@/components/Reviews";
import PoolVisualizer from "@/components/PoolVisualizer";
import FinishColors from "@/components/FinishColors";
import SocialFollow from "@/components/SocialFollow";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main id="top" className="min-h-screen overflow-x-clip bg-background relative">
      <Bubbles />
      {!isModalOpen && <Navbar />}
      <JobNotification />
      <div className="relative z-10">
        <Hero />
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}>
          <Offers />
        </motion.div>
        
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
          <FinishColors onModalChange={setIsModalOpen} />
        </motion.div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}>
          <Reviews />
        </motion.div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariants}>
          <SocialFollow />
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

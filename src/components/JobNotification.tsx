"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, X, Send, User, Phone, Mail, Calendar } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/site-config";

export default function JobNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    // Mostrar la notificación después de 5 segundos
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = [
      `*Job Application - USA Pools Services LLC*`,
      ``,
      `Hello, I am interested in working with you in Pennsylvania.`,
      ``,
      `*Details:*`,
      `Name: ${formData.firstName} ${formData.lastName}`,
      `Age: ${formData.age}`,
      `Phone: +1 ${formData.phone}`,
      `Email: ${formData.email}`,
      ``,
      `Please contact me for more information.`,
    ].join("\n");

    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    setShowModal(false);
    setShowNotification(false);
  };

  return (
    <>
      {/* Botón flotante / Notificación */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed bottom-32 right-6 z-[60] max-w-sm"
          >
            <div className="bg-card rounded-3xl shadow-2xl border border-border p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
              <button 
                onClick={() => setShowNotification(false)}
                className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-rose-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-foreground pr-4 uppercase tracking-tight">Looking for a job in PA?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    We are hiring! Join the USA Pools Services LLC team.
                  </p>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="mt-4 text-sm font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 flex items-center gap-1 group/btn"
                  >
                    Apply now <Send className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal del Formulario */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-border"
            >
              <div className="px-8 py-8 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Join our Team</h3>
                  <p className="text-sm text-muted-foreground font-medium">Apply to work in Pennsylvania</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-3 text-muted-foreground hover:text-rose-500 transition-colors rounded-2xl hover:bg-rose-500/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <User className="w-3 h-3 text-blue-500" /> First Name
                    </label>
                    <input
                      required
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-muted/20 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <User className="w-3 h-3 text-blue-500" /> Last Name
                    </label>
                    <input
                      required
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-muted/20 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-blue-500" /> Age
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full bg-muted/20 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-blue-500" /> Phone Number
                    </label>
                    <div className="flex">
                      <div className="bg-muted border border-r-0 border-border rounded-l-2xl px-4 flex items-center text-muted-foreground text-sm font-black">
                        +1
                      </div>
                      <input
                        required
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="flex-1 bg-muted/20 border border-border rounded-r-2xl px-5 py-4 text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-blue-500" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-muted/20 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="water-button w-full h-14"
                >
                  Send Application <Send className="ml-2 w-5 h-5" />
                </button>
                <p className="text-[10px] text-muted-foreground text-center italic font-medium">
                  Clicking send will open WhatsApp to deliver your information directly.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

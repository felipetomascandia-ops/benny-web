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
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
              <button 
                onClick={() => setShowNotification(false)}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 pr-4">Looking for a job in PA?</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    We are hiring! Join the USA Pools Services LLC team.
                  </p>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Join our Team</h3>
                  <p className="text-sm text-slate-500">Apply to work in Pennsylvania</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User className="w-3 h-3" /> First Name
                    </label>
                    <input
                      required
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Last Name
                    </label>
                    <input
                      required
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Age
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> Phone Number
                    </label>
                    <div className="flex">
                      <div className="bg-slate-100 border border-r-0 border-slate-100 rounded-l-2xl px-3 flex items-center text-slate-500 text-sm font-bold">
                        +1
                      </div>
                      <input
                        required
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-r-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  Send Application <Send className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-slate-400 text-center italic">
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

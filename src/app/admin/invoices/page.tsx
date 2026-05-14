"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { LoaderCircle, LogOut, Plus, Trash2, Download, Send, RefreshCw, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

import { buildWhatsAppUrl, companyConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

function digitsOnly(input: string) {
  return input.replace(/\D/g, "");
}

function generateEstimateNumber() {
  const date = format(new Date(), "yyyyMMdd");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `EST-${date}-${rand}`;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [estimateNumber, setEstimateNumber] = useState(generateEstimateNumber);
  const [estimateDate, setEstimateDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [companyEmail, setCompanyEmail] = useState(companyConfig.email);
  const [companyPhone, setCompanyPhone] = useState(companyConfig.phoneDisplay);

  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    setItems([{ id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 }]);
  }, []);
  const [notes, setNotes] = useState("Estimated pricing. Final pricing may vary after on-site inspection.");

  const [sendToPhone, setSendToPhone] = useState("");
  const [countryCode, setCountryCode] = useState("1"); // Default to USA (+1)
  const [isWorking, setIsWorking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lastPublicUrl, setLastPublicUrl] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [items]);

  const payload = useMemo(
    () => ({
      estimateNumber,
      estimateDate,
      companyEmail,
      companyPhone,
      clientFirstName,
      clientLastName,
      clientPhone,
      clientEmail,
      clientAddress,
      items,
      estimateAmount: subtotal.toString(),
      notes,
    }),
    [
      companyEmail,
      companyPhone,
      clientAddress,
      clientEmail,
      clientFirstName,
      clientLastName,
      clientPhone,
      items,
      subtotal,
      estimateDate,
      estimateNumber,
      notes,
    ],
  );

  async function handleLogout() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  function addItem() {
    setItems([...items, { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(id: string) {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  }

  function updateItem(id: string, field: keyof InvoiceItem, value: string | number) {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  }

  function buildInvoiceMessage(url: string) {
    const clientName = `${clientFirstName} ${clientLastName}`.trim();
    return [
      `*USA Pools Services LLC - Estimate*`,
      ``,
      `Hello ${clientName || "valued client"},`,
      `We have prepared your estimate *${estimateNumber}*.`,
      ``,
      `*Summary:*`,
      `Estimated Total: *$${subtotal.toLocaleString()}*`,
      ``,
      `You can view and download the PDF document here:`,
      url,
      ``,
      `If you have any questions, feel free to reply to this message.`,
    ].join("\n");
  }

  async function downloadPdf() {
    setIsWorking(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/invoices?mode=download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        setFeedback({ type: "error", message: err.error || "Could not generate the PDF." });
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${estimateNumber}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setFeedback({ type: "success", message: "PDF downloaded." });
    } catch {
      setFeedback({ type: "error", message: "Could not generate the PDF." });
    } finally {
      setIsWorking(false);
    }
  }

  async function uploadAndGetLink() {
    setIsWorking(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as { publicUrl?: string; error?: string };

      if (!response.ok || !result.publicUrl) {
        setFeedback({ type: "error", message: result.error || "Could not upload the PDF." });
        setLastPublicUrl(null);
        return null;
      }

      setLastPublicUrl(result.publicUrl);
      setFeedback({ type: "success", message: "PDF uploaded. Link ready." });
      return result.publicUrl;
    } catch {
      setFeedback({ type: "error", message: "Could not upload the PDF." });
      setLastPublicUrl(null);
      return null;
    } finally {
      setIsWorking(false);
    }
  }

  async function sendViaWhatsApp() {
    let digits = digitsOnly(sendToPhone || clientPhone);
    if (!digits) {
      setFeedback({ type: "error", message: "Enter a phone number to send to." });
      return;
    }

    // Si el número no empieza con el código de país seleccionado, lo agregamos
    // (A menos que el usuario ya haya escrito un número largo con código incluido)
    if (digits.length <= 10) {
      digits = countryCode + digits;
    }

    const url = lastPublicUrl || (await uploadAndGetLink());
    if (!url) return;

    const message = buildInvoiceMessage(url);
    window.open(buildWhatsAppUrl(message, digits), "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-widest mb-1">
                <FileText className="w-4 h-4" />
                Admin Panel
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Professional Invoices</h1>
              <p className="text-slate-500 mt-1">Create and manage professional estimates for your clients.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <Link
                  href="/admin"
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors rounded-xl"
                >
                  Bookings
                </Link>
                <Link
                  href="/admin/invoices"
                  className="px-5 py-2.5 text-sm font-semibold bg-white text-blue-600 shadow-sm rounded-xl"
                >
                  Invoices
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {feedback && (
            <div className={cn(
              "mx-8 mt-6 px-4 py-3 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2",
              feedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
            )}>
              {feedback.message}
            </div>
          )}

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column: Form */}
              <div className="lg:col-span-2 space-y-10">
                {/* Basic Info */}
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">01</span>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Estimate Number</label>
                      <div className="relative">
                        <input
                          value={estimateNumber}
                          onChange={(e) => setEstimateNumber(e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <button 
                          onClick={() => setEstimateNumber(generateEstimateNumber())}
                          className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Date</label>
                      <input
                        type="date"
                        value={estimateDate}
                        onChange={(e) => setEstimateDate(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* Client Info */}
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">02</span>
                    Client Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">First Name</label>
                      <input
                        placeholder="John"
                        value={clientFirstName}
                        onChange={(e) => setClientFirstName(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Last Name</label>
                      <input
                        placeholder="Doe"
                        value={clientLastName}
                        onChange={(e) => setClientLastName(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Email</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Phone</label>
                      <input
                        placeholder="+1 (555) 000-0000"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Address</label>
                      <input
                        placeholder="123 Pool St, Pennsylvania, USA"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* Items Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">03</span>
                      Line Items
                    </h3>
                    <button 
                      onClick={addItem}
                      className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="group relative bg-slate-50 rounded-2xl p-6 transition-all hover:bg-slate-100/80">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          <div className="md:col-span-6 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                            <input
                              placeholder="Pool cleaning service..."
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 placeholder:text-slate-300"
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0"
                            />
                          </div>
                          <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</label>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 text-sm">$</span>
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-1 flex items-end justify-end">
                            <button 
                              onClick={() => removeItem(item.id)}
                              disabled={items.length === 1}
                              className="p-2 text-slate-300 hover:text-rose-500 disabled:opacity-0 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">04</span>
                    Additional Notes
                  </h3>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    placeholder="Notes visible to the client..."
                  />
                </section>
              </div>

              {/* Right Column: Summary & Actions */}
              <div className="space-y-8">
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 sticky top-8">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    Summary
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-slate-400 text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-sm">
                      <span>Tax (0%)</span>
                      <span>$0</span>
                    </div>
                    <div className="h-px bg-slate-800 my-4" />
                    <div className="flex justify-between items-end">
                      <span className="font-medium">Total Amount</span>
                      <span className="text-3xl font-bold text-blue-400">${subtotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={downloadPdf}
                      disabled={isWorking}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                      {isWorking ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> Download PDF</>}
                    </button>
                    
                    <div className="h-px bg-slate-800 my-2" />
                    
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-white/60">Send to Client</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-slate-800 border-none rounded-xl px-2 py-3 text-sm focus:ring-1 focus:ring-blue-500 transition-all text-white w-24 shrink-0"
                          >
                            <option value="1">🇺🇸 +1</option>
                            <option value="57">🇨🇴 +57</option>
                            <option value="54">🇦🇷 +54</option>
                            <option value="52">🇲🇽 +52</option>
                            <option value="34">🇪🇸 +34</option>
                            <option value="58">🇻🇪 +58</option>
                            <option value="56">🇨🇱 +56</option>
                            <option value="51">🇵🇪 +51</option>
                            <option value="593">🇪🇨 +593</option>
                            <option value="507">🇵🇦 +507</option>
                            <option value="506">🇨🇷 +506</option>
                            <option value="1">🇵🇷 +1</option>
                            <option value="1">🇩🇴 +1</option>
                          </select>
                          <input
                            placeholder={clientPhone || "Phone number"}
                            value={sendToPhone}
                            onChange={(e) => setSendToPhone(e.target.value)}
                            className="flex-1 min-w-0 bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 transition-all text-white"
                          />
                        </div>
                        
                        <button
                          onClick={sendViaWhatsApp}
                          disabled={isWorking}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                          {isWorking ? (
                            <LoaderCircle className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Send via WhatsApp
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 italic leading-relaxed">
                        Selecciona el país y escribe el número. Si el número ya incluye el código, el sistema lo detectará automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

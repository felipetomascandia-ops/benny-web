"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { addDays, format } from "date-fns";
import { LoaderCircle, LogOut, Plus, Trash2, Download, Send, RefreshCw, FileText, Mail } from "lucide-react";
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
  poolSize: string;
  unitPrice: number;
}

interface PaymentStep {
  id: string;
  description: string;
  amount: number;
}

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [estimateNumber, setEstimateNumber] = useState(generateEstimateNumber);
  const [estimateDate, setEstimateDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [validUntil, setValidUntil] = useState(format(addDays(new Date(), 14), "yyyy-MM-dd"));
  const [companyEmail, setCompanyEmail] = useState(companyConfig.email);
  const [companyPhone, setCompanyPhone] = useState(companyConfig.phoneDisplay);

  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>([]);

  useEffect(() => {
    setItems([{ id: crypto.randomUUID(), description: "", poolSize: "", unitPrice: 0 }]);
    setPaymentSteps([{ id: crypto.randomUUID(), description: "First Payment / Deposit", amount: 0 }]);
  }, []);

  const [notes, setNotes] = useState("Estimated pricing. Final pricing may vary after on-site inspection.");
  const [terms, setTerms] = useState(
    "Scheduling begins after estimate approval and receipt of the required deposit. Final pricing may change if site conditions, measurements, materials, or scope requirements differ from the information currently available.",
  );
  const [depositAmount, setDepositAmount] = useState("0");
  const [preparedBy, setPreparedBy] = useState("USA Pools Sales Team");
  const [acceptanceName, setAcceptanceName] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState("");

  const [sendToPhone, setSendToPhone] = useState("");
  const [sendToEmail, setSendToEmail] = useState("");
  const [countryCode, setCountryCode] = useState("1"); // Default to USA (+1)
  const [isWorking, setIsWorking] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lastPublicUrl, setLastPublicUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPrice, 0);
  }, [items]);

  useEffect(() => {
    setSendToEmail((currentValue) => currentValue || clientEmail);
  }, [clientEmail]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const payload = useMemo(
    () => ({
      estimateNumber,
      estimateDate,
      validUntil,
      companyEmail,
      companyPhone,
      clientFirstName,
      clientLastName,
      clientPhone,
      clientEmail,
      clientAddress,
      items,
      estimateAmount: subtotal.toString(),
      depositAmount,
      paymentSteps,
      preparedBy,
      acceptanceName,
      acceptanceDate,
      notes,
      terms,
    }),
    [
      acceptanceDate,
      acceptanceName,
      companyEmail,
      companyPhone,
      clientAddress,
      clientEmail,
      clientFirstName,
      clientLastName,
      clientPhone,
      depositAmount,
      paymentSteps,
      items,
      estimateDate,
      estimateNumber,
      notes,
      preparedBy,
      subtotal,
      terms,
      validUntil,
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
    setItems([...items, { id: crypto.randomUUID(), description: "", poolSize: "", unitPrice: 0 }]);
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

  function addPaymentStep() {
    setPaymentSteps([...paymentSteps, { id: crypto.randomUUID(), description: "", amount: 0 }]);
  }

  function removePaymentStep(id: string) {
    if (paymentSteps.length === 1) return;
    setPaymentSteps(paymentSteps.filter(step => step.id !== id));
  }

  function updatePaymentStep(id: string, field: keyof PaymentStep, value: string | number) {
    setPaymentSteps(paymentSteps.map(step => {
      if (step.id === id) {
        return { ...step, [field]: value };
      }
      return step;
    }));
  }

  function buildEstimateMessage(url: string) {
    const clientName = `${clientFirstName} ${clientLastName}`.trim();
    return [
      `*USA Pools Services LLC - Premium Estimate*`,
      ``,
      `Hello ${clientName || "valued client"},`,
      `We have prepared your estimate *${estimateNumber}* for review.`,
      ``,
      `*Summary:*`,
      `Estimated Total: *$${subtotal.toLocaleString()}*`,
      `Required Deposit: *$${Number(depositAmount).toLocaleString()}*`,
      `Valid Until: *${validUntil}*`,
      ``,
      `View and download the PDF document here:`,
      url,
      ``,
      `If you have any questions, feel free to reply to this message or contact us directly.`,
    ].join("\n");
  }

  async function refreshPreview() {
    setIsPreviewLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/invoices?mode=download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        setFeedback({ type: "error", message: err.error || "Could not generate the PDF preview." });
        return;
      }

      const blob = await response.blob();
      const nextPreviewUrl = URL.createObjectURL(blob);
      setPreviewUrl((currentValue) => {
        if (currentValue) {
          URL.revokeObjectURL(currentValue);
        }
        return nextPreviewUrl;
      });
    } catch {
      setFeedback({ type: "error", message: "Could not generate the PDF preview." });
    } finally {
      setIsPreviewLoading(false);
    }
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

    const message = buildEstimateMessage(url);
    window.open(buildWhatsAppUrl(message, digits), "_blank", "noopener,noreferrer");
  }

  async function sendViaEmail() {
    const recipient = (sendToEmail || clientEmail).trim();

    if (!recipient) {
      setFeedback({ type: "error", message: "Enter an email address to send the estimate to." });
      return;
    }

    setIsWorking(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/invoices?mode=email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          sendToEmail: recipient,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as { publicUrl?: string; message?: string; error?: string };

      if (!response.ok) {
        setFeedback({ type: "error", message: result.error || "Could not send the estimate by email." });
        return;
      }

      if (result.publicUrl) {
        setLastPublicUrl(result.publicUrl);
      }

      setFeedback({ type: "success", message: result.message || "Estimate emailed successfully." });
    } catch {
      setFeedback({ type: "error", message: "Could not send the estimate by email." });
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <main className="min-h-screen bg-white py-16 text-slate-900">
      <div className="container-shell">
        <div className="soft-card overflow-hidden border border-slate-200 shadow-xl">
          <div className="border-b border-slate-200 bg-white px-6 py-8 md:px-10">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="shrink-0">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-blue-600">Admin Panel</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 uppercase">
                  Estimates <span className="text-blue-600">& Billing</span>
                </h1>
                <p className="mt-2 text-base text-slate-600 font-medium">
                  Generate professional quotes for your pool projects.
                </p>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:flex-wrap xl:justify-end">
                {/* Navigation Links */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50 shadow-sm"
                  >
                    Appointments
                  </Link>
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50 shadow-sm"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/invoices"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                  >
                    Estimates
                  </Link>
                </div>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 shrink-0 shadow-sm"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {feedback && (
            <div className={cn(
              "mx-8 mt-6 px-6 py-4 rounded-2xl text-base font-bold animate-in fade-in slide-in-from-top-2",
              feedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
            )}>
              {feedback.message}
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Left Column: Form */}
              <div className="lg:col-span-2 space-y-16">
                {/* Basic Info */}
                <section>
                  <h3 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-lg">01</span>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Estimate Number</label>
                      <div className="relative">
                        <input
                          value={estimateNumber}
                          onChange={(e) => setEstimateNumber(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        />
                        <button 
                          onClick={() => setEstimateNumber(generateEstimateNumber())}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Date</label>
                      <input
                        type="date"
                        value={estimateDate}
                        onChange={(e) => setEstimateDate(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Valid Until</label>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Prepared By</label>
                      <input
                        value={preparedBy}
                        onChange={(e) => setPreparedBy(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        placeholder="USA Pools Sales Team"
                      />
                    </div>
                  </div>
                </section>

                {/* Client Info */}
                <section>
                  <h3 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-lg">02</span>
                    Client Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">First Name</label>
                      <input
                        placeholder="First Name"
                        value={clientFirstName}
                        onChange={(e) => setClientFirstName(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Last Name</label>
                      <input
                        placeholder="Last Name"
                        value={clientLastName}
                        onChange={(e) => setClientLastName(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Email</label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Phone</label>
                      <input
                        placeholder="+1 (555) 000-0000"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Address</label>
                      <input
                        placeholder="Property Address"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </section>

                {/* Items Section */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-950 flex items-center gap-3 uppercase tracking-tight">
                      <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-lg">03</span>
                      Project Items
                    </h3>
                    <button 
                      onClick={addItem}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-blue-600 text-sm font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-200"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-8">
                    {items.map((item, index) => (
                      <div key={item.id} className="group relative bg-white border-2 border-slate-100 rounded-[32px] p-8 transition-all hover:border-blue-200 hover:shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                          <div className="md:col-span-12 space-y-3">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex justify-between">
                              Description / Scope of Work
                              <button 
                                onClick={() => removeItem(item.id)}
                                disabled={items.length === 1}
                                className="text-rose-500 hover:text-rose-600 disabled:opacity-0 transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Describe the pool construction or cleaning service in detail..."
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            />
                          </div>
                          <div className="md:col-span-6 space-y-3">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Size of Pool</label>
                            <input
                              placeholder="e.g. 20x40 ft"
                              value={item.poolSize}
                              onChange={(e) => updateItem(item.id, 'poolSize', e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                          </div>
                          <div className="md:col-span-6 space-y-3">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Total Price for this Item</label>
                            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-5 py-4">
                              <span className="text-slate-400 text-xl font-black">$</span>
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent border-none p-0 text-xl font-black focus:ring-0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Payment Schedule */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-950 flex items-center gap-3 uppercase tracking-tight">
                      <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-lg">04</span>
                      Payment Schedule
                    </h3>
                    <button 
                      onClick={addPaymentStep}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-blue-600 text-sm font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-200"
                    >
                      <Plus className="w-4 h-4" /> Add Payment
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {paymentSteps.map((step, index) => (
                      <div key={step.id} className="flex flex-col md:flex-row gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Description</label>
                          <input
                            placeholder="e.g. Upon project completion"
                            value={step.description}
                            onChange={(e) => updatePaymentStep(step.id, 'description', e.target.value)}
                            className="w-full bg-transparent border-none p-0 text-base font-bold focus:ring-0"
                          />
                        </div>
                        <div className="w-full md:w-48 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount ($)</label>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">$</span>
                            <input
                              type="number"
                              min="0"
                              value={step.amount}
                              onChange={(e) => updatePaymentStep(step.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent border-none p-0 text-base font-black focus:ring-0"
                            />
                            <button 
                              onClick={() => removePaymentStep(step.id)}
                              disabled={paymentSteps.length === 1}
                              className="text-slate-300 hover:text-rose-500 disabled:opacity-0 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Deposit Amount</label>
                      <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                        <span className="text-slate-400 text-xl font-black">$</span>
                        <input
                          type="number"
                          min="0"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-xl font-black focus:ring-0"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Acceptance Date</label>
                      <input
                        type="date"
                        value={acceptanceDate}
                        onChange={(e) => setAcceptanceDate(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Client Name for Approval</label>
                      <input
                        value={acceptanceName}
                        onChange={(e) => setAcceptanceName(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                        placeholder="Client printed name"
                      />
                    </div>
                  </div>
                </section>

                {/* Terms & Notes */}
                <section>
                  <h3 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-lg">05</span>
                    Terms & Notes
                  </h3>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Additional Notes</label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-sm"
                        placeholder="Notes visible to the client..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Terms & Conditions</label>
                      <textarea
                        rows={5}
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-sm"
                        placeholder="Terms and conditions shown in the estimate..."
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Summary & Actions */}
              <div className="space-y-8">
                <div className="bg-slate-950 rounded-[40px] p-10 text-white shadow-2xl sticky top-8 border border-white/10">
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-3 uppercase tracking-tight">
                    Summary
                  </h3>
                  
                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between text-slate-400 text-base font-bold uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-white">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-base font-bold uppercase tracking-widest">
                      <span>Deposit</span>
                      <span className="text-white">-${Number(depositAmount).toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-white/10 my-6" />
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-black uppercase tracking-widest text-blue-400">Total Estimate</span>
                      <span className="text-4xl font-black text-white">${subtotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        refreshPreview();
                        setShowPreviewModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                    >
                      <FileText className="w-5 h-5" /> Preview PDF
                    </button>

                    <button
                      onClick={downloadPdf}
                      disabled={isWorking}
                      className="w-full flex items-center justify-center gap-3 py-5 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all disabled:opacity-50 border border-white/10"
                    >
                      {isWorking ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> Download PDF</>}
                    </button>
                    
                    <div className="h-px bg-white/10 my-4" />
                    
                    <div className="space-y-6">
                      <label className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Send to Client</label>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-4 text-sm font-bold focus:ring-1 focus:ring-blue-500 transition-all text-white w-24 shrink-0"
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
                          </select>
                          <input
                            placeholder={clientPhone || "Phone number"}
                            value={sendToPhone}
                            onChange={(e) => setSendToPhone(e.target.value)}
                            className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-lg font-bold focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-white/20"
                          />
                        </div>
                        
                        <button
                          onClick={sendViaWhatsApp}
                          disabled={isWorking}
                          className="w-full h-16 flex items-center justify-center gap-3 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                        >
                          {isWorking ? (
                            <LoaderCircle className="w-6 h-6 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Send WhatsApp
                            </>
                          )}
                        </button>
                      </div>

                      <div className="h-px bg-white/10 my-2" />

                      <div className="space-y-4">
                        <input
                          type="email"
                          placeholder={clientEmail || "client@email.com"}
                          value={sendToEmail}
                          onChange={(e) => setSendToEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-lg font-bold focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-white/20"
                        />

                        <button
                          onClick={sendViaEmail}
                          disabled={isWorking}
                          className="w-full h-16 flex items-center justify-center gap-3 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                        >
                          {isWorking ? (
                            <LoaderCircle className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Mail className="w-5 h-5" />
                              Send via Email
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-500 italic leading-relaxed">
                        WhatsApp opens a ready message with the hosted PDF link. Email sends the PDF attachment directly from the server.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Estimate Preview</h3>
                <p className="text-sm text-slate-500">{estimateNumber}.pdf</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshPreview}
                  disabled={isPreviewLoading}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
                  title="Refresh Preview"
                >
                  <RefreshCw className={cn("w-5 h-5", isPreviewLoading && "animate-spin")} />
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-100 p-4 md:p-8 overflow-hidden flex items-center justify-center relative">
              {isPreviewLoading ? (
                <div className="flex flex-col items-center gap-4 text-slate-500">
                  <LoaderCircle className="w-12 h-12 animate-spin text-blue-600" />
                  <p className="font-medium">Generating preview...</p>
                </div>
              ) : previewUrl ? (
                <iframe 
                  src={`${previewUrl}#toolbar=0`} 
                  className="w-full h-full rounded-xl border border-slate-200 shadow-sm"
                  title="Invoice Preview"
                />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No preview generated yet.</p>
                  <button
                    onClick={refreshPreview}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    Generate Preview
                  </button>
                </div>
              )}
            </div>
            
            <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-4">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close
              </button>
              <button
                onClick={downloadPdf}
                disabled={isWorking}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                {isWorking ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4" /> Download PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

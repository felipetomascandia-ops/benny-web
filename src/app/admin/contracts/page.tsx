"use client";

import { useState } from "react";
import { Download, LoaderCircle, LogOut, MessageCircle, X, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { companyConfig } from "@/lib/site-config";

export default function AdminContractsPage() {
  const router = useRouter();

  const [contractTitle, setContractTitle] = useState("Summer Full Season");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [customFrequency, setCustomFrequency] = useState("");
  const [services, setServices] = useState<string[]>(["pool-cleaning", "chemical-testing", "pool-vacuuming", "we-provide-chemicals", "pool-opening-closing"]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [price, setPrice] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sendToEmail, setSendToEmail] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [generatedPdfBase64, setGeneratedPdfBase64] = useState<string | null>(null);
  const [generatedFileName, setGeneratedFileName] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saveToBucket, setSaveToBucket] = useState(false);

  function handleLogout() {
    if (typeof window !== "undefined") {
      document.cookie = "basic-auth=; path=/; max-age=0";
      router.push("/");
    }
  }

  function toggleService(service: string) {
    setServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  async function generateContract() {
    setIsGenerating(true);
    setError(null);
    setGeneratedPdfBase64(null);
    setGeneratedFileName(null);
    setPublicUrl(null);

    try {
      const payload = {
        contractTitle,
        periodStart,
        periodEnd,
        frequency,
        customFrequency,
        services,
        customerName,
        customerAddress,
        additionalNotes,
        price: Number(price),
        saveToBucket,
      };

      const response = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        pdfBase64?: string;
        fileName?: string;
        publicUrl?: string | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate contract.");
      }

      setGeneratedPdfBase64(data.pdfBase64!);
      setGeneratedFileName(data.fileName!);
      setPublicUrl(data.publicUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadPdf() {
    if (!generatedPdfBase64) return;
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${generatedPdfBase64}`;
    link.download = generatedFileName || "contract.pdf";
    link.click();
  }

  function openWhatsApp() {
    const url = publicUrl || (generatedPdfBase64 ? `data:application/pdf;base64,${generatedPdfBase64}` : "");
    const message = encodeURIComponent(
      `Hello! Here is your pool service contract from ${companyConfig.name}.`
    );
    const cleanedNumber = whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanedNumber}?text=${message}`, "_blank");
  }

  async function sendViaEmail() {
    const recipient = sendToEmail.trim();
    if (!recipient) {
      setFeedback({ type: "error", message: "Enter an email address to send the contract to." });
      return;
    }

    setIsWorking(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/contracts?mode=email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractTitle,
          periodStart,
          periodEnd,
          frequency,
          customFrequency,
          services,
          customerName,
          customerAddress,
          additionalNotes,
          price: Number(price),
          saveToBucket,
          sendToEmail: recipient,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as { publicUrl?: string; message?: string; error?: string };

      if (!response.ok) {
        setFeedback({ type: "error", message: result.error || "Could not send the contract by email." });
        return;
      }

      if (result.publicUrl) {
        setPublicUrl(result.publicUrl);
      }

      setFeedback({ type: "success", message: result.message || "Contract emailed successfully." });
    } catch {
      setFeedback({ type: "error", message: "Could not send the contract by email." });
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-8 md:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
                  ADMIN
                </p>
                <h1 className="text-2xl font-bold text-slate-950">
                  Contracts
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Generate pool service contracts, download as PDF, and share via WhatsApp.
                </p>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:flex-wrap xl:justify-end">
                {/* Navigation Links */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Appointments
                  </Link>
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/pool-closings"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Pool Closings
                  </Link>
                  <Link
                    href="/admin/invoices"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition hover:bg-slate-50"
                  >
                    Invoices
                  </Link>
                  <Link
                    href="/admin/contracts"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                  >
                    Contracts
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-bold">
                {error}
              </div>
            )}
            {feedback && (
              <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-bold ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                {feedback.message}
              </div>
            )}
          </div>

          <div className="px-6 py-8 md:px-10 space-y-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Column: Form */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Contract Details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Configure the contract parameters below.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                      Contract Title
                    </label>
                    <input
                      value={contractTitle}
                      onChange={(e) => setContractTitle(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                      placeholder="Summer Full Season"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                        Period Start
                      </label>
                      <input
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                        Period End
                      </label>
                      <input
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                      Service Frequency
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="weekly"
                          name="frequency"
                          value="weekly"
                          checked={frequency === "weekly"}
                          onChange={() => setFrequency("weekly")}
                          className="h-4 w-4 accent-sky-600"
                        />
                        <label htmlFor="weekly" className="text-sm text-slate-700">
                          Weekly
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="biweekly"
                          name="frequency"
                          value="biweekly"
                          checked={frequency === "biweekly"}
                          onChange={() => setFrequency("biweekly")}
                          className="h-4 w-4 accent-sky-600"
                        />
                        <label htmlFor="biweekly" className="text-sm text-slate-700">
                          Bi-weekly (Every 2 Weeks)
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="custom"
                          name="frequency"
                          value="custom"
                          checked={frequency === "custom"}
                          onChange={() => setFrequency("custom")}
                          className="h-4 w-4 accent-sky-600"
                        />
                        <label htmlFor="custom" className="text-sm text-slate-700">
                          Custom
                        </label>
                        {frequency === "custom" && (
                          <input
                            value={customFrequency}
                            onChange={(e) => setCustomFrequency(e.target.value)}
                            className="ml-2 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                            placeholder="e.g., Once per month"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                      Included Services
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="pool-cleaning"
                          checked={services.includes("pool-cleaning")}
                          onChange={() => toggleService("pool-cleaning")}
                          className="h-4 w-4 accent-sky-600"
                        />
                        <label htmlFor="pool-cleaning" className="text-sm text-slate-700">
                          Pool Cleaning
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="chemical-testing"
                          checked={services.includes("chemical-testing")}
                          onChange={() => toggleService("chemical-testing")}
                          className="h-4 w-4 accent-sky-600"
                        />
                        <label htmlFor="chemical-testing" className="text-sm text-slate-700">
                          Chemical Testing
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="pool-vacuuming"
                          checked={services.includes("pool-vacuuming")}
                          onChange={() => toggleService("pool-vacuuming")}
                          className="h-4 w-4 accent-sky-600"
                        />
                        <label htmlFor="pool-vacuuming" className="text-sm text-slate-700">
                          Pool Vacuuming
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="we-provide-chemicals"
                          checked={services.includes("we-provide-chemicals")}
                          onChange={() => toggleService("we-provide-chemicals")}
                          className="h-4 w-4 accent-sky-600"
                        />
                        <label htmlFor="we-provide-chemicals" className="text-sm text-slate-700">
                          We Provide All Chemicals
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="pool-opening-closing"
                          checked={services.includes("pool-opening-closing")}
                          onChange={() => toggleService("pool-opening-closing")}
                          className="h-4 w-4 accent-sky-600"
                        />
                        <label htmlFor="pool-opening-closing" className="text-sm text-slate-700">
                          Pool Opening & Closing (Seasonal)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Customer Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                      Customer Name
                    </label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                      Customer Address
                    </label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                      rows={3}
                      placeholder="123 Main St, Anytown, USA"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Additional Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                      Additional Notes
                    </label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                      rows={4}
                      placeholder="Any additional terms or notes..."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                      Total Contract Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="save-contract-bucket"
                      checked={saveToBucket}
                      onChange={(e) => setSaveToBucket(e.target.checked)}
                      className="h-4 w-4 accent-sky-600"
                    />
                    <label htmlFor="save-contract-bucket" className="text-sm text-slate-600">
                      Save contract to Supabase storage
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void generateContract()}
                  disabled={isGenerating}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isGenerating ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Generating PDF
                    </>
                  ) : (
                    "Generate Contract"
                  )}
                </button>
              </div>

              {/* Right Column: Preview & Actions */}
              <div className="space-y-8">
                {generatedPdfBase64 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Contract Ready
                        </h2>
                        <p className="text-sm text-slate-500">
                          Download or share via WhatsApp/Email.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedPdfBase64(null);
                          setGeneratedFileName(null);
                          setPublicUrl(null);
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <iframe
                        src={`data:application/pdf;base64,${generatedPdfBase64}`}
                        className="h-[500px] w-full"
                        title="Contract Preview"
                      />
                    </div>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => void downloadPdf()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </button>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                            WhatsApp Number
                          </label>
                          <div className="flex gap-2">
                            <input
                              value={whatsappNumber}
                              onChange={(e) => setWhatsappNumber(e.target.value)}
                              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                              placeholder="+1 555 123 4567"
                            />
                            <button
                              type="button"
                              onClick={() => void openWhatsApp()}
                              disabled={!whatsappNumber.trim()}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Send
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-slate-100 my-2" />

                        <div className="space-y-4">
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                              Email Address
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="email"
                                value={sendToEmail}
                                onChange={(e) => setSendToEmail(e.target.value)}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                                placeholder="client@email.com"
                              />
                              <button
                                type="button"
                                onClick={() => void sendViaEmail()}
                                disabled={isWorking || !sendToEmail.trim()}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                              >
                                {isWorking ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Mail className="h-4 w-4" />
                                )}
                                {isWorking ? "Sending..." : "Send"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {publicUrl && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                            <p className="font-bold">Public URL:</p>
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 underline break-all"
                            >
                              {publicUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50 px-8 py-20 text-center">
                    <div className="rounded-full bg-slate-100 p-4">
                      <Download className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-400">
                      No contract generated yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Fill the form and click "Generate Contract".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

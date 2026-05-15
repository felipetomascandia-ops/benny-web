"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, LoaderCircle, Quote, Star, UploadCloud, User } from "lucide-react";

import { fallbackReviews } from "@/lib/demo-data";
import type { PublicReview } from "@/lib/types";

export default function Reviews() {
  const [reviews, setReviews] = useState<PublicReview[]>(fallbackReviews);
  const [showForm, setShowForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch("/api/reviews", { cache: "no-store" });
        const payload = (await response.json()) as { reviews?: PublicReview[] };

        if (payload.reviews?.length) {
          setReviews(payload.reviews);
        }
      } catch {
        setReviews(fallbackReviews);
      }
    }

    void loadReviews();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("rating", String(selectedRating));
      formData.append("comment", comment);
      photos.forEach((photo) => formData.append("photos", photo));

      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        error?: string;
        review?: PublicReview;
      };

      if (!response.ok || !payload.review) {
        setFeedback({
          type: "error",
          message: payload.error || "We couldn’t submit your review.",
        });
        return;
      }

      setReviews((current) => [payload.review as PublicReview, ...current]);
      setFeedback({
        type: "success",
        message: "Thanks — your review was submitted.",
      });
      setName("");
      setComment("");
      setPhotos([]);
      setSelectedRating(5);
    } catch {
      setFeedback({
        type: "error",
        message: "Something went wrong while submitting your review.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="bg-transparent py-24 text-white">
      <div className="container-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-blue-400">
              Client reviews
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Social proof that builds real trust.
            </h2>
            <p className="mt-6 text-base leading-7 text-slate-300 md:text-lg">
              What our clients say about their new backyard oasis.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex h-14 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-xl shadow-blue-500/20"
          >
            {showForm ? "Close review form" : "Leave a review"}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-12 overflow-hidden"
          >
            <div className="glass-panel p-8 md:p-12 rounded-[32px]">
              <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Your Name
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          className={
                            selectedRating >= star ? "text-yellow-400 p-2" : "text-slate-600 p-2"
                          }
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Your Experience
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Project Photos
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-400">
                          {photos.length > 0 ? `${photos.length} files selected` : "Click to upload photos"}
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                      />
                    </label>
                  </div>
                </div>

                {feedback && (
                  <div className={`p-4 rounded-2xl text-sm font-bold ${
                    feedback.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  }`}>
                    {feedback.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : "Post Review"}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-[32px] flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{review.name}</h4>
                  <div className="flex gap-0.5 text-yellow-400 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 fill-current ${i >= review.rating ? "text-slate-600" : ""}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative mb-6 flex-grow">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-600/20" />
                <p className="relative text-slate-300 leading-relaxed italic">
                  &quot;{review.comment}&quot;
                </p>
              </div>

              {review.photoUrls && review.photoUrls.length > 0 && (
                <div className="mt-auto grid grid-cols-2 gap-2">
                  {review.photoUrls.slice(0, 2).map((photo, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-800">
                      <img src={photo} alt="Project" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

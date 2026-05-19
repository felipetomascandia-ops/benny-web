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
    <section id="reviews" className="bg-transparent py-24 text-foreground">
      <div className="container-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-blue-500">
              Client reviews
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Social proof that builds real trust.
            </h2>
            <p className="mt-6 text-base leading-7 text-muted-foreground md:text-lg">
              What our clients say about their new backyard oasis.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="water-button h-14 px-8"
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
            <div className="bg-card border border-border shadow-lg p-8 md:p-12 rounded-[32px]">
              <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      Your Name
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-muted/20 border border-border rounded-2xl px-4 py-4 text-foreground focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          className={
                            selectedRating >= star ? "text-yellow-400 p-2" : "text-muted-foreground/30 p-2"
                          }
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Your Experience
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-muted/20 border border-border rounded-2xl px-4 py-4 text-foreground focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Project Photos
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted/30 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
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
                    feedback.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  }`}>
                    {feedback.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="water-button w-full h-14"
                >
                  {isSubmitting ? <LoaderCircle className="w-6 h-6 animate-spin" /> : "Submit Review"}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "text-yellow-400 fill-current" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-500/20" />
              </div>
              <p className="text-foreground text-lg italic mb-6 leading-relaxed">
                "{review.comment}"
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted-foreground">Verified Client</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
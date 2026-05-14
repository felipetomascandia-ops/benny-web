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
    <section id="reviews" className="bg-slate-950 py-24 text-white">
      <div className="container-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-sky-300">
              Client reviews
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Social proof that feels credible and high quality.
            </h2>
            <p className="mt-6 text-base leading-7 text-slate-300 md:text-lg">
              The review area now has a stronger layout, better contrast, and a
              cleaner upload form so customers can share feedback with photos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            {showForm ? "Close review form" : "Add your review"}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="glass-panel mt-10 overflow-hidden rounded-[32px]"
          >
            <div className="grid gap-0 lg:grid-cols-[0.75fr_1.25fr]">
              <div className="border-b border-white/10 bg-white/6 p-8 lg:border-b-0 lg:border-r">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
                  Share your experience
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  Help future clients trust your work.
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Visitors can leave a testimonial, add a star rating, and upload project photos.
                </p>

                <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/35 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-sky-300">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-white">
                    Better presentation, more confidence
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Stronger design makes testimonials feel more authentic and valuable.
                  </p>
                </div>
              </div>

              <form className="space-y-5 bg-white p-8 text-slate-950" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setSelectedRating(score)}
                        className="rounded-full p-1"
                        aria-label={`Rate ${score} stars`}
                      >
                        <Star
                          className={`h-7 w-7 ${
                            score <= selectedRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Review</label>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400"
                    rows={4}
                    placeholder="Tell new clients about the service, communication and final result."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Upload photos</label>
                  <label className="flex cursor-pointer items-center justify-between rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-4 transition hover:border-sky-400 hover:bg-sky-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Choose project photos</p>
                        <p className="text-xs text-slate-500">PNG, JPG or WEBP</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(event) => setPhotos(Array.from(event.target.files || []))}
                    />
                    <span className="text-sm font-medium text-sky-600">Browse</span>
                  </label>
                  {photos.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      {photos.length} image(s) selected
                    </p>
                  )}
                </div>
                {feedback && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      feedback.type === "success"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {feedback.message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Submitting review
                    </>
                  ) : (
                    "Submit review"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-white/6 shadow-[0_20px_60px_rgba(3,7,18,0.18)]"
            >
              {review.photoUrls[0] && (
                <div className="h-56 w-full">
                  <img
                    src={review.photoUrls[0]}
                    alt="Pool project"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-7">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                      <User className="h-5 w-5 text-slate-200" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{review.name}</p>
                      <div className="mt-1 flex text-amber-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-sky-300">
                    <Quote className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-300">&quot;{review.comment}&quot;</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
